import os
from django import forms
from django.core.exceptions import ValidationError
from accounts.models import User
from .models import (
    Company,
    Department,
    Designation,
    Employee,
    Skill,
    EmployeeSkill,
    EmployeeCertification,
    EmployeeDocument,
)


class CompanyForm(forms.ModelForm):
    """Form for creating and updating companies."""
    class Meta:
        model = Company
        fields = ['name', 'code', 'contact_email', 'contact_phone', 'address', 'website']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Odoo India'}),
            'code': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. OI'}),
            'contact_email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'contact@company.com'}),
            'contact_phone': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '+91 9876543210'}),
            'address': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Office street address'}),
            'website': forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://www.company.com'}),
        }

    def clean_code(self):
        code = self.cleaned_data.get('code', '').strip().upper()
        if not code:
            raise ValidationError('Company code is required.')
        qs = Company.objects.filter(code=code)
        if self.instance.pk:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise ValidationError(f'A company with code "{code}" already exists.')
        return code


class DepartmentForm(forms.ModelForm):
    """Form for creating and updating departments."""
    class Meta:
        model = Department
        fields = ['name', 'code', 'description']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Engineering'}),
            'code': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. ENG'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Department description'}),
        }

    def clean_code(self):
        code = self.cleaned_data.get('code', '').strip().upper()
        if not code:
            raise ValidationError('Department code is required.')
        qs = Department.objects.filter(code=code)
        if self.instance.pk:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise ValidationError(f'A department with code "{code}" already exists.')
        return code


class DesignationForm(forms.ModelForm):
    """Form for creating and updating designations."""
    class Meta:
        model = Designation
        fields = ['title', 'department', 'description']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Senior Software Engineer'}),
            'department': forms.Select(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Job responsibilities and requirements'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        title = cleaned_data.get('title')
        department = cleaned_data.get('department')
        if title and department:
            qs = Designation.objects.filter(title__iexact=title.strip(), department=department)
            if self.instance.pk:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise ValidationError(f'Designation "{title}" already exists in the {department.name} department.')
        return cleaned_data


class EmployeeCreationForm(forms.ModelForm):
    """Form for onboarding a new employee by Admin or HR."""
    role = forms.ChoiceField(
        choices=User.Role.choices,
        initial=User.Role.EMPLOYEE,
        widget=forms.Select(attrs={'class': 'form-control'}),
        help_text='System account role for login access.',
    )

    class Meta:
        model = Employee
        fields = [
            'first_name', 'last_name', 'email', 'mobile',
            'company', 'department', 'designation', 'joining_date',
            'date_of_birth', 'gender', 'marital_status', 'blood_group',
            'emergency_contact_name', 'emergency_contact_phone',
            'address', 'city', 'state', 'country', 'postal_code',
            'avatar',
        ]
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'First Name', 'required': True}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Last Name', 'required': True}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'work.email@company.com', 'required': True}),
            'mobile': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '+91 9876543210', 'required': True}),
            'company': forms.Select(attrs={'class': 'form-control', 'required': True}),
            'department': forms.Select(attrs={'class': 'form-control'}),
            'designation': forms.Select(attrs={'class': 'form-control'}),
            'joining_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date', 'required': True}),
            'date_of_birth': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'gender': forms.Select(attrs={'class': 'form-control'}),
            'marital_status': forms.Select(attrs={'class': 'form-control'}),
            'blood_group': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. O+'}),
            'emergency_contact_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Contact Name'}),
            'emergency_contact_phone': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Contact Mobile'}),
            'address': forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Residential Address'}),
            'city': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'City'}),
            'state': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'State'}),
            'country': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Country'}),
            'postal_code': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Postal Code'}),
            'avatar': forms.FileInput(attrs={'class': 'form-control', 'accept': 'image/*'}),
        }

    def clean_country(self):
        return self.cleaned_data.get('country') or 'India'

    def clean_email(self):
        email = self.cleaned_data.get('email', '').strip().lower()
        if User.objects.filter(email=email).exists() or Employee.objects.filter(email=email).exists():
            raise ValidationError(f'An account or employee with email "{email}" already exists.')
        return email


