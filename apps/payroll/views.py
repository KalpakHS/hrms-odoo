from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied, ValidationError
from django.core.paginator import Paginator
from django.db.models import Q
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from accounts.permissions import (
    admin_required,
    admin_or_hr_required,
    can_access_employee_data,
)
from employees.models import Company, Department, Designation, Employee
from .forms import SalaryStructureForm, PayslipPaymentForm, PayslipGenerateForm
from .models import SalaryStructure, Payslip
from .services import (
    create_or_update_salary_structure,
    generate_payslip,
    update_payment_status,
    generate_payslip_pdf,
    get_payroll_summary_stats,
)


@login_required
def payroll_dashboard(request):
    """
    Main Payroll Hub:
    - Employees see their current compensation package, latest payslip, and recent payout history.
    - Admin/HR see organization-wide payroll totals, active salary counts, and current month generation metrics.
    """
    user = request.user
    employee = getattr(user, 'employee_profile', None)

    # 1. Employee Compensation Snapshot
    salary_structure = None
    my_latest_payslip = None
    my_recent_payslips = []
    if employee:
        salary_structure = getattr(employee, 'salary_structure', None)
        payslips_qs = Payslip.objects.filter(employee=employee).order_by('-year', '-month')
        my_latest_payslip = payslips_qs.first()
        my_recent_payslips = payslips_qs[:6]

    # 2. Admin / HR Org-wide Overview
    stats = None
    recent_org_payslips = []
    is_admin_or_hr = user.is_admin or user.is_hr or user.is_superuser
    if is_admin_or_hr:
        stats = get_payroll_summary_stats()
        recent_org_payslips = (
            Payslip.objects.select_related(
                'employee', 'employee__user', 'employee__department', 'employee__company'
            )
            .order_by('-generated_at')[:8]
        )

    return render(request, 'payroll/dashboard.html', {
        'employee': employee,
        'salary_structure': salary_structure,
        'my_latest_payslip': my_latest_payslip,
        'my_recent_payslips': my_recent_payslips,
        'is_admin_or_hr': is_admin_or_hr,
        'stats': stats,
        'recent_org_payslips': recent_org_payslips,
        'today': timezone.localdate(),
    })


@admin_or_hr_required
def salary_list(request):
    """
    Admin & HR organizational employee salary directory.
    Includes search, multi-field filters, and pagination.
    """
    queryset = Employee.objects.filter(is_active=True).select_related(
        'user',
        'company',
        'department',
        'designation',
        'salary_structure',
    ).all().order_by('first_name', 'last_name')

    # Search (Employee name, login ID, email)
    q = request.GET.get('q', '').strip()
    if q:
        queryset = queryset.filter(
            Q(first_name__icontains=q) |
            Q(last_name__icontains=q) |
            Q(user__login_id__icontains=q) |
            Q(email__icontains=q)
        )

    # Filters
    company_id = request.GET.get('company', '').strip()
    department_id = request.GET.get('department', '').strip()
    designation_id = request.GET.get('designation', '').strip()
    has_salary = request.GET.get('has_salary', '').strip()

    if company_id and company_id.isdigit():
        queryset = queryset.filter(company_id=company_id)
    if department_id and department_id.isdigit():
        queryset = queryset.filter(department_id=department_id)
    if designation_id and designation_id.isdigit():
        queryset = queryset.filter(designation_id=designation_id)
    if has_salary == 'yes':
        queryset = queryset.filter(salary_structure__isnull=False, salary_structure__is_active=True)
    elif has_salary == 'no':
        queryset = queryset.filter(Q(salary_structure__isnull=True) | Q(salary_structure__is_active=False))

    paginator = Paginator(queryset, 15)
    page_obj = paginator.get_page(request.GET.get('page'))

    companies = Company.objects.all()
    departments = Department.objects.all()
    designations = Designation.objects.all()

    return render(request, 'payroll/salary_list.html', {
        'page_obj': page_obj,
        'companies': companies,
        'departments': departments,
        'designations': designations,
        'selected_q': q,
        'selected_company': company_id,
        'selected_dept': department_id,
        'selected_desig': designation_id,
        'selected_has_salary': has_salary,
        'total_count': paginator.count,
    })


