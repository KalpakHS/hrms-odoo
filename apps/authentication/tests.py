from decimal import Decimal
from datetime import date, time
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.authentication.models import User, UserRole
from apps.employees.models import Employee
from apps.attendance.models import Attendance, AttendanceStatus
from apps.leaves.models import LeaveRequest, LeaveType, LeaveStatus
from apps.payroll.models import Payroll

class DayflowHRMSTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create Admin User & Profile
        self.admin_user = User.objects.create_user(
            username='admin_test',
            email='admin@test.internal',
            password='AdminPassword123!',
            role=UserRole.ADMIN
        )
        self.admin_emp = Employee.objects.create(
            user=self.admin_user,
            emp_code='EMP-ADM-01',
            first_name='Admin',
            last_name='User',
            email='admin@test.internal',
            joining_date=date(2023, 1, 1),
            department='HR'
        )

        # Create Employee User & Profile
        self.employee_user = User.objects.create_user(
            username='emp_test',
            email='emp@test.internal',
            password='EmpPassword123!',
            role=UserRole.EMPLOYEE
        )
        self.employee_emp = Employee.objects.create(
            user=self.employee_user,
            emp_code='EMP-DEV-01',
            first_name='Dev',
            last_name='Employee',
            email='emp@test.internal',
            joining_date=date(2023, 5, 1),
            department='Engineering'
        )
        self.employee_payroll = Payroll.objects.create(
            employee=self.employee_emp,
            basic_salary=Decimal('5000.00'),
            allowances=Decimal('500.00'),
            deductions=Decimal('300.00')
        )

    def test_login_and_token_generation(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'emp_test',
            'password': 'EmpPassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['role'], 'EMPLOYEE')

    def test_employee_cannot_access_admin_payroll_update(self):
        self.client.force_authenticate(user=self.employee_user)
        response = self.client.put(f'/api/payroll/records/{self.employee_payroll.id}/', {
            'basic_salary': '10000.00',
            'allowances': '1000.00',
            'deductions': '0.00'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_employee_can_view_own_payroll(self):
        self.client.force_authenticate(user=self.employee_user)
        response = self.client.get('/api/payroll/my-payroll/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(str(response.data['net_salary'])), Decimal('5200.00'))

    def test_employee_checkin_and_checkout(self):
        self.client.force_authenticate(user=self.employee_user)
        
        # Check-in
        checkin_res = self.client.post('/api/attendance/check-in/', {'notes': 'Starting shift'})
        self.assertEqual(checkin_res.status_code, status.HTTP_200_OK)

        # Check-out
        checkout_res = self.client.post('/api/attendance/check-out/', {'notes': 'Finishing shift'})
        self.assertEqual(checkout_res.status_code, status.HTTP_200_OK)

    def test_leave_application_and_admin_review(self):
        # 1. Employee applies for leave
        self.client.force_authenticate(user=self.employee_user)
        apply_res = self.client.post('/api/leaves/apply/', {
            'leave_type': 'PAID',
            'start_date': '2026-09-01',
            'end_date': '2026-09-03',
            'remarks': 'Annual trip'
        })
        self.assertEqual(apply_res.status_code, status.HTTP_201_CREATED)
        leave_id = apply_res.data['leave']['id']

        # 2. Employee cannot review their own leave
        review_fail_res = self.client.post(f'/api/leaves/requests/{leave_id}/review/', {
            'status': 'APPROVED',
            'admin_comment': 'Self approval should fail'
        })
        self.assertEqual(review_fail_res.status_code, status.HTTP_403_FORBIDDEN)

        # 3. Admin reviews and approves leave
        self.client.force_authenticate(user=self.admin_user)
        review_success_res = self.client.post(f'/api/leaves/requests/{leave_id}/review/', {
            'status': 'APPROVED',
            'admin_comment': 'Approved by HR Director'
        })
        self.assertEqual(review_success_res.status_code, status.HTTP_200_OK)
        self.assertEqual(review_success_res.data['leave']['status'], 'APPROVED')
