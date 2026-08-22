import os
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.core.paginator import Paginator
from django.db.models import Q
from django.http import FileResponse, Http404, HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from accounts.permissions import (
    admin_required,
    admin_or_hr_required,
    can_access_employee_data,
    check_employee_ownership_or_403,
)
from .forms import (
    CompanyForm,
    DepartmentForm,
    DesignationForm,
    EmployeeCreationForm,
    EmployeeAdminUpdateForm,
    EmployeeSelfUpdateForm,
    EmployeeSkillForm,
    EmployeeCertificationForm,
    EmployeeDocumentForm,
)
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
from .services import create_employee_workflow


# =====================================================================
# COMPANY MANAGEMENT (Admin: Full, HR: View/List, Employee: None)
# =====================================================================

@admin_or_hr_required
def company_list(request):
    companies = Company.objects.all()
    return render(request, 'employees/company_list.html', {
        'companies': companies,
        'can_manage': request.user.is_admin or request.user.is_superuser,
    })


@admin_required
def company_create(request):
    if request.method == 'POST':
        form = CompanyForm(request.POST)
        if form.is_valid():
            company = form.save()
            messages.success(request, f'Company "{company.name}" created successfully.')
            return redirect('employees:company_list')
    else:
        form = CompanyForm()
    return render(request, 'employees/company_form.html', {'form': form, 'title': 'Create Company'})


@admin_required
def company_edit(request, id):
    company = get_object_or_404(Company, id=id)
    if request.method == 'POST':
        form = CompanyForm(request.POST, instance=company)
        if form.is_valid():
            form.save()
            messages.success(request, f'Company "{company.name}" updated successfully.')
            return redirect('employees:company_list')
    else:
        form = CompanyForm(instance=company)
    return render(request, 'employees/company_form.html', {'form': form, 'company': company, 'title': 'Edit Company'})


# =====================================================================
# DEPARTMENT MANAGEMENT (Admin: Full, HR: View/List, Employee: None)
# =====================================================================

@admin_or_hr_required
def department_list(request):
    departments = Department.objects.all()
    return render(request, 'employees/department_list.html', {
        'departments': departments,
        'can_manage': request.user.is_admin or request.user.is_superuser,
    })


@admin_required
def department_create(request):
    if request.method == 'POST':
        form = DepartmentForm(request.POST)
        if form.is_valid():
            dept = form.save()
            messages.success(request, f'Department "{dept.name}" created successfully.')
            return redirect('employees:department_list')
    else:
        form = DepartmentForm()
    return render(request, 'employees/department_form.html', {'form': form, 'title': 'Create Department'})


@admin_required
def department_edit(request, id):
    department = get_object_or_404(Department, id=id)
    if request.method == 'POST':
        form = DepartmentForm(request.POST, instance=department)
        if form.is_valid():
            form.save()
            messages.success(request, f'Department "{department.name}" updated successfully.')
            return redirect('employees:department_list')
    else:
        form = DepartmentForm(instance=department)
    return render(request, 'employees/department_form.html', {'form': form, 'department': department, 'title': 'Edit Department'})


# =====================================================================
# DESIGNATION MANAGEMENT (Admin: Full, HR: View/List, Employee: None)
# =====================================================================

@admin_or_hr_required
def designation_list(request):
    designations = Designation.objects.select_related('department').all()
    return render(request, 'employees/designation_list.html', {
        'designations': designations,
        'can_manage': request.user.is_admin or request.user.is_superuser,
    })


@admin_required
def designation_create(request):
    if request.method == 'POST':
        form = DesignationForm(request.POST)
        if form.is_valid():
            desig = form.save()
            messages.success(request, f'Designation "{desig.title}" created successfully.')
            return redirect('employees:designation_list')
    else:
        form = DesignationForm()
    return render(request, 'employees/designation_form.html', {'form': form, 'title': 'Create Designation'})


@admin_required
def designation_edit(request, id):
    designation = get_object_or_404(Designation, id=id)
    if request.method == 'POST':
        form = DesignationForm(request.POST, instance=designation)
        if form.is_valid():
            form.save()
            messages.success(request, f'Designation "{designation.title}" updated successfully.')
            return redirect('employees:designation_list')
    else:
        form = DesignationForm(instance=designation)
    return render(request, 'employees/designation_form.html', {'form': form, 'designation': designation, 'title': 'Edit Designation'})


