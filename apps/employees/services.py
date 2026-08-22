"""
Service layer for Employee lifecycle management in Dayflow HRMS.
"""

from datetime import date
from django.db import transaction
from django.core.exceptions import ValidationError
from accounts.models import User
from .models import Employee, Company, Department, Designation
from .utils import generate_employee_login_id, generate_initial_password


@transaction.atomic
def create_employee_workflow(
    company,
    first_name,
    last_name,
    email,
    mobile,
    joining_date=None,
    department=None,
    designation=None,
    role=User.Role.EMPLOYEE,
    date_of_birth=None,
    gender=None,
    marital_status=None,
    blood_group=None,
    emergency_contact_name=None,
    emergency_contact_phone=None,
    address=None,
    city=None,
    state=None,
    country='India',
    postal_code=None,
    custom_password=None,
):
    """
    Executes the complete Admin/HR Employee onboarding workflow:
    1. Generates unique Login ID (e.g. OIJODO20260001).
    2. Generates high-entropy temporary password (or uses provided).
    3. Creates User account with Django password hashing and security flags:
       - must_change_password = True
       - is_first_login = True
    4. Creates linked Employee profile.
    5. Returns tuple: (employee, temporary_plaintext_password).

    NOTE: The plaintext password is only returned in memory at creation time
    and is never persisted or logged in plaintext.
    """
    if not email:
        raise ValidationError({'email': 'Work email is required.'})

    if User.objects.filter(email=email).exists() or Employee.objects.filter(email=email).exists():
        raise ValidationError({'email': f'An employee with email "{email}" already exists.'})

    joining_date = joining_date or date.today()
    joining_year = joining_date.year

    # 1. Generate unique Login ID
    login_id = generate_employee_login_id(
        company_name_or_code=company.code or company.name,
        first_name=first_name,
        last_name=last_name,
        joining_year=joining_year,
    )

    # 2. Generate secure temporary password
    temporary_password = custom_password or generate_initial_password(length=12)

    # 3. Create User account
    user = User(
        login_id=login_id,
        email=email,
        first_name=first_name,
        last_name=last_name,
        role=role,
        is_active=True,
        must_change_password=True,
        is_first_login=True,
    )
    user.set_password(temporary_password)
    user.save()

    # 4. Create linked Employee profile
    employee = Employee.objects.create(
        user=user,
        company=company,
        department=department,
        designation=designation,
        first_name=first_name,
        last_name=last_name,
        email=email,
        mobile=mobile,
        joining_date=joining_date,
        date_of_birth=date_of_birth,
        gender=gender,
        marital_status=marital_status,
        blood_group=blood_group,
        emergency_contact_name=emergency_contact_name,
        emergency_contact_phone=emergency_contact_phone,
        address=address,
        city=city,
        state=state,
        country=country,
        postal_code=postal_code,
        is_active=True,
    )

    return employee, temporary_password
