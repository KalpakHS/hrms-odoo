"""
Dayflow HRMS Database Seeder.
Populates initial sample users, employees, payroll, attendance, and leave records.
Run with: python manage.py seed_dayflow
"""
from decimal import Decimal
from datetime import date, time, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from apps.authentication.models import User, UserRole
from apps.employees.models import Employee, EmploymentType
from apps.attendance.models import Attendance, AttendanceStatus
from apps.leaves.models import LeaveRequest, LeaveType, LeaveStatus
from apps.payroll.models import Payroll

class Command(BaseCommand):
    help = 'Seeds Dayflow HRMS initial roles, admin, employees, payroll, and test logs.'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting Dayflow HRMS database seeding...'))

        # 1. Create Admin User
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@dayflow.internal',
                'first_name': 'Sarah',
                'last_name': 'Connor',
                'role': UserRole.ADMIN,
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('Admin@12345')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Created Admin User: admin / Admin@12345'))
        else:
            self.stdout.write('Admin user already exists.')

        admin_emp, _ = Employee.objects.get_or_create(
            user=admin_user,
            defaults={
                'emp_code': 'EMP-001',
                'first_name': 'Sarah',
                'last_name': 'Connor',
                'email': 'admin@dayflow.internal',
                'phone': '+1-555-0100',
                'address': '100 Cyberdyne Way, Suite 400, San Francisco, CA',
                'department': 'Human Resources',
                'designation': 'HR Director',
                'joining_date': date(2023, 1, 15),
                'employment_type': EmploymentType.FULL_TIME
            }
        )
        Payroll.objects.get_or_create(
            employee=admin_emp,
            defaults={
                'basic_salary': Decimal('9500.00'),
                'allowances': Decimal('1500.00'),
                'deductions': Decimal('1200.00'),
                'currency': 'USD'
            }
        )

        # 2. Create Employee 1 (Software Engineer)
        emp1_user, created = User.objects.get_or_create(
            username='john_doe',
            defaults={
                'email': 'john.doe@dayflow.internal',
                'first_name': 'John',
                'last_name': 'Doe',
                'role': UserRole.EMPLOYEE,
                'is_staff': False
            }
        )
        if created:
            emp1_user.set_password('Employee@123')
            emp1_user.save()
            self.stdout.write(self.style.SUCCESS('Created Employee 1: john_doe / Employee@123'))

        emp1, _ = Employee.objects.get_or_create(
            user=emp1_user,
            defaults={
                'emp_code': 'EMP-002',
                'first_name': 'John',
                'last_name': 'Doe',
                'email': 'john.doe@dayflow.internal',
                'phone': '+1-555-0144',
                'address': '742 Evergreen Terrace, Springfield',
                'department': 'Engineering',
                'designation': 'Senior Full Stack Engineer',
                'joining_date': date(2023, 6, 1),
                'employment_type': EmploymentType.FULL_TIME,
                'emergency_contact_name': 'Jane Doe',
                'emergency_contact_phone': '+1-555-0145'
            }
        )
        Payroll.objects.get_or_create(
            employee=emp1,
            defaults={
                'basic_salary': Decimal('6500.00'),
                'allowances': Decimal('1000.00'),
                'deductions': Decimal('750.00'),
                'currency': 'USD'
            }
        )

        # 3. Create Employee 2 (Product Designer)
        emp2_user, created = User.objects.get_or_create(
            username='jane_smith',
            defaults={
                'email': 'jane.smith@dayflow.internal',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'role': UserRole.EMPLOYEE,
                'is_staff': False
            }
        )
        if created:
            emp2_user.set_password('Employee@123')
            emp2_user.save()
            self.stdout.write(self.style.SUCCESS('Created Employee 2: jane_smith / Employee@123'))

        emp2, _ = Employee.objects.get_or_create(
            user=emp2_user,
            defaults={
                'emp_code': 'EMP-003',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'email': 'jane.smith@dayflow.internal',
                'phone': '+1-555-0188',
                'address': '221B Baker Street, Suite 2B',
                'department': 'Product & Design',
                'designation': 'Lead UI/UX Designer',
                'joining_date': date(2024, 2, 1),
                'employment_type': EmploymentType.FULL_TIME
            }
        )
        Payroll.objects.get_or_create(
            employee=emp2,
            defaults={
                'basic_salary': Decimal('5800.00'),
                'allowances': Decimal('800.00'),
                'deductions': Decimal('600.00'),
                'currency': 'USD'
            }
        )

        # 4. Seed Attendance History for past 3 days
        today = timezone.localdate()
        for i in range(3):
            past_date = today - timedelta(days=i)
            Attendance.objects.get_or_create(
                employee=emp1,
                date=past_date,
                defaults={
                    'check_in': time(9, 0),
                    'check_out': time(17, 30),
                    'status': AttendanceStatus.PRESENT,
                    'notes': 'Standard workday'
                }
            )
            Attendance.objects.get_or_create(
                employee=emp2,
                date=past_date,
                defaults={
                    'check_in': time(9, 15),
                    'check_out': time(17, 45),
                    'status': AttendanceStatus.PRESENT,
                    'notes': 'Design reviews & sprints'
                }
            )

        # 5. Seed Sample Leave Request
        LeaveRequest.objects.get_or_create(
            employee=emp1,
            start_date=today + timedelta(days=5),
            end_date=today + timedelta(days=7),
            defaults={
                'leave_type': LeaveType.PAID,
                'remarks': 'Annual family vacation',
                'status': LeaveStatus.PENDING
            }
        )

        self.stdout.write(self.style.SUCCESS('\n[OK] Dayflow HRMS seeding completed successfully!'))
        self.stdout.write(self.style.SUCCESS('Admin Credentials:    admin / Admin@12345'))
        self.stdout.write(self.style.SUCCESS('Employee Credentials: john_doe / Employee@123, jane_smith / Employee@123'))