class EmployeeAdminUpdateForm(forms.ModelForm):
    """Form used by Admin and HR to update full employee details."""
    role = forms.ChoiceField(
        choices=User.Role.choices,
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'}),
    )

    class Meta:
        model = Employee
        fields = [
            'first_name', 'last_name', 'email', 'mobile',
            'company', 'department', 'designation', 'joining_date',
            'date_of_birth', 'gender', 'marital_status', 'blood_group',
            'emergency_contact_name', 'emergency_contact_phone',
            'address', 'city', 'state', 'country', 'postal_code',
            'avatar',
        ]
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'mobile': forms.TextInput(attrs={'class': 'form-control'}),
            'company': forms.Select(attrs={'class': 'form-control'}),
            'department': forms.Select(attrs={'class': 'form-control'}),
            'designation': forms.Select(attrs={'class': 'form-control'}),
            'joining_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'date_of_birth': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'gender': forms.Select(attrs={'class': 'form-control'}),
            'marital_status': forms.Select(attrs={'class': 'form-control'}),
            'blood_group': forms.TextInput(attrs={'class': 'form-control'}),
            'emergency_contact_name': forms.TextInput(attrs={'class': 'form-control'}),
            'emergency_contact_phone': forms.TextInput(attrs={'class': 'form-control'}),
            'address': forms.Textarea(attrs={'class': 'form-control', 'rows': 2}),
            'city': forms.TextInput(attrs={'class': 'form-control'}),
            'state': forms.TextInput(attrs={'class': 'form-control'}),
            'country': forms.TextInput(attrs={'class': 'form-control'}),
            'postal_code': forms.TextInput(attrs={'class': 'form-control'}),
            'avatar': forms.FileInput(attrs={'class': 'form-control', 'accept': 'image/*'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and hasattr(self.instance, 'user') and self.instance.user:
            self.fields['role'].initial = self.instance.user.role

    def clean_email(self):
        email = self.cleaned_data.get('email', '').strip().lower()
        emp_qs = Employee.objects.filter(email=email).exclude(pk=self.instance.pk)
        user_qs = User.objects.filter(email=email).exclude(pk=self.instance.user_id)
        if emp_qs.exists() or user_qs.exists():
            raise ValidationError(f'An account or employee with email "{email}" already exists.')
        return email

    def save(self, commit=True):
        employee = super().save(commit=commit)
        new_role = self.cleaned_data.get('role')
        if new_role and employee.user and employee.user.role != new_role:
            employee.user.role = new_role
            employee.user.save(update_fields=['role'])
        if employee.user and (employee.user.first_name != employee.first_name or employee.user.last_name != employee.last_name or employee.user.email != employee.email):
            employee.user.first_name = employee.first_name
            employee.user.last_name = employee.last_name
            employee.user.email = employee.email
            employee.user.save(update_fields=['first_name', 'last_name', 'email'])
        return employee


class EmployeeSelfUpdateForm(forms.ModelForm):
    """
    Form restricted to personal fields that employees are authorized to self-update.
    Completely excludes role, login_id, company, department, designation, joining_date, email, is_active.
    """
    class Meta:
        model = Employee
        fields = [
            'mobile', 'date_of_birth', 'gender', 'marital_status', 'blood_group',
            'emergency_contact_name', 'emergency_contact_phone',
            'address', 'city', 'state', 'country', 'postal_code',
            'avatar',
        ]
        widgets = {
            'mobile': forms.TextInput(attrs={'class': 'form-control'}),
            'date_of_birth': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'gender': forms.Select(attrs={'class': 'form-control'}),
            'marital_status': forms.Select(attrs={'class': 'form-control'}),
            'blood_group': forms.TextInput(attrs={'class': 'form-control'}),
            'emergency_contact_name': forms.TextInput(attrs={'class': 'form-control'}),
            'emergency_contact_phone': forms.TextInput(attrs={'class': 'form-control'}),
            'address': forms.Textarea(attrs={'class': 'form-control', 'rows': 2}),
            'city': forms.TextInput(attrs={'class': 'form-control'}),
            'state': forms.TextInput(attrs={'class': 'form-control'}),
            'country': forms.TextInput(attrs={'class': 'form-control'}),
            'postal_code': forms.TextInput(attrs={'class': 'form-control'}),
            'avatar': forms.FileInput(attrs={'class': 'form-control', 'accept': 'image/*'}),
        }


class EmployeeSkillForm(forms.ModelForm):
    """Form for adding or editing an employee skill."""
    class Meta:
        model = EmployeeSkill
        fields = ['skill', 'proficiency_level', 'years_of_experience']
        widgets = {
            'skill': forms.Select(attrs={'class': 'form-control'}),
            'proficiency_level': forms.Select(attrs={'class': 'form-control'}),
            'years_of_experience': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.5', 'min': '0'}),
        }

    def __init__(self, *args, employee=None, **kwargs):
        self.employee = employee
        super().__init__(*args, **kwargs)

    def clean_skill(self):
        skill = self.cleaned_data.get('skill')
        if self.employee and skill:
            qs = EmployeeSkill.objects.filter(employee=self.employee, skill=skill)
            if self.instance.pk:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise ValidationError(f'Skill "{skill.name}" is already added to this employee profile.')
        return skill


class EmployeeCertificationForm(forms.ModelForm):
    """Form for adding and updating employee certifications."""
    class Meta:
        model = EmployeeCertification
        fields = [
            'title', 'issuing_organization', 'issue_date',
            'expiration_date', 'credential_id', 'credential_url', 'certificate_file',
        ]
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. AWS Certified Solutions Architect'}),
            'issuing_organization': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Amazon Web Services'}),
            'issue_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'expiration_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'credential_id': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Credential ID / License Number'}),
            'credential_url': forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://verification-url.com'}),
            'certificate_file': forms.FileInput(attrs={'class': 'form-control'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        issue_date = cleaned_data.get('issue_date')
        expiration_date = cleaned_data.get('expiration_date')
        if issue_date and expiration_date and expiration_date < issue_date:
            raise ValidationError({'expiration_date': 'Expiration date cannot be earlier than the issue date.'})
        return cleaned_data


class EmployeeDocumentForm(forms.ModelForm):
    """Form for securely uploading employee documents."""
    DANGEROUS_EXTENSIONS = {
        '.exe', '.bat', '.sh', '.cmd', '.msi', '.js', '.vbs', '.php', '.py', '.bin', '.dll', '.scr', '.pif'
    }
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

    class Meta:
        model = EmployeeDocument
        fields = ['title', 'document_type', 'file']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Document Title (e.g. Passport Copy)'}),
            'document_type': forms.Select(attrs={'class': 'form-control'}),
            'file': forms.FileInput(attrs={'class': 'form-control'}),
        }

    def clean_file(self):
        file = self.cleaned_data.get('file')
        if file:
            ext = os.path.splitext(file.name)[1].lower()
            if ext in self.DANGEROUS_EXTENSIONS:
                raise ValidationError(f'Executable and script files ({ext}) are strictly prohibited.')
            if file.size > self.MAX_FILE_SIZE:
                raise ValidationError('File size exceeds the 10 MB limit.')
        return file