# =====================================================================
# EMPLOYEE ONBOARDING & LISTING
# =====================================================================

@admin_or_hr_required
def employee_create(request):
    """Admin/HR Employee onboarding workflow."""
    if request.method == 'POST':
        form = EmployeeCreationForm(request.POST, request.FILES)
        if form.is_valid():
            cleaned = form.cleaned_data
            employee, temp_password = create_employee_workflow(
                company=cleaned['company'],
                first_name=cleaned['first_name'],
                last_name=cleaned['last_name'],
                email=cleaned['email'],
                mobile=cleaned['mobile'],
                joining_date=cleaned['joining_date'],
                department=cleaned.get('department'),
                designation=cleaned.get('designation'),
                role=cleaned.get('role'),
                date_of_birth=cleaned.get('date_of_birth'),
                gender=cleaned.get('gender'),
                marital_status=cleaned.get('marital_status'),
                blood_group=cleaned.get('blood_group'),
                emergency_contact_name=cleaned.get('emergency_contact_name'),
                emergency_contact_phone=cleaned.get('emergency_contact_phone'),
                address=cleaned.get('address'),
                city=cleaned.get('city'),
                state=cleaned.get('state'),
                country=cleaned.get('country') or 'India',
                postal_code=cleaned.get('postal_code'),
            )
            # If avatar was provided
            if cleaned.get('avatar'):
                employee.avatar = cleaned['avatar']
                employee.save(update_fields=['avatar'])

            return render(request, 'employees/employee_created.html', {
                'employee': employee,
                'temporary_password': temp_password,
                'login_id': employee.user.login_id,
            })
    else:
        form = EmployeeCreationForm()

    return render(request, 'employees/employee_form.html', {'form': form, 'title': 'Onboard New Employee'})


