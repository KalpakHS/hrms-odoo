import io
from datetime import date, timedelta
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied

from employees.models import (
    Company,
    Department,
    Designation,
    Employee,
    Skill,
    EmployeeSkill,
    EmployeeCertification,
    EmployeeDocument,
)
from employees.services import create_employee_workflow
from employees.utils import generate_employee_login_id

User = get_user_model()


class EmployeeManagementComprehensiveTests(TestCase):
    """
    Comprehensive test suite covering all 44 test scenarios for Company, Department,
    Designation, Employee lifecycle, RBAC, Ownership, Search, Filters, Skills,
    Certifications, Documents, and Activation/Deactivation.
    """

    def setUp(self):
        self.client = Client()

        # 1. Company
        self.company = Company.objects.create(
            name='Odoo India',
            code='OI',
            contact_email='contact@odoo.com',
            contact_phone='9876543210',
            address='Gandhinagar, Gujarat',
            website='https://www.odoo.com',
        )
        self.company2 = Company.objects.create(
            name='Dayflow Tech',
            code='DT',
        )

        # 2. Department & Designation
        self.dept_eng = Department.objects.create(name='Engineering', code='ENG', description='Software Team')
        self.dept_hr = Department.objects.create(name='Human Resources', code='HR', description='HR Team')

        self.desig_dev = Designation.objects.create(title='Backend Developer', department=self.dept_eng)
        self.desig_lead = Designation.objects.create(title='Tech Lead', department=self.dept_eng)
        self.desig_hrm = Designation.objects.create(title='HR Specialist', department=self.dept_hr)

        # 3. Master Skills
        self.skill_python = Skill.objects.create(name='Python', category='Backend')
        self.skill_django = Skill.objects.create(name='Django', category='Framework')

        # 4. Users & Employees
        # Admin
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
            designation=self.desig_hrm,
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
            city='Ahmedabad',
            state='Gujarat',
            is_active=True,
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
            designation=self.desig_lead,
            first_name='Jane',
            last_name='Smith',
            email='jane.smith@dayflow.com',
            mobile='9876543212',
            joining_date=date(2026, 2, 1),
            city='Bangalore',
            state='Karnataka',
            is_active=True,
        )

    # =================================================================
    # COMPANY TESTS (1 - 4)
    # =================================================================

    def test_01_admin_can_create_company(self):
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.post(reverse('employees:company_create'), {
            'name': 'Alpha Corporation',
            'code': 'AC',
            'contact_email': 'alpha@company.com',
            'contact_phone': '9123456780',
            'address': 'Mumbai',
            'website': 'https://alpha.com',
        })
        self.assertEqual(response.status_code, 302)
        self.assertTrue(Company.objects.filter(code='AC').exists())

    def test_02_duplicate_company_rejected(self):
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.post(reverse('employees:company_create'), {
            'name': 'Odoo India',  # duplicate name
            'code': 'OI',          # duplicate code
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'already exists')

    def test_03_hr_cannot_modify_company(self):
        self.client.login(login_id='OIHRMG20260001', password='HrPassword123!')
        # HR cannot access create or edit
        create_resp = self.client.get(reverse('employees:company_create'))
        self.assertEqual(create_resp.status_code, 403)
        edit_resp = self.client.get(reverse('employees:company_edit', args=[self.company.id]))
        self.assertEqual(edit_resp.status_code, 403)

    def test_04_employee_cannot_manage_company(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        list_resp = self.client.get(reverse('employees:company_list'))
        self.assertEqual(list_resp.status_code, 403)
        create_resp = self.client.get(reverse('employees:company_create'))
        self.assertEqual(create_resp.status_code, 403)

    # =================================================================
    # DEPARTMENT TESTS (5 - 6)
    # =================================================================

    def test_05_admin_can_create_department(self):
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.post(reverse('employees:department_create'), {
            'name': 'Finance',
            'code': 'FIN',
            'description': 'Accounts and Payroll',
        })
        self.assertEqual(response.status_code, 302)
        self.assertTrue(Department.objects.filter(code='FIN').exists())

    def test_06_duplicate_department_rejected(self):
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.post(reverse('employees:department_create'), {
            'name': 'Engineering',
            'code': 'ENG',
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'already exists')

    # =================================================================
    # DESIGNATION TESTS (7 - 8)
    # =================================================================

    def test_07_admin_can_create_designation(self):
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.post(reverse('employees:designation_create'), {
            'title': 'QA Engineer',
            'department': self.dept_eng.id,
            'description': 'Automated testing and QA',
        })
        self.assertEqual(response.status_code, 302)
        self.assertTrue(Designation.objects.filter(title='QA Engineer', department=self.dept_eng).exists())

    def test_08_duplicate_designation_in_same_department_rejected(self):
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.post(reverse('employees:designation_create'), {
            'title': 'Backend Developer',
            'department': self.dept_eng.id,
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'already exists in the Engineering department')

    # =================================================================
    # EMPLOYEE CREATION & WORKFLOW TESTS (9 - 14)
    # =================================================================

    def test_09_hr_can_create_employee(self):
        self.client.login(login_id='OIHRMG20260001', password='HrPassword123!')
        response = self.client.post(reverse('employees:employee_create'), {
            'first_name': 'Bob',
            'last_name': 'Marley',
            'email': 'bob.marley@dayflow.com',
            'mobile': '9876543299',
            'company': self.company.id,
            'department': self.dept_eng.id,
            'designation': self.desig_dev.id,
            'joining_date': '2026-03-01',
            'role': User.Role.EMPLOYEE,
            'country': 'India',
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Employee Onboarded Successfully!')
        self.assertTrue(Employee.objects.filter(email='bob.marley@dayflow.com').exists())

    def test_10_admin_can_create_employee(self):
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.post(reverse('employees:employee_create'), {
            'first_name': 'Alice',
            'last_name': 'Walker',
            'email': 'alice.walker@dayflow.com',
            'mobile': '9876543298',
            'company': self.company.id,
            'department': self.dept_eng.id,
            'designation': self.desig_lead.id,
            'joining_date': '2026-03-01',
            'role': User.Role.EMPLOYEE,
            'country': 'India',
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Employee.objects.filter(email='alice.walker@dayflow.com').exists())

    def test_11_login_id_generated_correctly(self):
        login_id = generate_employee_login_id(self.company.code, 'Charlie', 'Chaplin', 2026, 1)
        self.assertEqual(login_id, 'OICHCH20260001')
        # Standard format
        id_std = generate_employee_login_id('OI', 'John', 'Doe', 2026, 1)
        self.assertEqual(id_std, 'OIJODO20260001')

    def test_12_temporary_password_is_hashed_and_not_plaintext(self):
        emp, temp_pw = create_employee_workflow(
            company=self.company,
            first_name='David',
            last_name='Beckham',
            email='david@dayflow.com',
            mobile='9876543297',
        )
        self.assertTrue(emp.user.check_password(temp_pw))
        self.assertNotEqual(emp.user.password, temp_pw)
        self.assertTrue(emp.user.password.startswith('pbkdf2_sha256$'))

    def test_13_employee_created_with_flags(self):
        emp, _ = create_employee_workflow(
            company=self.company,
            first_name='Eva',
            last_name='Green',
            email='eva@dayflow.com',
            mobile='9876543296',
        )
        self.assertTrue(emp.user.must_change_password)
        self.assertTrue(emp.user.is_first_login)
        self.assertTrue(emp.is_active)
        self.assertTrue(emp.user.is_active)

    def test_14_user_employee_relationship_created(self):
        emp, _ = create_employee_workflow(
            company=self.company,
            first_name='Frank',
            last_name='Sinatra',
            email='frank@dayflow.com',
            mobile='9876543295',
        )
        self.assertEqual(emp.user.employee_profile, emp)
        self.assertEqual(emp.user_id, emp.user.id)

    # =================================================================
    # ACCESS CONTROL & OBJECT SECURITY TESTS (15 - 22)
    # =================================================================

    def test_15_employee_can_view_own_profile(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.get(reverse('employees:employee_detail', args=[self.employee1.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'John Doe')

    def test_16_employee_cannot_view_another_employee_profile(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        # Employee 1 attempts to access Employee 2's profile
        response = self.client.get(reverse('employees:employee_detail', args=[self.employee2.id]))
        self.assertEqual(response.status_code, 403)

    def test_17_employee_cannot_modify_login_id(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        self.client.post(reverse('employees:employee_edit', args=[self.employee1.id]), {
            'login_id': 'HACKED0001',
            'mobile': '9999999999',
        })
        self.emp1_user.refresh_from_db()
        self.assertEqual(self.emp1_user.login_id, 'OIJODO20260001')

    def test_18_employee_cannot_modify_role(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        self.client.post(reverse('employees:employee_edit', args=[self.employee1.id]), {
            'role': User.Role.ADMIN,
            'mobile': '9999999999',
        })
        self.emp1_user.refresh_from_db()
        self.assertEqual(self.emp1_user.role, User.Role.EMPLOYEE)

    def test_19_employee_cannot_modify_company(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        self.client.post(reverse('employees:employee_edit', args=[self.employee1.id]), {
            'company': self.company2.id,
            'mobile': '9999999999',
        })
        self.employee1.refresh_from_db()
        self.assertEqual(self.employee1.company, self.company)

    def test_20_employee_cannot_modify_department(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        self.client.post(reverse('employees:employee_edit', args=[self.employee1.id]), {
            'department': self.dept_hr.id,
            'mobile': '9999999999',
        })
        self.employee1.refresh_from_db()
        self.assertEqual(self.employee1.department, self.dept_eng)

    def test_21_employee_cannot_modify_designation(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        self.client.post(reverse('employees:employee_edit', args=[self.employee1.id]), {
            'designation': self.desig_lead.id,
            'mobile': '9999999999',
        })
        self.employee1.refresh_from_db()
        self.assertEqual(self.employee1.designation, self.desig_dev)

    def test_22_employee_cannot_modify_joining_date(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        self.client.post(reverse('employees:employee_edit', args=[self.employee1.id]), {
            'joining_date': '2020-01-01',
            'mobile': '9999999999',
        })
        self.employee1.refresh_from_db()
        self.assertEqual(self.employee1.joining_date, date(2026, 1, 15))

    # =================================================================
    # SEARCH & FILTER TESTS (23 - 29)
    # =================================================================

    def test_23_search_by_name(self):
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('employees:employee_list') + '?q=Jane')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Jane Smith')
        self.assertNotContains(response, 'John Doe')

    def test_24_search_by_login_id(self):
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('employees:employee_list') + '?q=OIJODO20260001')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'John Doe')
        self.assertNotContains(response, 'Jane Smith')

    def test_25_search_by_email(self):
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('employees:employee_list') + '?q=jane.smith@dayflow.com')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Jane Smith')

    def test_26_filter_by_company(self):
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('employees:employee_list') + f'?company={self.company.id}')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'John Doe')

    def test_27_filter_by_department(self):
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('employees:employee_list') + f'?department={self.dept_hr.id}')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Helen Rogers')
        self.assertNotContains(response, 'John Doe')

    def test_28_filter_by_designation(self):
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('employees:employee_list') + f'?designation={self.desig_lead.id}')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Jane Smith')
        self.assertNotContains(response, 'John Doe')

    def test_29_filter_by_active_status(self):
        self.employee2.is_active = False
        self.employee2.save()
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        active_resp = self.client.get(reverse('employees:employee_list') + '?status=active')
        self.assertContains(active_resp, 'John Doe')
        self.assertNotContains(active_resp, 'Jane Smith')

        inactive_resp = self.client.get(reverse('employees:employee_list') + '?status=inactive')
        self.assertContains(inactive_resp, 'Jane Smith')
        self.assertNotContains(inactive_resp, 'John Doe')

    # =================================================================
    # SKILLS TESTS (30 - 34)
    # =================================================================

    def test_30_add_skill(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('employees:employee_skill_add', args=[self.employee1.id]), {
            'skill': self.skill_python.id,
            'proficiency_level': EmployeeSkill.Proficiency.EXPERT,
            'years_of_experience': '4.5',
        })
        self.assertEqual(response.status_code, 302)
        self.assertTrue(EmployeeSkill.objects.filter(employee=self.employee1, skill=self.skill_python).exists())

    def test_31_duplicate_skill_rejected(self):
        EmployeeSkill.objects.create(
            employee=self.employee1,
            skill=self.skill_python,
            proficiency_level=EmployeeSkill.Proficiency.ADVANCED,
        )
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('employees:employee_skill_add', args=[self.employee1.id]), {
            'skill': self.skill_python.id,
            'proficiency_level': EmployeeSkill.Proficiency.EXPERT,
            'years_of_experience': '5.0',
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'already added to this employee profile')

    def test_32_edit_skill(self):
        emp_skill = EmployeeSkill.objects.create(
            employee=self.employee1,
            skill=self.skill_python,
            proficiency_level=EmployeeSkill.Proficiency.BEGINNER,
            years_of_experience=1.0,
        )
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('employees:employee_skill_edit', args=[self.employee1.id, emp_skill.id]), {
            'skill': self.skill_python.id,
            'proficiency_level': EmployeeSkill.Proficiency.EXPERT,
            'years_of_experience': '3.0',
        })
        self.assertEqual(response.status_code, 302)
        emp_skill.refresh_from_db()
        self.assertEqual(emp_skill.proficiency_level, EmployeeSkill.Proficiency.EXPERT)

    def test_33_delete_skill(self):
        emp_skill = EmployeeSkill.objects.create(
            employee=self.employee1,
            skill=self.skill_python,
            proficiency_level=EmployeeSkill.Proficiency.INTERMEDIATE,
        )
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('employees:employee_skill_delete', args=[self.employee1.id, emp_skill.id]))
        self.assertEqual(response.status_code, 302)
        self.assertFalse(EmployeeSkill.objects.filter(id=emp_skill.id).exists())

    def test_34_skill_ownership_enforced(self):
        emp_skill2 = EmployeeSkill.objects.create(
            employee=self.employee2,
            skill=self.skill_django,
            proficiency_level=EmployeeSkill.Proficiency.ADVANCED,
        )
        # Employee 1 cannot edit or delete Employee 2's skills
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('employees:employee_skill_delete', args=[self.employee2.id, emp_skill2.id]))
        self.assertEqual(response.status_code, 403)
        self.assertTrue(EmployeeSkill.objects.filter(id=emp_skill2.id).exists())

    # =================================================================
    # CERTIFICATIONS TESTS (35 - 37)
    # =================================================================

    def test_35_add_certification(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('employees:employee_certification_add', args=[self.employee1.id]), {
            'title': 'AWS Certified Developer',
            'issuing_organization': 'Amazon Web Services',
            'issue_date': '2025-01-10',
            'expiration_date': '2028-01-10',
            'credential_id': 'AWS-123456',
        })
        self.assertEqual(response.status_code, 302)
        self.assertTrue(EmployeeCertification.objects.filter(employee=self.employee1, title='AWS Certified Developer').exists())

    def test_36_invalid_expiration_date_rejected(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('employees:employee_certification_add', args=[self.employee1.id]), {
            'title': 'Certified Kubernetes Administrator',
            'issuing_organization': 'CNCF',
            'issue_date': '2026-01-10',
            'expiration_date': '2024-01-10',  # earlier than issue date
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Expiration date cannot be earlier than the issue date')

    def test_37_certification_ownership_enforced(self):
        cert2 = EmployeeCertification.objects.create(
            employee=self.employee2,
            title='Scrum Master',
            issuing_organization='Scrum Alliance',
            issue_date='2025-05-01',
        )
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('employees:employee_certification_delete', args=[self.employee2.id, cert2.id]))
        self.assertEqual(response.status_code, 403)
        self.assertTrue(EmployeeCertification.objects.filter(id=cert2.id).exists())

    # =================================================================
    # DOCUMENTS TESTS (38 - 40)
    # =================================================================

    def test_38_upload_document(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        test_file = SimpleUploadedFile('resume.pdf', b'%PDF-1.4 sample content', content_type='application/pdf')
        response = self.client.post(reverse('employees:employee_document_add', args=[self.employee1.id]), {
            'title': 'John Doe Resume 2026',
            'document_type': EmployeeDocument.DocumentType.RESUME,
            'file': test_file,
        })
        self.assertEqual(response.status_code, 302)
        self.assertTrue(EmployeeDocument.objects.filter(employee=self.employee1, title='John Doe Resume 2026').exists())

    def test_39_unauthorized_document_access_rejected(self):
        doc2 = EmployeeDocument.objects.create(
            employee=self.employee2,
            title='Jane ID Proof',
            document_type=EmployeeDocument.DocumentType.ID_PROOF,
            file=SimpleUploadedFile('id.pdf', b'sample id', content_type='application/pdf'),
        )
        # Employee 1 attempts to download Employee 2's document
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.get(reverse('employees:employee_document_download', args=[self.employee2.id, doc2.id]))
        self.assertEqual(response.status_code, 403)

    def test_40_unauthorized_document_deletion_rejected(self):
        doc2 = EmployeeDocument.objects.create(
            employee=self.employee2,
            title='Jane Offer Letter',
            document_type=EmployeeDocument.DocumentType.OFFER_LETTER,
            file=SimpleUploadedFile('offer.pdf', b'sample offer', content_type='application/pdf'),
        )
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('employees:employee_document_delete', args=[self.employee2.id, doc2.id]))
        self.assertEqual(response.status_code, 403)
        self.assertTrue(EmployeeDocument.objects.filter(id=doc2.id).exists())

    # =================================================================
    # ACTIVATION / DEACTIVATION TESTS (41 - 44)
    # =================================================================

    def test_41_deactivate_employee(self):
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.post(reverse('employees:employee_deactivate', args=[self.employee1.id]))
        self.assertEqual(response.status_code, 302)
        self.employee1.refresh_from_db()
        self.emp1_user.refresh_from_db()
        self.assertFalse(self.employee1.is_active)
        self.assertFalse(self.emp1_user.is_active)

    def test_42_deactivated_employee_cannot_login(self):
        self.employee1.is_active = False
        self.employee1.save()
        self.emp1_user.is_active = False
        self.emp1_user.save()

        response = self.client.post(reverse('accounts:login'), {
            'login_id': 'OIJODO20260001',
            'password': 'Password123!',
        })
        self.assertEqual(response.status_code, 200)
        self.assertFalse('_auth_user_id' in self.client.session)

    def test_43_activate_employee(self):
        self.employee1.is_active = False
        self.employee1.save()
        self.emp1_user.is_active = False
        self.emp1_user.save()

        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.post(reverse('employees:employee_activate', args=[self.employee1.id]))
        self.assertEqual(response.status_code, 302)
        self.employee1.refresh_from_db()
        self.emp1_user.refresh_from_db()
        self.assertTrue(self.employee1.is_active)
        self.assertTrue(self.emp1_user.is_active)

    def test_44_activated_employee_can_login(self):
        self.employee1.is_active = True
        self.employee1.save()
        self.emp1_user.is_active = True
        self.emp1_user.save()

        response = self.client.post(reverse('accounts:login'), {
            'login_id': 'OIJODO20260001',
            'password': 'Password123!',
        })
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('accounts:dashboard'))
