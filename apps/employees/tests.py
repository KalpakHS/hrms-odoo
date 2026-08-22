from datetime import date
from django.test import TestCase
from django.contrib.auth import get_user_model

from employees.models import Company, Department, Designation, Employee
from employees.utils import generate_employee_login_id, generate_initial_password
from employees.services import create_employee_workflow

User = get_user_model()


class EmployeeCreationAndLoginIdTests(TestCase):
    """Tests for Login ID generation, employee onboarding workflow, and password hashing."""

    def setUp(self):
        self.company = Company.objects.create(name='Odoo India', code='OI')
        self.department = Department.objects.create(name='Engineering', code='ENG')
        self.designation = Designation.objects.create(title='Backend Developer', department=self.department)

    # 10. Login ID generation format
    def test_login_id_generation_standard_format(self):
        # Company: "Odoo India", First: "John", Last: "Doe", Year: 2026
        # Expected: OIJODO20260001
        login_id = generate_employee_login_id(
            company_name_or_code='Odoo India',
            first_name='John',
            last_name='Doe',
            joining_year=2026,
            serial_number=1,
        )
        self.assertEqual(login_id, 'OIJODO20260001')

    # 11. Duplicate login ID prevention and sequential generation
    def test_sequential_login_id_generation_with_same_names(self):
        # First employee
        emp1, _ = create_employee_workflow(
            company=self.company,
            first_name='John',
            last_name='Doe',
            email='john1@dayflow.com',
            mobile='9876543210',
            joining_date=date(2026, 1, 1),
        )
        self.assertEqual(emp1.user.login_id, 'OIJODO20260001')

        # Second employee with same company, name, and year -> must get 0002
        emp2, _ = create_employee_workflow(
            company=self.company,
            first_name='John',
            last_name='Doe',
            email='john2@dayflow.com',
            mobile='9876543211',
            joining_date=date(2026, 2, 1),
        )
        self.assertEqual(emp2.user.login_id, 'OIJODO20260002')

        # Third employee
        emp3, _ = create_employee_workflow(
            company=self.company,
            first_name='John',
            last_name='Doe',
            email='john3@dayflow.com',
            mobile='9876543212',
            joining_date=date(2026, 3, 1),
        )
        self.assertEqual(emp3.user.login_id, 'OIJODO20260003')

    # Edge cases: Short names and missing last name
    def test_login_id_generation_edge_cases(self):
        # 1-letter first name, no last name
        id1 = generate_employee_login_id('Odoo India', 'A', '', 2026, 1)
        self.assertEqual(id1, 'OIAXXX20260001')

        # Single word company
        id2 = generate_employee_login_id('Dayflow', 'Bob', 'Marley', 2026, 1)
        self.assertEqual(id2, 'DABOMA20260001')

    # 12. Employee creation service workflow
    def test_employee_creation_service_workflow(self):
        emp, temp_password = create_employee_workflow(
            company=self.company,
            department=self.department,
            designation=self.designation,
            first_name='Alice',
            last_name='Cooper',
            email='alice@dayflow.com',
            mobile='9123456780',
            joining_date=date(2026, 5, 10),
            role=User.Role.EMPLOYEE,
        )

        # Profile assertions
        self.assertIsNotNone(emp.id)
        self.assertEqual(emp.full_name, 'Alice Cooper')
        self.assertEqual(emp.company, self.company)
        self.assertEqual(emp.department, self.department)
        self.assertEqual(emp.designation, self.designation)

        # User account assertions
        user = emp.user
        self.assertEqual(user.login_id, 'OIALCO20260001')
        self.assertEqual(user.email, 'alice@dayflow.com')
        self.assertEqual(user.role, User.Role.EMPLOYEE)
        self.assertTrue(user.is_active)
        self.assertTrue(user.must_change_password)
        self.assertTrue(user.is_first_login)

        # 13. Temporary password hashing (no plaintext stored in database)
        self.assertTrue(user.check_password(temp_password))
        self.assertNotEqual(user.password, temp_password)
        self.assertTrue(user.password.startswith('pbkdf2_sha256$') or user.password.startswith('argon2'))