@login_required
def salary_detail(request, employee_id):
    """
    Detailed salary structure and compensation breakdown for an employee.
    Enforces object-level ownership:
    - Admin/HR can view any employee's salary.
    - Regular employee can ONLY view their own salary.
    """
    target_employee = get_object_or_404(
        Employee.objects.select_related('user', 'company', 'department', 'designation', 'salary_structure'),
        id=employee_id,
    )

    if not can_access_employee_data(request.user, target_employee):
        raise PermissionDenied('You do not have permission to view this salary structure.')

    salary = getattr(target_employee, 'salary_structure', None)
    is_admin_or_hr = request.user.is_admin or request.user.is_hr or request.user.is_superuser

    return render(request, 'payroll/salary_detail.html', {
        'target_employee': target_employee,
        'salary': salary,
        'is_admin_or_hr': is_admin_or_hr,
    })


@admin_or_hr_required
def salary_create(request, employee_id):
    """Admin / HR creation of a salary structure for an employee."""
    target_employee = get_object_or_404(Employee, id=employee_id)

    if hasattr(target_employee, 'salary_structure') and target_employee.salary_structure:
        return redirect('payroll:salary_edit', employee_id=target_employee.id)

    if request.method == 'POST':
        form = SalaryStructureForm(request.POST)
        if form.is_valid():
            try:
                salary = create_or_update_salary_structure(
                    employee=target_employee,
                    monthly_wage=form.cleaned_data['monthly_wage'],
                    effective_from=form.cleaned_data['effective_from'],
                    standard_allowance=form.cleaned_data['standard_allowance'],
                    performance_bonus=form.cleaned_data['performance_bonus'],
                    leave_travel_allowance=form.cleaned_data['leave_travel_allowance'],
                    fixed_allowance=form.cleaned_data['fixed_allowance'],
                    professional_tax=form.cleaned_data['professional_tax'],
                    other_deductions=form.cleaned_data['other_deductions'],
                    is_active=form.cleaned_data['is_active'],
                )
                messages.success(request, f'Salary structure configured for {target_employee.full_name}.')
                return redirect('payroll:salary_detail', employee_id=target_employee.id)
            except ValidationError as e:
                form.add_error(None, e.message if hasattr(e, 'message') else str(e))
    else:
        form = SalaryStructureForm(initial={'effective_from': timezone.localdate()})

    return render(request, 'payroll/salary_form.html', {
        'form': form,
        'target_employee': target_employee,
        'title': f'Configure Salary Structure: {target_employee.full_name}',
    })


@admin_or_hr_required
def salary_edit(request, employee_id):
    """Admin / HR modification of an existing employee salary structure."""
    target_employee = get_object_or_404(Employee, id=employee_id)
    salary_instance = get_object_or_404(SalaryStructure, employee=target_employee)

    if request.method == 'POST':
        form = SalaryStructureForm(request.POST, instance=salary_instance)
        if form.is_valid():
            try:
                create_or_update_salary_structure(
                    employee=target_employee,
                    monthly_wage=form.cleaned_data['monthly_wage'],
                    effective_from=form.cleaned_data['effective_from'],
                    standard_allowance=form.cleaned_data['standard_allowance'],
                    performance_bonus=form.cleaned_data['performance_bonus'],
                    leave_travel_allowance=form.cleaned_data['leave_travel_allowance'],
                    fixed_allowance=form.cleaned_data['fixed_allowance'],
                    professional_tax=form.cleaned_data['professional_tax'],
                    other_deductions=form.cleaned_data['other_deductions'],
                    is_active=form.cleaned_data['is_active'],
                )
                messages.success(request, f'Salary structure updated for {target_employee.full_name}.')
                return redirect('payroll:salary_detail', employee_id=target_employee.id)
            except ValidationError as e:
                form.add_error(None, e.message if hasattr(e, 'message') else str(e))
    else:
        form = SalaryStructureForm(instance=salary_instance)

    return render(request, 'payroll/salary_form.html', {
        'form': form,
        'target_employee': target_employee,
        'title': f'Edit Salary Structure: {target_employee.full_name}',
    })


