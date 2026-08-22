from datetime import date, time, timedelta
from decimal import Decimal
from django.core.exceptions import PermissionDenied, ValidationError
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone

from attendance.models import Attendance
from attendance.services import (
    check_in_employee,
    check_out_employee,
    get_today_attendance,
    get_attendance_summary_stats,
)
from employees.models import Company, Department, Designation, Employee

User = get_user_model()


class AttendanceManagementComprehensiveTests(TestCase):
    """
    Comprehensive test suite covering all 37 scenarios for Attendance Management:
    - Basic check-in/out workflows
    - Work hours calculations
    - Object-level ownership & RBAC
    - Search and multi-field filters
    - Status transitions
    - Security and tamper protection
    """

    def setUp(self):
        self.client = Client()

        # Company & Department
        self.company = Company.objects.create(name='Odoo India', code='OI')
        self.dept_eng = Department.objects.create(name='Engineering', code='ENG')
        self.dept_hr = Department.objects.create(name='Human Resources', code='HR')
        self.desig_dev = Designation.objects.create(title='Software Engineer', department=self.dept_eng)

        # Admin User
        self.admin_user = User.objects.create_superuser(
            login_id='ADMIN0001',
            email='admin@dayflow.com',
            password='AdminPassword123!',
            first_name='Super',
            last_name='Admin',
            role=User.Role.ADMIN,
        )

        # HR User
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
    # BASIC CHECK-IN & CHECK-OUT TESTS (1 - 7)
    # =================================================================

    def test_01_employee_can_check_in(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('attendance:check_in'))
        self.assertEqual(response.status_code, 302)
        record = Attendance.objects.filter(employee=self.employee1, date=date.today()).first()
        self.assertIsNotNone(record)
        self.assertIsNotNone(record.check_in)

    def test_02_employee_can_check_out(self):
        # Setup checked-in record earlier than current execution time
        past_checkin = (timezone.localtime() - timedelta(hours=2)).time()
        record = check_in_employee(self.employee1, check_in_time=past_checkin, date_val=date.today())
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('attendance:check_out'))
        self.assertEqual(response.status_code, 302)
        record.refresh_from_db()
        self.assertIsNotNone(record.check_out)

    def test_03_work_hours_calculated_correctly(self):
        record = Attendance(
            employee=self.employee1,
            date=date.today(),
            check_in=time(9, 0),
            check_out=time(18, 0),
        )
        record.calculate_work_hours()
        self.assertEqual(record.work_hours, Decimal('9.00'))

    def test_04_duplicate_check_in_rejected(self):
        check_in_employee(self.employee1, check_in_time=time(9, 0), date_val=date.today())
        # Second check-in should raise ValidationError
        with self.assertRaises(ValidationError):
            check_in_employee(self.employee1, check_in_time=time(9, 30), date_val=date.today())

    def test_05_duplicate_check_out_rejected(self):
        check_in_employee(self.employee1, check_in_time=time(9, 0), date_val=date.today())
        check_out_employee(self.employee1, check_out_time=time(18, 0), date_val=date.today())
        # Second check-out should raise ValidationError
        with self.assertRaises(ValidationError):
            check_out_employee(self.employee1, check_out_time=time(18, 30), date_val=date.today())

    def test_06_check_out_without_check_in_rejected(self):
        # Attempt to checkout with no existing record
        with self.assertRaises(ValidationError):
            check_out_employee(self.employee1, check_out_time=time(18, 0), date_val=date.today())

    def test_07_check_out_before_check_in_rejected(self):
        check_in_employee(self.employee1, check_in_time=time(10, 0), date_val=date.today())
        # Checkout time 09:00 < checkin time 10:00
        with self.assertRaises(ValidationError):
            check_out_employee(self.employee1, check_out_time=time(9, 0), date_val=date.today())

    # =================================================================
    # OWNERSHIP & SECURITY TESTS (8 - 11)
    # =================================================================

    def test_08_employee_can_view_own_attendance(self):
        record = Attendance.objects.create(
            employee=self.employee1,
            date=date.today(),
            check_in=time(9, 0),
            check_out=time(17, 30),
            status=Attendance.Status.PRESENT,
        )
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.get(reverse('attendance:attendance_detail', args=[record.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'John Doe')

    def test_09_employee_cannot_view_another_employee_attendance(self):
        record2 = Attendance.objects.create(
            employee=self.employee2,
            date=date.today(),
            check_in=time(9, 0),
            status=Attendance.Status.PRESENT,
        )
        # Employee 1 attempts to access Employee 2's record
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.get(reverse('attendance:attendance_detail', args=[record2.id]))
        self.assertEqual(response.status_code, 403)

    def test_10_employee_cannot_edit_another_employee_attendance(self):
        record2 = Attendance.objects.create(
            employee=self.employee2,
            date=date.today(),
            check_in=time(9, 0),
            status=Attendance.Status.PRESENT,
        )
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.get(reverse('attendance:attendance_edit', args=[record2.id]))
        self.assertEqual(response.status_code, 403)

    def test_11_employee_cannot_create_attendance_for_another_employee(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('attendance:attendance_create'), {
            'employee': self.employee2.id,
            'date': date.today(),
            'check_in': '09:00',
            'status': 'PRESENT',
        })
        self.assertEqual(response.status_code, 403)

    # =================================================================
    # RBAC TESTS (12 - 17)
    # =================================================================

    def test_12_admin_can_view_attendance_list(self):
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('attendance:attendance_list'))
        self.assertEqual(response.status_code, 200)

    def test_13_hr_can_view_attendance_list(self):
        self.client.login(login_id='OIHRMG20260001', password='HrPassword123!')
        response = self.client.get(reverse('attendance:attendance_list'))
        self.assertEqual(response.status_code, 200)

    def test_14_employee_cannot_access_admin_attendance_list(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.get(reverse('attendance:attendance_list'))
        self.assertEqual(response.status_code, 403)

    def test_15_admin_can_edit_attendance(self):
        record = Attendance.objects.create(
            employee=self.employee1,
            date=date.today(),
            check_in=time(9, 0),
            status=Attendance.Status.PRESENT,
        )
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.post(reverse('attendance:attendance_edit', args=[record.id]), {
            'date': date.today(),
            'check_in': '09:00',
            'check_out': '17:30',
            'status': Attendance.Status.PRESENT,
            'notes': 'Admin corrected check-out',
        })
        self.assertEqual(response.status_code, 302)
        record.refresh_from_db()
        self.assertEqual(record.work_hours, Decimal('8.50'))

    def test_16_hr_can_edit_attendance(self):
        record = Attendance.objects.create(
            employee=self.employee1,
            date=date.today(),
            check_in=time(9, 0),
            status=Attendance.Status.PRESENT,
        )
        self.client.login(login_id='OIHRMG20260001', password='HrPassword123!')
        response = self.client.post(reverse('attendance:attendance_edit', args=[record.id]), {
            'date': date.today(),
            'check_in': '09:00',
            'check_out': '18:00',
            'status': Attendance.Status.PRESENT,
        })
        self.assertEqual(response.status_code, 302)
        record.refresh_from_db()
        self.assertEqual(record.work_hours, Decimal('9.00'))

    def test_17_employee_cannot_edit_attendance(self):
        record = Attendance.objects.create(
            employee=self.employee1,
            date=date.today(),
            check_in=time(9, 0),
            status=Attendance.Status.PRESENT,
        )
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('attendance:attendance_edit', args=[record.id]), {
            'date': date.today(),
            'check_in': '09:00',
            'check_out': '18:00',
            'status': Attendance.Status.PRESENT,
        })
        self.assertEqual(response.status_code, 403)

    # =================================================================
    # FILTERS & SEARCH TESTS (18 - 23)
    # =================================================================

    def test_18_filter_by_employee(self):
        Attendance.objects.create(employee=self.employee1, date=date.today(), check_in=time(9, 0), status=Attendance.Status.PRESENT)
        Attendance.objects.create(employee=self.employee2, date=date.today(), check_in=time(9, 0), status=Attendance.Status.PRESENT)

        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('attendance:attendance_list') + f'?employee={self.employee1.id}')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '<td>John Doe</td>')
        self.assertNotContains(response, '<td>Jane Smith</td>')

    def test_19_filter_by_status(self):
        Attendance.objects.create(employee=self.employee1, date=date.today(), check_in=time(9, 0), status=Attendance.Status.WFH)
        Attendance.objects.create(employee=self.employee2, date=date.today(), check_in=time(9, 0), status=Attendance.Status.PRESENT)

        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('attendance:attendance_list') + '?status=WFH')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '<td>John Doe</td>')
        self.assertNotContains(response, '<td>Jane Smith</td>')

    def test_20_filter_by_date(self):
        d1 = date(2026, 8, 1)
        d2 = date(2026, 8, 2)
        Attendance.objects.create(employee=self.employee1, date=d1, check_in=time(9, 0), status=Attendance.Status.PRESENT)
        Attendance.objects.create(employee=self.employee1, date=d2, check_in=time(9, 0), status=Attendance.Status.PRESENT)

        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('attendance:attendance_list') + '?date=2026-08-01')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '2026-08-01')
        self.assertNotContains(response, '2026-08-02')

    def test_21_filter_by_date_range(self):
        Attendance.objects.create(employee=self.employee1, date=date(2026, 8, 10), check_in=time(9, 0), status=Attendance.Status.PRESENT)
        Attendance.objects.create(employee=self.employee1, date=date(2026, 8, 15), check_in=time(9, 0), status=Attendance.Status.PRESENT)
        Attendance.objects.create(employee=self.employee1, date=date(2026, 8, 20), check_in=time(9, 0), status=Attendance.Status.PRESENT)

        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.get(reverse('attendance:my_attendance') + '?date_from=2026-08-12&date_to=2026-08-18')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '2026-08-15')
        self.assertNotContains(response, '2026-08-10')
        self.assertNotContains(response, '2026-08-20')

    def test_22_search_by_employee_name(self):
        Attendance.objects.create(employee=self.employee1, date=date.today(), check_in=time(9, 0))
        Attendance.objects.create(employee=self.employee2, date=date.today(), check_in=time(9, 0))

        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('attendance:attendance_list') + '?q=Jane')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '<td>Jane Smith</td>')
        self.assertNotContains(response, '<td>John Doe</td>')

    def test_23_search_by_login_id(self):
        Attendance.objects.create(employee=self.employee1, date=date.today(), check_in=time(9, 0))
        Attendance.objects.create(employee=self.employee2, date=date.today(), check_in=time(9, 0))

        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('attendance:attendance_list') + '?q=OIJODO20260001')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '<td>John Doe</td>')
        self.assertNotContains(response, '<td>Jane Smith</td>')

    # =================================================================
    # STATUS CHOICES TESTS (24 - 29)
    # =================================================================

    def test_24_status_present_works(self):
        r = Attendance.objects.create(employee=self.employee1, date=date(2026, 8, 1), status=Attendance.Status.PRESENT)
        self.assertEqual(r.get_status_display(), 'Present')

    def test_25_status_absent_works(self):
        r = Attendance.objects.create(employee=self.employee1, date=date(2026, 8, 2), status=Attendance.Status.ABSENT)
        self.assertEqual(r.get_status_display(), 'Absent')

    def test_26_status_half_day_works(self):
        r = Attendance.objects.create(employee=self.employee1, date=date(2026, 8, 3), status=Attendance.Status.HALF_DAY)
        self.assertEqual(r.get_status_display(), 'Half Day')

    def test_27_status_late_works(self):
        # Check in after 09:15 threshold
        r = check_in_employee(self.employee1, check_in_time=time(9, 45), date_val=date(2026, 8, 4))
        self.assertEqual(r.status, Attendance.Status.LATE)

    def test_28_status_wfh_works(self):
        r = Attendance.objects.create(employee=self.employee1, date=date(2026, 8, 5), status=Attendance.Status.WFH)
        self.assertEqual(r.get_status_display(), 'Work From Home')

    def test_29_status_on_leave_works(self):
        r = Attendance.objects.create(employee=self.employee1, date=date(2026, 8, 6), status=Attendance.Status.ON_LEAVE)
        self.assertEqual(r.get_status_display(), 'On Leave')

    # =================================================================
    # WORK HOURS CALCULATION TESTS (30 - 32)
    # =================================================================

    def test_30_nine_hour_workday_calculates_9_00(self):
        r = Attendance(employee=self.employee1, date=date.today(), check_in=time(9, 0), check_out=time(18, 0))
        r.calculate_work_hours()
        self.assertEqual(r.work_hours, Decimal('9.00'))

    def test_31_eight_and_half_hour_workday_calculates_8_50(self):
        r = Attendance(employee=self.employee1, date=date.today(), check_in=time(9, 30), check_out=time(18, 0))
        r.calculate_work_hours()
        self.assertEqual(r.work_hours, Decimal('8.50'))

    def test_32_editing_check_out_recalculates_work_hours(self):
        r = Attendance.objects.create(
            employee=self.employee1,
            date=date.today(),
            check_in=time(9, 0),
            check_out=time(13, 0),
        )
        self.assertEqual(r.work_hours, Decimal('4.00'))

        # Update check_out to 17:00
        r.check_out = time(17, 0)
        r.save()
        r.refresh_from_db()
        self.assertEqual(r.work_hours, Decimal('8.00'))

    # =================================================================
    # SECURITY & TAMPERING TESTS (33 - 35)
    # =================================================================

    def test_33_url_id_tampering_rejected(self):
        record2 = Attendance.objects.create(employee=self.employee2, date=date.today(), check_in=time(9, 0))
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.get(f'/attendance/{record2.id}/')
        self.assertEqual(response.status_code, 403)

    def test_34_post_employee_id_tampering_rejected(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        # Check-in view takes employee from session/profile, ignoring any malicious employee_id in POST body
        response = self.client.post(reverse('attendance:check_in'), {'employee_id': self.employee2.id})
        self.assertEqual(response.status_code, 302)

        # Confirm attendance was created for Employee 1, NOT Employee 2
        self.assertTrue(Attendance.objects.filter(employee=self.employee1, date=date.today()).exists())
        self.assertFalse(Attendance.objects.filter(employee=self.employee2, date=date.today()).exists())

    def test_35_csrf_protection_enabled(self):
        enforce_client = Client(enforce_csrf_checks=True)
        enforce_client.login(login_id='OIJODO20260001', password='Password123!')
        # A raw post without CSRF token must fail with 403
        response = enforce_client.post(reverse('attendance:check_in'))
        self.assertEqual(response.status_code, 403)
