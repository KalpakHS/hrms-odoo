from datetime import date
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone

from employees.models import Company, Department, Designation, Employee
from payroll.models import SalaryStructure, Payslip
from payroll.services import (
    calculate_salary_components,
    create_or_update_salary_structure,
    generate_payslip,
    update_payment_status,
    generate_payslip_pdf,
    get_payroll_summary_stats,
)

User = get_user_model()


class PayrollManagementComprehensiveTests(TestCase):
    """
    Comprehensive test suite covering all 31+ payroll scenarios:
    - Calculation engine accuracy (yearly, basic, hra, pf, pt, allowances, gross, deductions, net)
    - Decimal precision & floating point safety
    - SalaryStructure management & RBAC
    - Payslip generation, idempotency & historical snapshot isolation
    - Payment status workflows
    - PDF payslip generation and access authorization
    - Object-level security and ID tampering protection
    - Search, filters, pagination, and dashboard metrics
    """

    def setUp(self):
        self.client = Client()

        # Company & Departments
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

        # HR User & Profile
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
    # CALCULATION ENGINE & PRECISION TESTS (1 - 10, 31)
    # =================================================================

    def test_01_salary_structure_creation(self):
        salary = create_or_update_salary_structure(
            employee=self.employee1,
            monthly_wage=Decimal('60000.00'),
            effective_from=date(2026, 1, 1),
        )
        self.assertIsNotNone(salary.id)
        self.assertEqual(salary.employee, self.employee1)
        self.assertTrue(salary.is_active)

    def test_02_salary_calculation_components_accuracy(self):
        # Monthly CTC = 60,000
        # Basic = 50% = 30,000
        # HRA = 50% of Basic = 15,000
        # Standard Allowance = 3,000
        # Performance Bonus = 2,000
        # LTA = 1,000
        # Remainder Fixed Allowance = 60,000 - (30,000 + 15,000 + 3,000 + 2,000 + 1,000) = 9,000
        # Gross = 30,000 + 15,000 + 3,000 + 2,000 + 1,000 + 9,000 = 60,000
        # PF = 12% of Basic = 3,600
        # PT = 200
        # Total Deductions = 3,600 + 200 = 3,800
        # Net Salary = 60,000 - 3,800 = 56,200
        comp = calculate_salary_components(
            monthly_wage=Decimal('60000.00'),
            standard_allowance=Decimal('3000.00'),
            performance_bonus=Decimal('2000.00'),
            leave_travel_allowance=Decimal('1000.00'),
        )
        self.assertEqual(comp['yearly_wage'], Decimal('720000.00'))
        self.assertEqual(comp['basic_salary'], Decimal('30000.00'))
        self.assertEqual(comp['hra'], Decimal('15000.00'))
        self.assertEqual(comp['fixed_allowance'], Decimal('9000.00'))
        self.assertEqual(comp['gross_salary'], Decimal('60000.00'))
        self.assertEqual(comp['provident_fund'], Decimal('3600.00'))
        self.assertEqual(comp['professional_tax'], Decimal('200.00'))
        self.assertEqual(comp['total_deductions'], Decimal('3800.00'))
        self.assertEqual(comp['net_salary'], Decimal('56200.00'))

    def test_03_yearly_wage_calculation(self):
        comp = calculate_salary_components(monthly_wage=Decimal('50000.00'))
        self.assertEqual(comp['yearly_wage'], Decimal('600000.00'))

    def test_04_basic_salary_calculation(self):
        comp = calculate_salary_components(monthly_wage=Decimal('100000.00'))
        self.assertEqual(comp['basic_salary'], Decimal('50000.00'))

    def test_05_hra_calculation(self):
        comp = calculate_salary_components(monthly_wage=Decimal('80000.00'))
        self.assertEqual(comp['basic_salary'], Decimal('40000.00'))
        self.assertEqual(comp['hra'], Decimal('20000.00'))

    def test_06_pf_calculation(self):
        comp = calculate_salary_components(monthly_wage=Decimal('50000.00'))
        self.assertEqual(comp['basic_salary'], Decimal('25000.00'))
        self.assertEqual(comp['provident_fund'], Decimal('3000.00'))

    def test_07_professional_tax_default(self):
        comp = calculate_salary_components(monthly_wage=Decimal('40000.00'))
        self.assertEqual(comp['professional_tax'], Decimal('200.00'))

    def test_08_gross_salary_calculation(self):
        comp = calculate_salary_components(
            monthly_wage=Decimal('50000.00'),
            standard_allowance=Decimal('2500.00'),
            fixed_allowance=Decimal('10000.00'),
        )
        # Basic(25k) + HRA(12.5k) + Standard(2.5k) + Fixed(10k) = 50,000
        self.assertEqual(comp['gross_salary'], Decimal('50000.00'))

    def test_09_total_deductions_calculation(self):
        comp = calculate_salary_components(
            monthly_wage=Decimal('50000.00'),
            other_deductions=Decimal('500.00'),
        )
        # PF(3000) + PT(200) + other(500) = 3700
        self.assertEqual(comp['total_deductions'], Decimal('3700.00'))

    def test_10_net_salary_calculation(self):
        comp = calculate_salary_components(monthly_wage=Decimal('50000.00'))
        # Gross(50k) - Deductions(3000+200=3200) = 46,800
        self.assertEqual(comp['net_salary'], Decimal('46800.00'))

    def test_31_decimal_precision_no_floating_point_inaccuracy(self):
        comp = calculate_salary_components(monthly_wage=Decimal('33333.33'))
        self.assertIsInstance(comp['basic_salary'], Decimal)
        self.assertIsInstance(comp['net_salary'], Decimal)
        self.assertEqual(comp['basic_salary'], Decimal('16666.66'))

    # =================================================================
    # RBAC & ACCESS CONTROL TESTS (11 - 15)
    # =================================================================

    def test_11_employee_cannot_modify_salary_structure(self):
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.get(reverse('payroll:salary_create', args=[self.employee2.id]))
        self.assertEqual(response.status_code, 403)

        response_post = self.client.post(reverse('payroll:salary_create', args=[self.employee1.id]), {
            'monthly_wage': '100000.00',
            'effective_from': '2026-01-01',
            'is_active': True,
        })
        self.assertEqual(response_post.status_code, 403)

    def test_12_admin_can_manage_salary_structure(self):
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.post(reverse('payroll:salary_create', args=[self.employee1.id]), {
            'monthly_wage': '75000.00',
            'effective_from': '2026-01-01',
            'is_active': True,
        })
        self.assertEqual(response.status_code, 302)
        self.employee1.refresh_from_db()
        self.assertEqual(self.employee1.salary_structure.monthly_wage, Decimal('75000.00'))

    def test_13_hr_can_manage_salary_structure(self):
        self.client.login(login_id='OIHRMG20260001', password='HrPassword123!')
        response = self.client.post(reverse('payroll:salary_create', args=[self.employee2.id]), {
            'monthly_wage': '65000.00',
            'effective_from': '2026-01-01',
            'is_active': True,
        })
        self.assertEqual(response.status_code, 302)
        self.employee2.refresh_from_db()
        self.assertEqual(self.employee2.salary_structure.monthly_wage, Decimal('65000.00'))

    def test_14_employee_can_view_own_salary(self):
        create_or_update_salary_structure(self.employee1, Decimal('50000.00'), date(2026, 1, 1))
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.get(reverse('payroll:salary_detail', args=[self.employee1.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '50000.00')

    def test_15_employee_cannot_view_another_employee_salary(self):
        create_or_update_salary_structure(self.employee2, Decimal('80000.00'), date(2026, 1, 1))
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.get(reverse('payroll:salary_detail', args=[self.employee2.id]))
        self.assertEqual(response.status_code, 403)

    # =================================================================
    # PAYSLIP GENERATION & HISTORICAL SNAPSHOT TESTS (16 - 19)
    # =================================================================

    def test_16_payslip_generation(self):
        create_or_update_salary_structure(self.employee1, Decimal('50000.00'), date(2026, 1, 1))
        payslip, created = generate_payslip(self.employee1, month=8, year=2026)
        self.assertTrue(created)
        self.assertEqual(payslip.month, 8)
        self.assertEqual(payslip.year, 2026)
        self.assertEqual(payslip.gross_salary, Decimal('50000.00'))
        self.assertEqual(payslip.net_pay, Decimal('46800.00'))

    def test_17_payslip_contains_historical_salary_snapshot(self):
        # Initial salary 50,000
        create_or_update_salary_structure(self.employee1, Decimal('50000.00'), date(2026, 1, 1))
        payslip, _ = generate_payslip(self.employee1, month=8, year=2026)
        self.assertEqual(payslip.gross_salary, Decimal('50000.00'))

        # Increment salary to 80,000
        create_or_update_salary_structure(self.employee1, Decimal('80000.00'), date(2026, 9, 1))

        # Re-fetch payslip: old snapshot must remain untouched
        payslip.refresh_from_db()
        self.assertEqual(payslip.gross_salary, Decimal('50000.00'))
        self.assertEqual(payslip.net_pay, Decimal('46800.00'))

    def test_18_duplicate_payslip_generation_prevented(self):
        create_or_update_salary_structure(self.employee1, Decimal('50000.00'), date(2026, 1, 1))
        p1, created1 = generate_payslip(self.employee1, month=8, year=2026)
        self.assertTrue(created1)

        # Attempt duplicate generation
        p2, created2 = generate_payslip(self.employee1, month=8, year=2026)
        self.assertFalse(created2)
        self.assertEqual(p1.id, p2.id)

    def test_19_payslip_calculation_accuracy(self):
        create_or_update_salary_structure(
            self.employee1,
            monthly_wage=Decimal('60000.00'),
            effective_from=date(2026, 1, 1),
            standard_allowance=Decimal('3000.00'),
            performance_bonus=Decimal('2000.00'),
            leave_travel_allowance=Decimal('1000.00'),
        )
        payslip, _ = generate_payslip(self.employee1, month=8, year=2026)
        self.assertEqual(payslip.basic_salary, Decimal('30000.00'))
        self.assertEqual(payslip.hra, Decimal('15000.00'))
        self.assertEqual(payslip.allowances, Decimal('13000.00'))  # 3k standard + 1k LTA + 9k fixed
        self.assertEqual(payslip.bonus, Decimal('2000.00'))
        self.assertEqual(payslip.gross_salary, Decimal('60000.00'))
        self.assertEqual(payslip.provident_fund, Decimal('3600.00'))
        self.assertEqual(payslip.professional_tax, Decimal('200.00'))
        self.assertEqual(payslip.total_deductions, Decimal('3800.00'))
        self.assertEqual(payslip.net_pay, Decimal('56200.00'))

    # =================================================================
    # PAYSLIP ACCESS & SECURITY TESTS (20 - 23, 26)
    # =================================================================

    def test_20_employee_sees_only_own_payslips(self):
        create_or_update_salary_structure(self.employee1, Decimal('50000.00'), date(2026, 1, 1))
        create_or_update_salary_structure(self.employee2, Decimal('60000.00'), date(2026, 1, 1))
        generate_payslip(self.employee1, 8, 2026)
        generate_payslip(self.employee2, 8, 2026)

        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.get(reverse('payroll:my_payslips'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '46800.00')

    def test_21_employee_cannot_access_another_employee_payslip(self):
        create_or_update_salary_structure(self.employee2, Decimal('60000.00'), date(2026, 1, 1))
        p2, _ = generate_payslip(self.employee2, 8, 2026)

        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.get(reverse('payroll:payslip_detail', args=[p2.id]))
        self.assertEqual(response.status_code, 403)

    def test_22_admin_can_access_organizational_payslips(self):
        create_or_update_salary_structure(self.employee1, Decimal('50000.00'), date(2026, 1, 1))
        generate_payslip(self.employee1, 8, 2026)

        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('payroll:payslip_list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'John Doe')

    def test_23_hr_can_access_organizational_payslips(self):
        create_or_update_salary_structure(self.employee1, Decimal('50000.00'), date(2026, 1, 1))
        generate_payslip(self.employee1, 8, 2026)

        self.client.login(login_id='OIHRMG20260001', password='HrPassword123!')
        response = self.client.get(reverse('payroll:payslip_list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'John Doe')

    def test_26_pdf_access_authorization_and_generation(self):
        create_or_update_salary_structure(self.employee1, Decimal('50000.00'), date(2026, 1, 1))
        p1, _ = generate_payslip(self.employee1, 8, 2026)

        # Owner can download PDF
        self.client.login(login_id='OIJODO20260001', password='Password123!')
        resp_owner = self.client.get(reverse('payroll:payslip_pdf', args=[p1.id]))
        self.assertEqual(resp_owner.status_code, 200)
        self.assertEqual(resp_owner['Content-Type'], 'application/pdf')

        # Admin can download PDF
        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        resp_admin = self.client.get(reverse('payroll:payslip_pdf', args=[p1.id]))
        self.assertEqual(resp_admin.status_code, 200)

        # Other employee receives 403
        self.client.login(login_id='OIJASM20260002', password='Password123!')
        resp_other = self.client.get(reverse('payroll:payslip_pdf', args=[p1.id]))
        self.assertEqual(resp_other.status_code, 403)

    # =================================================================
    # PAYMENT STATUS & WORKFLOWS (24 - 25)
    # =================================================================

    def test_24_payment_status_update(self):
        create_or_update_salary_structure(self.employee1, Decimal('50000.00'), date(2026, 1, 1))
        p1, _ = generate_payslip(self.employee1, 8, 2026)

        update_payment_status(
            payslip_id=p1.id,
            payment_status=Payslip.Status.PAID,
            payment_date=date(2026, 8, 31),
            payment_method='Bank Transfer',
            transaction_id='TXN20260831001',
            remarks='Disbursed via HDFC',
        )
        p1.refresh_from_db()
        self.assertEqual(p1.payment_status, Payslip.Status.PAID)
        self.assertEqual(p1.transaction_id, 'TXN20260831001')

    def test_25_employee_cannot_modify_payment_status(self):
        create_or_update_salary_structure(self.employee1, Decimal('50000.00'), date(2026, 1, 1))
        p1, _ = generate_payslip(self.employee1, 8, 2026)

        self.client.login(login_id='OIJODO20260001', password='Password123!')
        response = self.client.post(reverse('payroll:payslip_payment_update', args=[p1.id]), {
            'payment_status': Payslip.Status.PAID,
        })
        self.assertEqual(response.status_code, 403)

    # =================================================================
    # SEARCH, FILTERS, PAGINATION & DASHBOARD METRICS (27 - 30)
    # =================================================================

    def test_27_search_salary_directory(self):
        create_or_update_salary_structure(self.employee1, Decimal('50000.00'), date(2026, 1, 1))
        create_or_update_salary_structure(self.employee2, Decimal('60000.00'), date(2026, 1, 1))

        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('payroll:salary_list') + '?q=Jane')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Jane Smith')
        self.assertNotContains(response, 'John Doe')

    def test_28_filters_salary_directory(self):
        create_or_update_salary_structure(self.employee1, Decimal('50000.00'), date(2026, 1, 1))

        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('payroll:salary_list') + '?has_salary=yes')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'John Doe')
        self.assertNotContains(response, 'Jane Smith')

    def test_29_pagination_salary_directory(self):
        # Create 16 employees
        for i in range(16):
            u = User.objects.create_user(
                login_id=f'TESTEMP{i:04d}',
                email=f'emp{i}@dayflow.com',
                password='Password123!',
                first_name='Test',
                last_name=f'User{i}',
            )
            Employee.objects.create(
                user=u,
                company=self.company,
                department=self.dept_eng,
                first_name='Test',
                last_name=f'User{i}',
                email=f'emp{i}@dayflow.com',
                joining_date=date(2026, 1, 1),
            )

        self.client.login(login_id='ADMIN0001', password='AdminPassword123!')
        response = self.client.get(reverse('payroll:salary_list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context['page_obj']), 15)

    def test_30_payroll_dashboard_statistics(self):
        create_or_update_salary_structure(self.employee1, Decimal('50000.00'), date(2026, 1, 1))
        create_or_update_salary_structure(self.employee2, Decimal('70000.00'), date(2026, 1, 1))

        stats = get_payroll_summary_stats()
        self.assertEqual(stats['total_active_structures'], 2)
        self.assertEqual(stats['total_monthly_payroll'], Decimal('120000.00'))
        self.assertEqual(stats['total_gross_payroll'], Decimal('120000.00'))