@admin_or_hr_required
def payslip_list(request):
    """
    Admin & HR organizational payslip directory.
    Search, filters, and pagination.
    """
    queryset = Payslip.objects.select_related(
        'employee',
        'employee__user',
        'employee__company',
        'employee__department',
    ).all().order_by('-year', '-month', '-generated_at')

    # Search
    q = request.GET.get('q', '').strip()
    if q:
        queryset = queryset.filter(
            Q(employee__first_name__icontains=q) |
            Q(employee__last_name__icontains=q) |
            Q(employee__user__login_id__icontains=q) |
            Q(transaction_id__icontains=q)
        )

    # Filters
    month = request.GET.get('month', '').strip()
    year = request.GET.get('year', '').strip()
    payment_status = request.GET.get('payment_status', '').strip()
    employee_id = request.GET.get('employee', '').strip()

    if month and month.isdigit():
        queryset = queryset.filter(month=int(month))
    if year and year.isdigit():
        queryset = queryset.filter(year=int(year))
    if payment_status:
        queryset = queryset.filter(payment_status=payment_status)
    if employee_id and employee_id.isdigit():
        queryset = queryset.filter(employee_id=int(employee_id))

    paginator = Paginator(queryset, 15)
    page_obj = paginator.get_page(request.GET.get('page'))

    employees = Employee.objects.filter(is_active=True).order_by('first_name', 'last_name')

    return render(request, 'payroll/payslip_list.html', {
        'page_obj': page_obj,
        'employees': employees,
        'status_choices': Payslip.Status.choices,
        'month_choices': [(i, f"{i:02d}") for i in range(1, 13)],
        'selected_q': q,
        'selected_month': month,
        'selected_year': year,
        'selected_status': payment_status,
        'selected_emp': employee_id,
        'total_count': paginator.count,
    })


@login_required
def my_payslips(request):
    """
    Employee personal payslip history.
    Strictly isolated to request.user.employee_profile.
    """
    employee = getattr(request.user, 'employee_profile', None)
    if not employee:
        messages.error(request, 'You do not have an active employee profile.')
        return redirect('accounts:dashboard')

    queryset = Payslip.objects.filter(employee=employee).order_by('-year', '-month')

    # Filters
    month = request.GET.get('month', '').strip()
    year = request.GET.get('year', '').strip()
    payment_status = request.GET.get('payment_status', '').strip()

    if month and month.isdigit():
        queryset = queryset.filter(month=int(month))
    if year and year.isdigit():
        queryset = queryset.filter(year=int(year))
    if payment_status:
        queryset = queryset.filter(payment_status=payment_status)

    paginator = Paginator(queryset, 10)
    page_obj = paginator.get_page(request.GET.get('page'))

    return render(request, 'payroll/my_payslips.html', {
        'page_obj': page_obj,
        'status_choices': Payslip.Status.choices,
        'month_choices': [(i, f"{i:02d}") for i in range(1, 13)],
        'selected_month': month,
        'selected_year': year,
        'selected_status': payment_status,
        'total_count': paginator.count,
    })


@login_required
def payslip_detail(request, id):
    """
    Detailed payslip view with object-level security:
    - Admin/HR: full access.
    - Regular employee: own payslip only (403 on URL ID manipulation).
    """
    payslip = get_object_or_404(
        Payslip.objects.select_related('employee', 'employee__user', 'employee__company', 'employee__department', 'employee__designation'),
        id=id,
    )

    if not can_access_employee_data(request.user, payslip.employee):
        raise PermissionDenied('You do not have permission to view this payslip.')

    is_admin_or_hr = request.user.is_admin or request.user.is_hr or request.user.is_superuser
    is_owner = getattr(request.user, 'employee_profile', None) == payslip.employee

    return render(request, 'payroll/payslip_detail.html', {
        'payslip': payslip,
        'is_admin_or_hr': is_admin_or_hr,
        'is_owner': is_owner,
    })


