from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied

from accounts.permissions import (
    is_admin,
    is_hr,
    is_employee,
    can_access_employee_data,
    check_employee_ownership_or_403,
    get_accessible_employee_queryset,
)
from employees.models import Company, Employee

User = get_user_model()


class AuthenticationTests(TestCase):
    """Unit tests for user authentication, password change, and session handling."""

    def setUp(self):
        self.client = Client()
        self.company = Company.objects.create(name='Odoo India', code='OI')

        # Create Admin User
        self.admin_user = User.objects.create_superuser(
            login_id='ADMIN0001',
            email='admin@dayflow.com',
            password='AdminPassword123!',
            first_name='System',
            last_name='Admin',
        )

        # Create HR User
        self.hr_user = User.objects.create_user(
            login_id='OIHRMG20260001',
            email='hr@dayflow.com',
            password='HrPassword123!',
            first_name='HR',
            last_name='Manager',
            role=User.Role.HR,
            must_change_password=False,
            is_first_login=False,
        )

        # Create Regular Employee User 1 (Active, already changed password)
        self.emp_user_1 = User.objects.create_user(
            login_id='OIJODO20260001',
            email='john@dayflow.com',
            password='TempPassword123!',
            first_name='John',
            last_name='Doe',
            role=User.Role.EMPLOYEE,
            must_change_password=False,
            is_first_login=False,
        )
        self.employee_1 = Employee.objects.create(
            user=self.emp_user_1,
            company=self.company,
            first_name='John',
            last_name='Doe',
            email='john@dayflow.com',
            mobile='9876543210',
            joining_date='2026-01-15',
        )

        # Create Regular Employee User 2 (First login, must change password)
        self.emp_user_2 = User.objects.create_user(
            login_id='OIJASM20260002',
            email='jane@dayflow.com',
            password='InitialPassword123!',
            first_name='Jane',
            last_name='Smith',
            role=User.Role.EMPLOYEE,
            must_change_password=True,
            is_first_login=True,
        )
        self.employee_2 = Employee.objects.create(
            user=self.emp_user_2,
            company=self.company,
            first_name='Jane',
            last_name='Smith',
            email='jane@dayflow.com',
            mobile='9876543211',
            joining_date='2026-02-01',
        )

        # Create Inactive Employee User
        self.inactive_user = User.objects.create_user(
            login_id='OIINAC20260003',
            email='inactive@dayflow.com',
            password='Password123!',
            first_name='Inactive',
            last_name='User',
            role=User.Role.EMPLOYEE,
            is_active=False,
        )

    # 1. Valid login test
    def test_valid_login_with_login_id(self):
        response = self.client.post(reverse('accounts:login'), {
            'login_id': 'OIJODO20260001',
            'password': 'TempPassword123!',
        })
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('accounts:dashboard'))
        self.assertTrue('_auth_user_id' in self.client.session)

    # 2. Invalid password test
    def test_invalid_password_rejection(self):
        response = self.client.post(reverse('accounts:login'), {
            'login_id': 'OIJODO20260001',
            'password': 'WrongPassword!',
        })
        self.assertEqual(response.status_code, 200)
        self.assertFalse('_auth_user_id' in self.client.session)
        self.assertContains(response, 'Invalid Login ID or password')

    # 3. Inactive user cannot login test
    def test_inactive_user_cannot_login(self):
        response = self.client.post(reverse('accounts:login'), {
            'login_id': 'OIINAC20260003',
            'password': 'Password123!',
        })
        self.assertEqual(response.status_code, 200)
        self.assertFalse('_auth_user_id' in self.client.session)

    # 4. Employee first login redirect when must_change_password=True
    def test_employee_first_login_redirect_to_password_change(self):
        # Login user 2 who has must_change_password=True
        response = self.client.post(reverse('accounts:login'), {
            'login_id': 'OIJASM20260002',
            'password': 'InitialPassword123!',
        })
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('accounts:password_change'))

        # Any attempt to access dashboard must be intercepted and redirected to password change
        dash_response = self.client.get(reverse('accounts:dashboard'))
        self.assertEqual(dash_response.status_code, 302)
        self.assertRedirects(dash_response, reverse('accounts:password_change'))

    # 5. Password change updates must_change_password=False and is_first_login=False
    def test_password_change_updates_flags_successfully(self):
        self.client.login(login_id='OIJASM20260002', password='InitialPassword123!')

        response = self.client.post(reverse('accounts:password_change'), {
            'new_password1': 'BrandNewSecurePass123!',
            'new_password2': 'BrandNewSecurePass123!',
        })
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('accounts:dashboard'))

        # Refresh from database
        self.emp_user_2.refresh_from_db()
        self.assertFalse(self.emp_user_2.must_change_password)
        self.assertFalse(self.emp_user_2.is_first_login)
        self.assertTrue(self.emp_user_2.check_password('BrandNewSecurePass123!'))

    # 6. Admin permissions
    def test_admin_permissions(self):
        self.assertTrue(is_admin(self.admin_user))
        self.assertFalse(is_admin(self.hr_user))
        self.assertFalse(is_admin(self.emp_user_1))

    # 7. HR permissions
    def test_hr_permissions(self):
        self.assertTrue(is_hr(self.hr_user))
        self.assertFalse(is_hr(self.emp_user_1))

    # 8. Employee permissions
    def test_employee_permissions(self):
        self.assertTrue(is_employee(self.emp_user_1))
        self.assertTrue(is_employee(self.emp_user_2))

    # 9. Employee cannot access another employee's data (Object-Level Ownership Security)
    def test_employee_cannot_access_another_employee_data(self):
        # Admin can access all
        self.assertTrue(can_access_employee_data(self.admin_user, self.employee_1))
        self.assertTrue(can_access_employee_data(self.admin_user, self.employee_2))

        # HR can access all
        self.assertTrue(can_access_employee_data(self.hr_user, self.employee_1))
        self.assertTrue(can_access_employee_data(self.hr_user, self.employee_2))

        # Employee 1 can access own data
        self.assertTrue(can_access_employee_data(self.emp_user_1, self.employee_1))

        # Employee 1 CANNOT access Employee 2 data
        self.assertFalse(can_access_employee_data(self.emp_user_1, self.employee_2))

        # Employee 2 CANNOT access Employee 1 data
        self.assertFalse(can_access_employee_data(self.emp_user_2, self.employee_1))

        # Test check_employee_ownership_or_403 raises PermissionDenied
        with self.assertRaises(PermissionDenied):
            check_employee_ownership_or_403(self.emp_user_1, self.employee_2)

        # Test queryset filtering
        qs = Employee.objects.all()
        emp1_qs = get_accessible_employee_queryset(self.emp_user_1, qs)
        self.assertEqual(emp1_qs.count(), 1)
        self.assertEqual(emp1_qs.first().id, self.employee_1.id)

        admin_qs = get_accessible_employee_queryset(self.admin_user, qs)
        self.assertEqual(admin_qs.count(), 2)

    # 14. Logout session termination
    def test_logout_terminates_session(self):
        self.client.login(login_id='OIJODO20260001', password='TempPassword123!')
        self.assertTrue('_auth_user_id' in self.client.session)

        response = self.client.get(reverse('accounts:logout'))
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('accounts:login'))
        self.assertFalse('_auth_user_id' in self.client.session)
