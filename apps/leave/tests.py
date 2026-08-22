import io
from datetime import date, timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied, ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone

from employees.models import Company, Department, Designation, Employee
from leave.models import LeaveType, LeaveRequest, LeaveBalance
from leave.services import (
    apply_for_leave,
    approve_leave_request,
    reject_leave_request,
    cancel_leave_request,
    calculate_leave_days,
    get_or_create_leave_balance,
    get_employee_leave_balances,
    get_leave_summary_stats,
)

User = get_user_model()


class LeaveManagementComprehensiveTests(TestCase):
    """
    Comprehensive test suite covering all 25+ leave management scenarios:
    - Application & day calculation
    - Balance enforcement & negative balance prevention
    - Attachment security & upload validation
    - Role-based approval and rejection workflows
    - Atomic balance deduction & idempotency
    - Cancellation lifecycle
    - Search, multi-field filters & pagination
    - Object-level security and permission tampering
    """

    def setUp(self):
        self.client = Client()

        # Company & Departments
        self.company = Company.objects.create(name='Odoo India', code='OI')
        self.dept_eng = Department.objects.create(name='Engineering', code='ENG')
        self.dept_hr = Department.objects.create(name='Human Resources', code='HR')
        self.desig_dev = Designation.objects.create(title='Software Engineer', department=self.dept_eng)

        # Leave Types Catalog (CL, SL, PL, UL)
        self.lt_cl = LeaveType.objects.create(
            name='Casual Leave',
            code='CL',
            max_days_per_year=Decimal('12.0'),
            is_paid=True,
            requires_attachment=False,
        )
        self.lt_sl = LeaveType.objects.create(
            name='Sick Leave',
            code='SL',
            max_days_per_year=Decimal('10.0'),
            is_paid=True,
            requires_attachment=True,
        )
        self.lt_pl = LeaveType.objects.create(
            name='Paid Leave',
            code='PL',
            max_days_per_year=Decimal('18.0'),
            is_paid=True,
            requires_attachment=False,
        )
        self.lt_ul = LeaveType.objects.create(
            name='Unpaid Leave',
            code='UL',
            max_days_per_year=Decimal('30.0'),
            is_paid=False,
            requires_attachment=False,
        )

        # Admin User
        self.admin_user = User.objects.create_superuser(
            login_id='ADMIN0001',
            email='admin@dayflow.com',
            password='AdminPassword123!',
            first_name='Super',
            last_name='Admin',
            role=User.Role.ADMIN,
        )

        # HR User & Employee Profile
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
            first_name='Helen',
            last_name='Rogers',
            email='hr@dayflow.com',
            mobile='9876543201',
            joining_date=date(2026, 1, 1),
        )

        # Employee 1
        self.emp1_user = User.objects.create_user(
            login_id='OIJODO20260001',
            email='john.doe@dayflow.com',
            password='Password123!',
            first_name='John',
            last_name='Doe',
            role=User.Role.EMPLOYEE,
            must_change_password=False,
            is_first_login=False,
        )
        self.employee1 = Employee.objects.create(
            user=self.emp1_user,
            company=self.company,
            department=self.dept_eng,
            designation=self.desig_dev,
            first_name='John',
            last_name='Doe',
            email='john.doe@dayflow.com',
            mobile='9876543211',
            joining_date=date(2026, 1, 15),
        )

        # Employee 2
        self.emp2_user = User.objects.create_user(
            login_id='OIJASM20260002',
            email='jane.smith@dayflow.com',
            password='Password123!',
            first_name='Jane',
            last_name='Smith',
            role=User.Role.EMPLOYEE,
            must_change_password=False,
            is_first_login=False,
        )
        self.employee2 = Employee.objects.create(
            user=self.emp2_user,
            company=self.company,
            department=self.dept_eng,
            designation=self.desig_dev,
            first_name='Jane',
            last_name='Smith',
            email='jane.smith@dayflow.com',
            mobile='9876543212',
            joining_date=date(2026, 2, 1),
        )

    # =================================================================
    # APPLICATION & CALCULATION TESTS (1 - 6)
    # =================================================================

    def test_01_employee_can_apply_for_leave(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('leave:leave_apply'), {
            'leave_type': self.lt_cl.id,
            'start_date': '2026-09-01',
            'end_date': '2026-09-03',
            'reason': 'Family vacation',
        })
        self.assertEqual(response.status_code, 302)
        self.assertTrue(LeaveRequest.objects.filter(employee=self.employee1, reason='Family vacation').exists())
        req = LeaveRequest.objects.get(employee=self.employee1, reason='Family vacation')
        self.assertEqual(req.total_days, Decimal('3.0'))
        self.assertEqual(req.status, LeaveRequest.Status.PENDING)

    def test_02_employee_cannot_apply_for_another_employee(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        # Post tampering with employee ID
        response = self.client.post(reverse('leave:leave_apply'), {
            'employee': self.employee2.id,
            'leave_type': self.lt_cl.id,
            'start_date': '2026-09-01',
            'end_date': '2026-09-02',
            'reason': 'Malicious leave injection',
        })
        self.assertEqual(response.status_code, 302)
        # Verify the application was recorded for employee 1, not employee 2
        self.assertTrue(LeaveRequest.objects.filter(employee=self.employee1, reason='Malicious leave injection').exists())
        self.assertFalse(LeaveRequest.objects.filter(employee=self.employee2, reason='Malicious leave injection').exists())

    def test_03_total_leave_days_calculated_correctly(self):
        # Single day
        d1 = calculate_leave_days(date(2026, 9, 1), date(2026, 9, 1))
        self.assertEqual(d1, Decimal('1.0'))
        # 5 days
        d5 = calculate_leave_days(date(2026, 9, 1), date(2026, 9, 5))
        self.assertEqual(d5, Decimal('5.0'))

    def test_04_invalid_date_range_rejected(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        # Start date after end date
        response = self.client.post(reverse('leave:leave_apply'), {
            'leave_type': self.lt_cl.id,
            'start_date': '2026-09-10',
            'end_date': '2026-09-05',
            'reason': 'Invalid dates',
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'cannot be earlier than start date')

    def test_05_insufficient_paid_leave_balance_rejected(self):
        # Set up a balance with only 2 days remaining
        balance = get_or_create_leave_balance(self.employee1, self.lt_cl, 2026)
        balance.used_days = Decimal('11.0')  # 12 - 11 = 1 day remaining
        balance.save()

        # Attempt to apply for 3 days
        with self.assertRaises(ValidationError):
            apply_for_leave(
                employee=self.employee1,
                leave_type=self.lt_cl,
                start_date=date(2026, 9, 1),
                end_date=date(2026, 9, 3),
                reason='Exceeding quota',
            )

    def test_06_required_attachment_validation(self):
        # Sick Leave requires medical attachment
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('leave:leave_apply'), {
            'leave_type': self.lt_sl.id,
            'start_date': '2026-09-01',
            'end_date': '2026-09-02',
            'reason': 'Sick without attachment',
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Supporting document')

        # Provide valid file
        test_file = SimpleUploadedFile('med_cert.pdf', b'PDF-content', content_type='application/pdf')
        response2 = self.client.post(reverse('leave:leave_apply'), {
            'leave_type': self.lt_sl.id,
            'start_date': '2026-09-01',
            'end_date': '2026-09-02',
            'reason': 'Sick with attachment',
            'attachment': test_file,
        })
        self.assertEqual(response2.status_code, 302)
        self.assertTrue(LeaveRequest.objects.filter(employee=self.employee1, leave_type=self.lt_sl).exists())

    # =================================================================
    # VISIBILITY & RBAC DIRECTORY TESTS (7 - 9)
    # =================================================================

    def test_07_employee_sees_only_own_requests(self):
        LeaveRequest.objects.create(
            employee=self.employee1,
            leave_type=self.lt_cl,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 2),
            total_days=Decimal('2.0'),
            reason='John Vacation',
        )
        LeaveRequest.objects.create(
            employee=self.employee2,
            leave_type=self.lt_cl,
            start_date=date(2026, 9, 5),
            end_date=date(2026, 9, 6),
            total_days=Decimal('2.0'),
            reason='Jane Vacation',
        )

        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.get(reverse('leave:my_leave'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'John Vacation')
        self.assertNotContains(response, 'Jane Vacation')

    def test_08_admin_sees_organizational_requests(self):
        LeaveRequest.objects.create(employee=self.employee1, leave_type=self.lt_cl, start_date=date(2026, 9, 1), end_date=date(2026, 9, 2), reason='John Leave')
        LeaveRequest.objects.create(employee=self.employee2, leave_type=self.lt_cl, start_date=date(2026, 9, 5), end_date=date(2026, 9, 6), reason='Jane Leave')

        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('leave:leave_list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '<td><strong>John Doe</strong></td>')
        self.assertContains(response, '<td><strong>Jane Smith</strong></td>')

    def test_09_hr_sees_organizational_requests(self):
        LeaveRequest.objects.create(employee=self.employee1, leave_type=self.lt_cl, start_date=date(2026, 9, 1), end_date=date(2026, 9, 2), reason='John Leave')

        self.client.login(login_id='OIHRMG20260001', password='HrPassword123!')
        response = self.client.get(reverse('leave:leave_list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '<td><strong>John Doe</strong></td>')

    # =================================================================
    # APPROVAL, REJECTION & BALANCE DEDUCTION TESTS (10 - 15)
    # =================================================================

    def test_10_employee_cannot_approve_leave(self):
        req = LeaveRequest.objects.create(
            employee=self.employee2,
            leave_type=self.lt_cl,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 2),
            total_days=Decimal('2.0'),
            reason='Jane Leave',
        )
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('leave:leave_approve', args=[req.id]))
        self.assertEqual(response.status_code, 403)
        req.refresh_from_db()
        self.assertEqual(req.status, LeaveRequest.Status.PENDING)

    def test_11_admin_can_approve_leave(self):
        req = LeaveRequest.objects.create(
            employee=self.employee1,
            leave_type=self.lt_cl,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 3),
            total_days=Decimal('3.0'),
            reason='Admin Approval Test',
        )
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.post(reverse('leave:leave_approve', args=[req.id]))
        self.assertEqual(response.status_code, 302)
        req.refresh_from_db()
        self.assertEqual(req.status, LeaveRequest.Status.APPROVED)
        self.assertEqual(req.approver, self.admin_user)

    def test_12_hr_can_approve_leave(self):
        req = LeaveRequest.objects.create(
            employee=self.employee1,
            leave_type=self.lt_cl,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 2),
            total_days=Decimal('2.0'),
            reason='HR Approval Test',
        )
        self.client.login(login_id='OIHRMG20260001', password='HrPassword123!')
        response = self.client.post(reverse('leave:leave_approve', args=[req.id]))
        self.assertEqual(response.status_code, 302)
        req.refresh_from_db()
        self.assertEqual(req.status, LeaveRequest.Status.APPROVED)
        self.assertEqual(req.approver, self.hr_user)

    def test_13_rejected_request_does_not_deduct_balance(self):
        balance = get_or_create_leave_balance(self.employee1, self.lt_cl, 2026)
        initial_used = balance.used_days

        req = LeaveRequest.objects.create(
            employee=self.employee1,
            leave_type=self.lt_cl,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 3),
            total_days=Decimal('3.0'),
            reason='To be rejected',
        )

        reject_leave_request(req.id, approver_user=self.admin_user, rejection_reason='Peak project sprint')
        req.refresh_from_db()
        balance.refresh_from_db()

        self.assertEqual(req.status, LeaveRequest.Status.REJECTED)
        self.assertEqual(req.rejection_reason, 'Peak project sprint')
        self.assertEqual(balance.used_days, initial_used)

    def test_14_approved_request_deducts_balance_exactly_once(self):
        balance = get_or_create_leave_balance(self.employee1, self.lt_cl, 2026)
        balance.used_days = Decimal('0.0')
        balance.save()

        req = LeaveRequest.objects.create(
            employee=self.employee1,
            leave_type=self.lt_cl,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 3),
            total_days=Decimal('3.0'),
            reason='Deduction Test',
        )

        approve_leave_request(req.id, approver_user=self.admin_user)
        balance.refresh_from_db()
        self.assertEqual(balance.used_days, Decimal('3.0'))
        self.assertEqual(balance.remaining_days, Decimal('9.0'))

    def test_15_duplicate_approval_cannot_deduct_twice(self):
        balance = get_or_create_leave_balance(self.employee1, self.lt_cl, 2026)
        balance.used_days = Decimal('0.0')
        balance.save()

        req = LeaveRequest.objects.create(
            employee=self.employee1,
            leave_type=self.lt_cl,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 2),
            total_days=Decimal('2.0'),
            reason='Double approval guard',
        )

        approve_leave_request(req.id, approver_user=self.admin_user)
        balance.refresh_from_db()
        self.assertEqual(balance.used_days, Decimal('2.0'))

        # Second approval call must raise ValidationError and not deduct again
        with self.assertRaises(ValidationError):
            approve_leave_request(req.id, approver_user=self.admin_user)

        balance.refresh_from_db()
        self.assertEqual(balance.used_days, Decimal('2.0'))

    # =================================================================
    # CANCELLATION TESTS (16 - 17)
    # =================================================================

    def test_16_employee_can_cancel_pending_request(self):
        req = LeaveRequest.objects.create(
            employee=self.employee1,
            leave_type=self.lt_cl,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 2),
            total_days=Decimal('2.0'),
            reason='Cancel Me',
        )
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('leave:leave_cancel', args=[req.id]))
        self.assertEqual(response.status_code, 302)
        req.refresh_from_db()
        self.assertEqual(req.status, LeaveRequest.Status.CANCELLED)

    def test_17_employee_cannot_cancel_another_employee_request(self):
        req = LeaveRequest.objects.create(
            employee=self.employee2,
            leave_type=self.lt_cl,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 2),
            total_days=Decimal('2.0'),
            reason='Jane Leave',
        )
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('leave:leave_cancel', args=[req.id]))
        self.assertEqual(response.status_code, 403)
        req.refresh_from_db()
        self.assertEqual(req.status, LeaveRequest.Status.PENDING)

    # =================================================================
    # SECURITY & ACCESS CONTROL TESTS (18 - 20)
    # =================================================================

    def test_18_employee_cannot_manipulate_balance(self):
        # Employees cannot access admin leave type or edit balances
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.get(reverse('leave:leave_type_create'))
        self.assertEqual(response.status_code, 403)

    def test_19_unauthorized_detail_access_returns_403(self):
        req2 = LeaveRequest.objects.create(
            employee=self.employee2,
            leave_type=self.lt_cl,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 2),
            reason='Jane Secret Leave',
        )
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.get(reverse('leave:leave_detail', args=[req2.id]))
        self.assertEqual(response.status_code, 403)

    def test_20_attachment_security_and_download_authorization(self):
        test_file = SimpleUploadedFile('confidential.pdf', b'medical-info', content_type='application/pdf')
        req = LeaveRequest.objects.create(
            employee=self.employee1,
            leave_type=self.lt_sl,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 2),
            reason='Sick',
            attachment=test_file,
        )

        # Owner can download
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        resp_owner = self.client.get(reverse('leave:leave_attachment_download', args=[req.id]))
        self.assertEqual(resp_owner.status_code, 200)

        # Admin can download
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        resp_admin = self.client.get(reverse('leave:leave_attachment_download', args=[req.id]))
        self.assertEqual(resp_admin.status_code, 200)

        # Other employee receives 403
        self.client.login(login_id='OIJASM20260002', password='Password123!')
        resp_other = self.client.get(reverse('leave:leave_attachment_download', args=[req.id]))
        self.assertEqual(resp_other.status_code, 403)

    # =================================================================
    # SEARCH, FILTERS, PAGINATION & DASHBOARD TESTS (21 - 25)
    # =================================================================

    def test_21_search_by_employee_name_and_login_id(self):
        LeaveRequest.objects.create(employee=self.employee1, leave_type=self.lt_cl, start_date=date(2026, 9, 1), end_date=date(2026, 9, 2), reason='John Trip')
        LeaveRequest.objects.create(employee=self.employee2, leave_type=self.lt_cl, start_date=date(2026, 9, 5), end_date=date(2026, 9, 6), reason='Jane Trip')

        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        # Search by Jane
        response = self.client.get(reverse('leave:leave_list') + '?q=Jane')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '<td><strong>Jane Smith</strong></td>')
        self.assertNotContains(response, '<td><strong>John Doe</strong></td>')

        # Search by John's login_id
        response2 = self.client.get(reverse('leave:leave_list') + '?q=OIJODO20260001')
        self.assertEqual(response2.status_code, 200)
        self.assertContains(response2, '<td><strong>John Doe</strong></td>')
        self.assertNotContains(response2, '<td><strong>Jane Smith</strong></td>')

    def test_22_filters_by_leave_type_and_status(self):
        LeaveRequest.objects.create(employee=self.employee1, leave_type=self.lt_cl, start_date=date(2026, 9, 1), end_date=date(2026, 9, 2), status=LeaveRequest.Status.PENDING, reason='CL Pending')
        LeaveRequest.objects.create(employee=self.employee2, leave_type=self.lt_sl, start_date=date(2026, 9, 5), end_date=date(2026, 9, 6), status=LeaveRequest.Status.APPROVED, reason='SL Approved')

        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('leave:leave_list') + f'?leave_type={self.lt_cl.id}&status=PENDING')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '<td><strong>John Doe</strong></td>')
        self.assertNotContains(response, '<td><strong>Jane Smith</strong></td>')

    def test_23_pagination_works(self):
        # Create 18 requests
        for i in range(18):
            LeaveRequest.objects.create(
                employee=self.employee1,
                leave_type=self.lt_cl,
                start_date=date(2026, 9, 1) + timedelta(days=i),
                end_date=date(2026, 9, 1) + timedelta(days=i),
                reason=f'Leave #{i}',
            )

        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('leave:leave_list'))
        self.assertEqual(response.status_code, 200)
        # Page size is 15
        self.assertEqual(len(response.context['page_obj']), 15)

    def test_24_dashboard_statistics_are_accurate(self):
        today = timezone.localdate()
        LeaveRequest.objects.create(employee=self.employee1, leave_type=self.lt_cl, start_date=today, end_date=today, status=LeaveRequest.Status.APPROVED, reason='On leave today')
        LeaveRequest.objects.create(employee=self.employee2, leave_type=self.lt_sl, start_date=today + timedelta(days=10), end_date=today + timedelta(days=12), status=LeaveRequest.Status.PENDING, reason='Future pending')

        stats = get_leave_summary_stats()
        self.assertEqual(stats['total_pending'], 1)
        self.assertEqual(stats['total_approved'], 1)
        self.assertEqual(stats['on_leave_today'], 1)

    def test_25_unpaid_leave_does_not_deduct_paid_balance(self):
        req = LeaveRequest.objects.create(
            employee=self.employee1,
            leave_type=self.lt_ul,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 5),
            total_days=Decimal('5.0'),
            reason='Unpaid sabbatical',
        )
        approve_leave_request(req.id, approver_user=self.admin_user)
        req.refresh_from_db()
        self.assertEqual(req.status, LeaveRequest.Status.APPROVED)
        # Paid leave balance remains completely unaffected
        cl_balance = get_or_create_leave_balance(self.employee1, self.lt_cl, 2026)
        self.assertEqual(cl_balance.used_days, Decimal('0.0'))