@admin_or_hr_required
def payslip_generate_view(request):
    """
    Admin / HR interface to generate payslips for a selected month and year.
    Supports generating for a single employee or bulk for all active employees with a salary structure.
    """
    if request.method == 'POST':
        form = PayslipGenerateForm(request.POST)
        if form.is_valid():
            target_emp = form.cleaned_data.get('employee')
            month = int(form.cleaned_data['month'])
            year = int(form.cleaned_data['year'])

            if target_emp:
                try:
                    payslip, created = generate_payslip(target_emp, month, year)
                    if created:
                        messages.success(request, f'Payslip generated for {target_emp.full_name} for {month:02d}/{year}.')
                    else:
                        messages.info(request, f'Payslip for {target_emp.full_name} ({month:02d}/{year}) already exists.')
                    return redirect('payroll:payslip_detail', id=payslip.id)
                except ValidationError as e:
                    messages.error(request, str(e.message if hasattr(e, 'message') else e))
            else:
                # Bulk generation
                eligible_employees = Employee.objects.filter(is_active=True, salary_structure__is_active=True)
                created_count = 0
                existing_count = 0
                for emp in eligible_employees:
                    try:
                        _, created = generate_payslip(emp, month, year)
                        if created:
                            created_count += 1
                        else:
                            existing_count += 1
                    except Exception:
                        pass
                messages.success(
                    request,
                    f'Payslip batch generation completed for {month:02d}/{year}: {created_count} generated, {existing_count} already existed.'
                )
                return redirect('payroll:payslip_list')
    else:
        form = PayslipGenerateForm()

    return render(request, 'payroll/payslip_generate.html', {'form': form})


@admin_or_hr_required
def payslip_payment_update(request, id):
    """
    Admin / HR interface to update payment status and record transaction references.
    """
    payslip = get_object_or_404(Payslip.objects.select_related('employee', 'employee__user'), id=id)

    if request.method == 'POST':
        form = PayslipPaymentForm(request.POST, instance=payslip)
        if form.is_valid():
            update_payment_status(
                payslip_id=payslip.id,
                payment_status=form.cleaned_data['payment_status'],
                payment_date=form.cleaned_data.get('payment_date'),
                payment_method=form.cleaned_data.get('payment_method'),
                transaction_id=form.cleaned_data.get('transaction_id'),
                remarks=form.cleaned_data.get('remarks'),
            )
            messages.success(request, f'Payment status updated for {payslip.employee.full_name} ({payslip.month:02d}/{payslip.year}).')
            return redirect('payroll:payslip_detail', id=payslip.id)
    else:
        form = PayslipPaymentForm(instance=payslip)

    return render(request, 'payroll/payslip_payment.html', {
        'form': form,
        'payslip': payslip,
    })


@login_required
def payslip_pdf(request, id):
    """
    Generates and securely serves a PDF payslip.
    Enforces object-level authorization (Admin/HR: all; Employee: own only).
    """
    payslip = get_object_or_404(
        Payslip.objects.select_related('employee', 'employee__user', 'employee__company', 'employee__department', 'employee__designation'),
        id=id,
    )

    if not can_access_employee_data(request.user, payslip.employee):
        raise PermissionDenied('You do not have permission to download this payslip PDF.')

    buffer = generate_payslip_pdf(payslip)
    filename = f"Payslip_{payslip.employee.user.login_id}_{payslip.month:02d}_{payslip.year}.pdf"

    return FileResponse(buffer, as_attachment=True, filename=filename, content_type='application/pdf')
