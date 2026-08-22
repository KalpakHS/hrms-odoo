from datetime import date, datetime, time, timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone

from accounts.models import User
from employees.models import Company, Department, Designation, Employee
from employees.services import create_employee_workflow
from attendance.models import Attendance
from attendance.services import check_in_employee, check_out_employee
from leave.models import LeaveType, LeaveRequest, LeaveBalance
from leave.services import apply_for_leave, approve_leave_request
from payroll.models import SalaryStructure, Payslip
from payroll.services import (
    calculate_salary_components,
    create_or_update_salary_structure,
    generate_payslip,
    update_payment_status,
    generate_payslip_pdf,
)

User = get_user_model()


class EndToEndBackendIntegrationTests(TestCase):
    """
    Step 8 — Full Backend Integration & Verification Tests:
    - Verifies complete end-to-end employee lifecycle across all apps:
      Accounts -> Employees -> Attendance -> Leave -> Payroll.
    - Verifies cross-module database relationships.
    - Verifies strict RBAC and ID tampering protection across all endpoints.
    - Verifies security protections: first-login password enforcement, inactive user lockout, password hashing.
    """

    def setUp(self):
        self.client = Client()

        # 1. Organization Structure
        self.company = Company.objects.create(name='Odoo India', code='OI')
        self.dept_eng = Department.objects.create(name='Engineering', code='ENG')
        self.dept_hr = Department.objects.create(name='Human Resources', code='HR')
        self.desig_dev = Designation.objects.create(title='Backend Developer', department=self.dept_eng)
        self.desig_hr = Designation.objects.create(title='HR Specialist', department=self.dept_hr)

        # 2. Leave Types
        self.annual_leave = LeaveType.objects.create(
            name='Paid Annual Leave',
            code='AL',
            max_days_per_year=Decimal('15.0'),
            is_paid=True,
        )
        self.sick_leave = LeaveType.objects.create(
            name='Sick Leave',
            code='SL',
            max_days_per_year=Decimal('10.0'),
            is_paid=True,
        )

        # 3. Superuser / Admin
        self.admin_user = User.objects.create_superuser(
            login_id='ADMIN0001',
            email='admin@dayflow.com',
            password='AdminPassword123!',
            first_name='Super',
            last_name='Admin',
            role=User.Role.ADMIN,
        )

        # 4. HR User
        self.hr_user = User.objects.create_user(
            login_id='OIHRMG20260001',
            email='hr@dayflow.com',
            password='HrPassword123!',
            first_name='Helen',
            last_name='Rogers',
            role=User.Role.HR,
            must_change_password=False,
            is_first_login=False,
        )
        self.hr_employee = Employee.objects.create(
            user=self.hr_user,
            company=self.company,
            department=self.dept_hr,
            designation=self.desig_hr,
            first_name='Helen',
            last_name='Rogers',
            email='hr@dayflow.com',
            mobile='9876543201',
            joining_date=date(2026, 1, 1),
        )

    # =================================================================
    # 1. COMPLETE END-TO-END BUSINESS WORKFLOW TEST
    # =================================================================

    def test_complete_end_to_end_business_lifecycle(self):
        """
        Tests the entire Dayflow HRMS business flow:
        Onboard -> Temp Password -> Login -> Force Password Change -> Profile
        -> Check In -> Check Out -> Leave Apply -> Leave Approval -> Balance Update
        -> Salary Structure -> Generate Payslip -> View Payslip -> Download PDF.
        """
        # Step A: Admin/HR onboards new employee
        employee, temp_password = create_employee_workflow(
            company=self.company,
            department=self.dept_eng,
            designation=self.desig_dev,
            first_name='Michael',
            last_name='Scott',
            email='michael.scott@dayflow.com',
            mobile='9876543299',
            joining_date=date(2026, 1, 10),
            role=User.Role.EMPLOYEE,
        )
        self.assertEqual(employee.user.login_id, 'OIMISC20260001')
        self.assertTrue(employee.user.must_change_password)
        self.assertTrue(employee.user.is_first_login)

        # Step B: Employee logs in with temporary password
        login_resp = self.client.post(reverse('accounts:login'), {
            'login_id': 'OIMISC20260001',
            'password': temp_password,
        }, follow=True)
        # Must be redirected to mandatory password change
        self.assertRedirects(login_resp, reverse('accounts:password_change'))

        # Step C: Attempt to bypass password change -> blocked by middleware
        dash_resp = self.client.get(reverse('accounts:dashboard'))
        self.assertRedirects(dash_resp, reverse('accounts:password_change'))

        # Step D: Complete mandatory password change
        pwd_resp = self.client.post(reverse('accounts:password_change'), {
            'new_password1': 'MichaelSecure2026!',
            'new_password2': 'MichaelSecure2026!',
        }, follow=True)
        self.assertRedirects(pwd_resp, reverse('accounts:dashboard'))

        employee.user.refresh_from_db()
        self.assertFalse(employee.user.must_change_password)
        self.assertFalse(employee.user.is_first_login)
        self.assertTrue(employee.user.check_password('MichaelSecure2026!'))

        # Step E: Employee checks in
        checkin_resp = self.client.post(reverse('attendance:check_in'), {
            'notes': 'Working from office',
        }, follow=True)
        self.assertEqual(checkin_resp.status_code, 200)
        today = timezone.localdate()
        att = Attendance.objects.get(employee=employee, date=today)
        self.assertIsNotNone(att.check_in)
        self.assertIsNone(att.check_out)

        # Step F: Employee checks out
        checkout_resp = self.client.post(reverse('attendance:check_out'), follow=True)
        self.assertEqual(checkout_resp.status_code, 200)
        att.refresh_from_db()
        self.assertIsNotNone(att.check_out)
        self.assertIsNotNone(att.work_hours)

        # Step G: Employee applies for leave
        apply_resp = self.client.post(reverse('leave:leave_apply'), {
            'leave_type': self.annual_leave.id,
            'start_date': date(2026, 9, 1),
            'end_date': date(2026, 9, 3),
            'reason': 'Vacation trip',
        }, follow=True)
        self.assertRedirects(apply_resp, reverse('leave:my_leave'))

        leave_req = LeaveRequest.objects.get(employee=employee, leave_type=self.annual_leave)
        self.assertEqual(leave_req.total_days, Decimal('3.0'))
        self.assertEqual(leave_req.status, LeaveRequest.Status.PENDING)

        # Initial balance check
        bal = LeaveBalance.objects.get(employee=employee, leave_type=self.annual_leave, year=2026)
        self.assertEqual(bal.used_days, Decimal('0.0'))
        self.assertEqual(bal.remaining_days, Decimal('15.0'))

        # Step H: HR logs in and approves leave
        self.client.login(login_id='OIHRMG20260001', password='HrPassword123!')
        approve_resp = self.client.post(reverse('leave:leave_approve', args=[leave_req.id]), follow=True)
        self.assertEqual(approve_resp.status_code, 200)

        leave_req.refresh_from_db()
        self.assertEqual(leave_req.status, LeaveRequest.Status.APPROVED)
        self.assertEqual(leave_req.approver, self.hr_user)

        bal.refresh_from_db()
        self.assertEqual(bal.used_days, Decimal('3.0'))
        self.assertEqual(bal.remaining_days, Decimal('12.0'))

        # Step I: HR configures salary structure
        salary = create_or_update_salary_structure(
            employee=employee,
            monthly_wage=Decimal('80000.00'),
            effective_from=date(2026, 1, 1),
        )
        self.assertEqual(salary.basic_salary, Decimal('40000.00'))
        self.assertEqual(salary.hra, Decimal('20000.00'))
        self.assertEqual(salary.provident_fund, Decimal('4800.00'))
        self.assertEqual(salary.professional_tax, Decimal('200.00'))
        self.assertEqual(salary.net_salary, Decimal('75000.00'))

        # Step J: HR generates monthly payslip for August 2026
        payslip, created = generate_payslip(employee, month=8, year=2026)
        self.assertTrue(created)
        self.assertEqual(payslip.net_pay, Decimal('75000.00'))

        # Step K: HR updates payment status to PAID
        update_payment_status(
            payslip_id=payslip.id,
            payment_status=Payslip.Status.PAID,
            payment_date=date(2026, 8, 31),
            payment_method='Bank Transfer',
            transaction_id='TXN987654321',
        )
        payslip.refresh_from_db()
        self.assertEqual(payslip.payment_status, Payslip.Status.PAID)

        # Step L: Employee logs in and views own payslip & downloads PDF
        self.client.login(login_id='OIMISC20260001', password='MichaelSecure2026!')
        payslip_view_resp = self.client.get(reverse('payroll:payslip_detail', args=[payslip.id]))
        self.assertEqual(payslip_view_resp.status_code, 200)
        self.assertContains(payslip_view_resp, '75000.00')

        pdf_resp = self.client.get(reverse('payroll:payslip_pdf', args=[payslip.id]))
        self.assertEqual(pdf_resp.status_code, 200)
        self.assertEqual(pdf_resp['Content-Type'], 'application/pdf')
        pdf_data = b''.join(pdf_resp.streaming_content)
        self.assertTrue(len(pdf_data) > 100)

    # =================================================================
    # 2. CROSS-MODULE RELATIONSHIPS & DATA INTEGRITY
    # =================================================================

    def test_cross_module_relationships(self):
        """Verifies foreign key integrity and reverse accessors across all models."""
        emp, _ = create_employee_workflow(
            company=self.company,
            department=self.dept_eng,
            first_name='Jim',
            last_name='Halpert',
            email='jim.halpert@dayflow.com',
            mobile='9876543215',
            joining_date=date(2026, 2, 1),
        )

        # User <-> Employee OneToOne
        self.assertEqual(emp.user.employee_profile, emp)

        # Employee <-> Attendance
        att = check_in_employee(emp, date_val=date(2026, 8, 1))
        self.assertIn(att, emp.attendance_records.all())

        # Employee <-> Leave
        leave = apply_for_leave(emp, self.sick_leave, date(2026, 8, 10), date(2026, 8, 10), 'Sick')
        self.assertIn(leave, emp.leave_requests.all())

        # User <-> Leave Approver
        approve_leave_request(leave.id, self.admin_user, 'Approved')
        leave.refresh_from_db()
        self.assertEqual(leave.approver, self.admin_user)

        # Employee <-> SalaryStructure OneToOne
        salary = create_or_update_salary_structure(emp, Decimal('60000.00'), date(2026, 2, 1))
        self.assertEqual(emp.salary_structure, salary)

        # Employee <-> Payslip ForeignKey
        payslip, _ = generate_payslip(emp, 8, 2026)
        self.assertIn(payslip, emp.payslips.all())

    # =================================================================
    # 3. RBAC & ID TAMPERING SECURITY TESTS ACROSS ALL MODULES
    # =================================================================

    def test_id_tampering_and_object_level_security(self):
        """
        Strictly tests that Employee A cannot access or manipulate Employee B's:
        - Attendance records
        - Leave requests
        - Leave approval
        - Salary structure
        - Payslip detail
        - Payslip PDF
        - Payment status
        """
        emp_a, _ = create_employee_workflow(
            company=self.company,
            department=self.dept_eng,
            first_name='Alice',
            last_name='Walker',
            email='alice.walker@dayflow.com',
            mobile='9876543111',
            joining_date=date(2026, 1, 1),
            custom_password='AlicePassword123!',
        )
        emp_b, _ = create_employee_workflow(
            company=self.company,
            department=self.dept_eng,
            first_name='Bob',
            last_name='Builder',
            email='bob.builder@dayflow.com',
            mobile='9876543222',
            joining_date=date(2026, 1, 1),
            custom_password='BobPassword123!',
        )

        # Set must_change_password = False for direct testing
        emp_a.user.must_change_password = False
        emp_a.user.save()
        emp_b.user.must_change_password = False
        emp_b.user.save()

        # Employee B objects
        att_b = check_in_employee(emp_b, date_val=date(2026, 8, 1))
        leave_b = apply_for_leave(emp_b, self.sick_leave, date(2026, 8, 5), date(2026, 8, 5), 'Fever')
        sal_b = create_or_update_salary_structure(emp_b, Decimal('70000.00'), date(2026, 1, 1))
        payslip_b, _ = generate_payslip(emp_b, 8, 2026)

        # Log in as Employee A
        self.client.login(login_id=emp_a.user.login_id, password='AlicePassword123!')

        # 1. Employee A cannot access Employee B's attendance record
        resp1 = self.client.get(reverse('attendance:attendance_detail', args=[att_b.id]))
        self.assertEqual(resp1.status_code, 403)

        # 2. Employee A cannot access Employee B's leave detail
        resp2 = self.client.get(reverse('leave:leave_detail', args=[leave_b.id]))
        self.assertEqual(resp2.status_code, 403)

        # 3. Employee A cannot approve Employee B's leave
        resp3 = self.client.post(reverse('leave:leave_approve', args=[leave_b.id]))
        self.assertEqual(resp3.status_code, 403)

        # 4. Employee A cannot cancel Employee B's leave
        resp4 = self.client.post(reverse('leave:leave_cancel', args=[leave_b.id]))
        self.assertEqual(resp4.status_code, 403)

        # 5. Employee A cannot view Employee B's salary structure
        resp5 = self.client.get(reverse('payroll:salary_detail', args=[emp_b.id]))
        self.assertEqual(resp5.status_code, 403)

        # 6. Employee A cannot edit Employee B's salary structure
        resp6 = self.client.post(reverse('payroll:salary_edit', args=[emp_b.id]), {'monthly_wage': '100000.00'})
        self.assertEqual(resp6.status_code, 403)

        # 7. Employee A cannot view Employee B's payslip
        resp7 = self.client.get(reverse('payroll:payslip_detail', args=[payslip_b.id]))
        self.assertEqual(resp7.status_code, 403)

        # 8. Employee A cannot download Employee B's payslip PDF
        resp8 = self.client.get(reverse('payroll:payslip_pdf', args=[payslip_b.id]))
        self.assertEqual(resp8.status_code, 403)

        # 9. Employee A cannot update Employee B's payment status
        resp9 = self.client.post(reverse('payroll:payslip_payment_update', args=[payslip_b.id]), {
            'payment_status': Payslip.Status.PAID,
        })
        self.assertEqual(resp9.status_code, 403)

    # =================================================================
    # 4. SECURITY: INACTIVE LOCKOUT & PASSWORD HASHING
    # =================================================================

    def test_inactive_user_lockout(self):
        """Verifies that deactivated users cannot authenticate."""
        emp, temp_pwd = create_employee_workflow(
            company=self.company,
            department=self.dept_eng,
            first_name='Dwight',
            last_name='Schrute',
            email='dwight@dayflow.com',
            mobile='9876543999',
            joining_date=date(2026, 1, 1),
            custom_password='DwightPassword123!',
        )
        emp.user.is_active = False
        emp.user.save()

        login_resp = self.client.post(reverse('accounts:login'), {
            'login_id': emp.user.login_id,
            'password': 'DwightPassword123!',
        })
        self.assertEqual(login_resp.status_code, 200)
        self.assertFalse(login_resp.context['user'].is_authenticated)

    def test_password_hashing_security(self):
        """Verifies passwords are never stored in plaintext and use secure hashing."""
        emp, temp_pwd = create_employee_workflow(
            company=self.company,
            department=self.dept_eng,
            first_name='Pam',
            last_name='Beesly',
            email='pam@dayflow.com',
            mobile='9876543888',
            joining_date=date(2026, 1, 1),
            custom_password='PamSecurePassword123!',
        )
        self.assertNotEqual(emp.user.password, 'PamSecurePassword123!')
        self.assertTrue(emp.user.password.startswith('pbkdf2_sha256$'))