@admin_or_hr_required
def employee_list(request):
    """
    Employee listing with search, filtering, and pagination.
    Accessible only to Admin and HR.
    """
    queryset = Employee.objects.select_related('user', 'company', 'department', 'designation').all()

    # Search (name, login_id, email)
    q = request.GET.get('q', '').strip()
    if q:
        queryset = queryset.filter(
            Q(first_name__icontains=q) |
            Q(last_name__icontains=q) |
            Q(email__icontains=q) |
            Q(user__login_id__icontains=q)
        )

    # Filter: Company
    company_id = request.GET.get('company')
    if company_id and company_id.isdigit():
        queryset = queryset.filter(company_id=company_id)

    # Filter: Department
    department_id = request.GET.get('department')
    if department_id and department_id.isdigit():
        queryset = queryset.filter(department_id=department_id)

    # Filter: Designation
    designation_id = request.GET.get('designation')
    if designation_id and designation_id.isdigit():
        queryset = queryset.filter(designation_id=designation_id)

    # Filter: Active Status
    status = request.GET.get('status')
    if status == 'active':
        queryset = queryset.filter(is_active=True)
    elif status == 'inactive':
        queryset = queryset.filter(is_active=False)

    # Pagination
    paginator = Paginator(queryset, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    companies = Company.objects.all()
    departments = Department.objects.all()
    designations = Designation.objects.all()

    return render(request, 'employees/employee_list.html', {
        'page_obj': page_obj,
        'companies': companies,
        'departments': departments,
        'designations': designations,
        'selected_q': q,
        'selected_company': company_id,
        'selected_department': department_id,
        'selected_designation': designation_id,
        'selected_status': status,
        'total_count': paginator.count,
    })


# =====================================================================
# EMPLOYEE PROFILE & EDITING (With Object-Level Security)
# =====================================================================

@login_required
def employee_detail(request, id):
    """
    Employee Profile View.
    Enforces object-level ownership:
    - Admin/HR can view any employee profile.
    - Employee can only view their own profile.
    """
    employee = get_object_or_404(
        Employee.objects.select_related('user', 'company', 'department', 'designation'),
        id=id,
    )
    check_employee_ownership_or_403(request.user, employee)

    skills = employee.skills.select_related('skill').all()
    certifications = employee.certifications.all()
    documents = employee.documents.all()

    can_manage_employee = request.user.is_admin or request.user.is_hr or request.user.is_superuser

    return render(request, 'employees/employee_detail.html', {
        'employee': employee,
        'skills': skills,
        'certifications': certifications,
        'documents': documents,
        'can_manage_employee': can_manage_employee,
        'is_self': (getattr(request.user, 'employee_profile', None) == employee or employee.user_id == request.user.id),
    })


@login_required
def employee_edit(request, id):
    """
    Employee Profile Edit View.
    - Admin/HR can edit job and personal details via EmployeeAdminUpdateForm.
    - Employee can edit only permitted personal fields via EmployeeSelfUpdateForm.
    """
    employee = get_object_or_404(Employee, id=id)
    check_employee_ownership_or_403(request.user, employee)

    is_admin_or_hr_user = request.user.is_admin or request.user.is_hr or request.user.is_superuser

    if request.method == 'POST':
        if is_admin_or_hr_user:
            form = EmployeeAdminUpdateForm(request.POST, request.FILES, instance=employee)
        else:
            form = EmployeeSelfUpdateForm(request.POST, request.FILES, instance=employee)

        if form.is_valid():
            form.save()
            messages.success(request, 'Employee profile updated successfully.')
            return redirect('employees:employee_detail', id=employee.id)
    else:
        if is_admin_or_hr_user:
            form = EmployeeAdminUpdateForm(instance=employee)
        else:
            form = EmployeeSelfUpdateForm(instance=employee)

    return render(request, 'employees/employee_form.html', {
        'form': form,
        'employee': employee,
        'title': f'Edit Profile - {employee.full_name}',
    })


# =====================================================================
# EMPLOYEE ACTIVATION / DEACTIVATION (Admin/HR Only)
# =====================================================================

@admin_or_hr_required
@require_POST
def employee_activate(request, id):
    employee = get_object_or_404(Employee, id=id)
    employee.is_active = True
    employee.save(update_fields=['is_active'])

    if employee.user:
        employee.user.is_active = True
        employee.user.save(update_fields=['is_active'])

    messages.success(request, f'Employee "{employee.full_name}" has been activated.')
    return redirect('employees:employee_detail', id=employee.id)


@admin_or_hr_required
@require_POST
def employee_deactivate(request, id):
    employee = get_object_or_404(Employee, id=id)
    employee.is_active = False
    employee.save(update_fields=['is_active'])

    if employee.user:
        employee.user.is_active = False
        employee.user.save(update_fields=['is_active'])

    messages.warning(request, f'Employee "{employee.full_name}" has been deactivated.')
    return redirect('employees:employee_detail', id=employee.id)


# =====================================================================
# SKILLS MANAGEMENT
# =====================================================================

@login_required
def employee_skill_add(request, id):
    employee = get_object_or_404(Employee, id=id)
    check_employee_ownership_or_403(request.user, employee)

    if request.method == 'POST':
        form = EmployeeSkillForm(request.POST, employee=employee)
        if form.is_valid():
            skill = form.save(commit=False)
            skill.employee = employee
            skill.save()
            messages.success(request, f'Skill "{skill.skill.name}" added successfully.')
            return redirect('employees:employee_detail', id=employee.id)
    else:
        form = EmployeeSkillForm(employee=employee)

    return render(request, 'employees/skill_form.html', {'form': form, 'employee': employee, 'title': 'Add Skill'})


@login_required
def employee_skill_edit(request, id, skill_id):
    employee = get_object_or_404(Employee, id=id)
    check_employee_ownership_or_403(request.user, employee)
    emp_skill = get_object_or_404(EmployeeSkill, id=skill_id, employee=employee)

    if request.method == 'POST':
        form = EmployeeSkillForm(request.POST, instance=emp_skill, employee=employee)
        if form.is_valid():
            form.save()
            messages.success(request, f'Skill "{emp_skill.skill.name}" updated successfully.')
            return redirect('employees:employee_detail', id=employee.id)
    else:
        form = EmployeeSkillForm(instance=emp_skill, employee=employee)

    return render(request, 'employees/skill_form.html', {'form': form, 'employee': employee, 'title': 'Edit Skill'})


@login_required
@require_POST
def employee_skill_delete(request, id, skill_id):
    employee = get_object_or_404(Employee, id=id)
    check_employee_ownership_or_403(request.user, employee)
    emp_skill = get_object_or_404(EmployeeSkill, id=skill_id, employee=employee)
    skill_name = emp_skill.skill.name
    emp_skill.delete()
    messages.info(request, f'Skill "{skill_name}" removed.')
    return redirect('employees:employee_detail', id=employee.id)


# =====================================================================
# CERTIFICATIONS MANAGEMENT
# =====================================================================

@login_required
def employee_certification_add(request, id):
    employee = get_object_or_404(Employee, id=id)
    check_employee_ownership_or_403(request.user, employee)

    if request.method == 'POST':
        form = EmployeeCertificationForm(request.POST, request.FILES)
        if form.is_valid():
            cert = form.save(commit=False)
            cert.employee = employee
            cert.save()
            messages.success(request, f'Certification "{cert.title}" added successfully.')
            return redirect('employees:employee_detail', id=employee.id)
    else:
        form = EmployeeCertificationForm()

    return render(request, 'employees/certification_form.html', {'form': form, 'employee': employee, 'title': 'Add Certification'})


@login_required
def employee_certification_edit(request, id, cert_id):
    employee = get_object_or_404(Employee, id=id)
    check_employee_ownership_or_403(request.user, employee)
    cert = get_object_or_404(EmployeeCertification, id=cert_id, employee=employee)

    if request.method == 'POST':
        form = EmployeeCertificationForm(request.POST, request.FILES, instance=cert)
        if form.is_valid():
            form.save()
            messages.success(request, f'Certification "{cert.title}" updated successfully.')
            return redirect('employees:employee_detail', id=employee.id)
    else:
        form = EmployeeCertificationForm(instance=cert)

    return render(request, 'employees/certification_form.html', {'form': form, 'employee': employee, 'title': 'Edit Certification'})


@login_required
@require_POST
def employee_certification_delete(request, id, cert_id):
    employee = get_object_or_404(Employee, id=id)
    check_employee_ownership_or_403(request.user, employee)
    cert = get_object_or_404(EmployeeCertification, id=cert_id, employee=employee)
    title = cert.title
    cert.delete()
    messages.info(request, f'Certification "{title}" deleted.')
    return redirect('employees:employee_detail', id=employee.id)


# =====================================================================
# DOCUMENTS MANAGEMENT (With Authorized File Download Endpoint)
# =====================================================================

@login_required
def employee_document_add(request, id):
    employee = get_object_or_404(Employee, id=id)
    check_employee_ownership_or_403(request.user, employee)

    if request.method == 'POST':
        form = EmployeeDocumentForm(request.POST, request.FILES)
        if form.is_valid():
            doc = form.save(commit=False)
            doc.employee = employee
            doc.save()
            messages.success(request, f'Document "{doc.title}" uploaded successfully.')
            return redirect('employees:employee_detail', id=employee.id)
    else:
        form = EmployeeDocumentForm()

    return render(request, 'employees/document_form.html', {'form': form, 'employee': employee, 'title': 'Upload Document'})


@login_required
def employee_document_download(request, id, document_id):
    """
    Secure, authorized document download endpoint.
    Verifies object-level ownership before serving the file.
    """
    employee = get_object_or_404(Employee, id=id)
    if not can_access_employee_data(request.user, employee):
        raise PermissionDenied('You do not have permission to view or download this document.')

    document = get_object_or_404(EmployeeDocument, id=document_id, employee=employee)
    if not document.file:
        raise Http404('File not found.')

    try:
        response = FileResponse(document.file.open('rb'))
        response['Content-Disposition'] = f'inline; filename="{os.path.basename(document.file.name)}"'
        return response
    except FileNotFoundError:
        raise Http404('The requested document file could not be found on disk.')


@login_required
@require_POST
def employee_document_delete(request, id, document_id):
    employee = get_object_or_404(Employee, id=id)
    check_employee_ownership_or_403(request.user, employee)
    document = get_object_or_404(EmployeeDocument, id=document_id, employee=employee)
    title = document.title
    document.delete()
    messages.info(request, f'Document "{title}" removed.')
    return redirect('employees:employee_detail', id=employee.id)
