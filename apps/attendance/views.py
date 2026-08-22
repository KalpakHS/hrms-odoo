from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied, ValidationError
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from accounts.permissions import (
    admin_required,
    admin_or_hr_required,
    can_access_employee_data,
)
from employees.models import Company, Department, Employee
from .forms import AttendanceAdminForm, AttendanceCorrectionForm
from .models import Attendance
from .services import (
    check_in_employee,
    check_out_employee,
    get_today_attendance,
    get_attendance_summary_stats,
)


@login_required
def attendance_dashboard(request):
    """
    Main Attendance Hub:
    - Employees see today's check-in/out status, action buttons, and personal recent log.
    - Admin/HR see organization-wide summary statistics and today's attendance logs.
    """
    user = request.user
    today = timezone.localdate()
    employee = getattr(user, 'employee_profile', None)

    # 1. Personal Attendance Card context for employees / any user with profile
    today_record = None
    recent_records = []
    if employee:
        today_record = get_today_attendance(employee, date_val=today)
        recent_records = Attendance.objects.filter(employee=employee).order_by('-date')[:7]

    # 2. Admin / HR Organization Stats context
    stats = None
    today_all_records = []
    is_admin_or_hr = user.is_admin or user.is_hr or user.is_superuser
    if is_admin_or_hr:
        stats = get_attendance_summary_stats(date_val=today)
        today_all_records = (
            Attendance.objects.filter(date=today)
            .select_related('employee', 'employee__user', 'employee__department')
            .order_by('employee__first_name')
        )

    return render(request, 'attendance/dashboard.html', {
        'employee': employee,
        'today': today,
        'today_record': today_record,
        'recent_records': recent_records,
        'is_admin_or_hr': is_admin_or_hr,
        'stats': stats,
        'today_all_records': today_all_records,
    })


@login_required
@require_POST
def check_in_view(request):
    """Handles employee self-service check-in."""
    employee = getattr(request.user, 'employee_profile', None)
    if not employee:
        messages.error(request, 'No employee profile linked to your user account.')
        return redirect('attendance:dashboard')

    notes = request.POST.get('notes', '').strip()
    try:
        attendance = check_in_employee(employee, notes=notes)
        messages.success(request, f'Checked in successfully at {attendance.check_in.strftime("%I:%M %p")}. Status: {attendance.get_status_display()}.')
    except ValidationError as e:
        messages.error(request, str(e.message if hasattr(e, 'message') else e))

    return redirect(request.POST.get('next') or 'attendance:dashboard')


@login_required
@require_POST
def check_out_view(request):
    """Handles employee self-service check-out."""
    employee = getattr(request.user, 'employee_profile', None)
    if not employee:
        messages.error(request, 'No employee profile linked to your user account.')
        return redirect('attendance:dashboard')

    notes = request.POST.get('notes', '').strip()
    try:
        attendance = check_out_employee(employee, notes=notes)
        messages.success(request, f'Checked out successfully at {attendance.check_out.strftime("%I:%M %p")}. Total work hours: {attendance.work_hours} hrs.')
    except ValidationError as e:
        messages.error(request, str(e.message if hasattr(e, 'message') else e))

    return redirect(request.POST.get('next') or 'attendance:dashboard')


@login_required
def my_attendance(request):
    """
    Employee attendance history view.
    Strictly isolated to the logged-in employee's own records.
    """
    employee = getattr(request.user, 'employee_profile', None)
    if not employee:
        messages.error(request, 'You do not have an active employee profile.')
        return redirect('accounts:dashboard')

    queryset = Attendance.objects.filter(employee=employee).order_by('-date')

    # Date filters
    date_from = request.GET.get('date_from', '').strip()
    date_to = request.GET.get('date_to', '').strip()
    status = request.GET.get('status', '').strip()

    if date_from:
        queryset = queryset.filter(date__gte=date_from)
    if date_to:
        queryset = queryset.filter(date__lte=date_to)
    if status:
        queryset = queryset.filter(status=status)

    paginator = Paginator(queryset, 15)
    page_obj = paginator.get_page(request.GET.get('page'))

    return render(request, 'attendance/my_attendance.html', {
        'employee': employee,
        'page_obj': page_obj,
        'selected_from': date_from,
        'selected_to': date_to,
        'selected_status': status,
        'status_choices': Attendance.Status.choices,
        'total_count': paginator.count,
    })


@admin_or_hr_required
def attendance_list(request):
    """
    Admin & HR organizational attendance directory.
    Provides search, multi-field filtering, and pagination.
    """
    queryset = Attendance.objects.select_related(
        'employee',
        'employee__user',
        'employee__company',
        'employee__department',
        'employee__designation',
    ).all()

    # Search (employee name or login_id)
    q = request.GET.get('q', '').strip()
    if q:
        queryset = queryset.filter(
            Q(employee__first_name__icontains=q) |
            Q(employee__last_name__icontains=q) |
            Q(employee__user__login_id__icontains=q) |
            Q(employee__email__icontains=q)
        )

    # Filters
    employee_id = request.GET.get('employee', '').strip()
    company_id = request.GET.get('company', '').strip()
    department_id = request.GET.get('department', '').strip()
    status = request.GET.get('status', '').strip()
    date_val = request.GET.get('date', '').strip()
    date_from = request.GET.get('date_from', '').strip()
    date_to = request.GET.get('date_to', '').strip()

    if employee_id and employee_id.isdigit():
        queryset = queryset.filter(employee_id=employee_id)
    if company_id and company_id.isdigit():
        queryset = queryset.filter(employee__company_id=company_id)
    if department_id and department_id.isdigit():
        queryset = queryset.filter(employee__department_id=department_id)
    if status:
        queryset = queryset.filter(status=status)
    if date_val:
        queryset = queryset.filter(date=date_val)
    if date_from:
        queryset = queryset.filter(date__gte=date_from)
    if date_to:
        queryset = queryset.filter(date__lte=date_to)

    paginator = Paginator(queryset, 15)
    page_obj = paginator.get_page(request.GET.get('page'))

    employees = Employee.objects.select_related('user').all()
    companies = Company.objects.all()
    departments = Department.objects.all()

    return render(request, 'attendance/attendance_list.html', {
        'page_obj': page_obj,
        'employees': employees,
        'companies': companies,
        'departments': departments,
        'status_choices': Attendance.Status.choices,
        'selected_q': q,
        'selected_emp': employee_id,
        'selected_company': company_id,
        'selected_dept': department_id,
        'selected_status': status,
        'selected_date': date_val,
        'selected_from': date_from,
        'selected_to': date_to,
        'total_count': paginator.count,
    })


@login_required
def attendance_detail(request, id):
    """
    Detailed attendance record view.
    Enforces object-level ownership:
    - Admin & HR can view any attendance record.
    - Employee can view ONLY their own attendance record.
    """
    attendance = get_object_or_404(
        Attendance.objects.select_related(
            'employee',
            'employee__user',
            'employee__company',
            'employee__department',
            'employee__designation',
        ),
        id=id,
    )

    if not can_access_employee_data(request.user, attendance.employee):
        raise PermissionDenied('You do not have permission to view another employee\'s attendance record.')

    can_edit = request.user.is_admin or request.user.is_hr or request.user.is_superuser

    return render(request, 'attendance/attendance_detail.html', {
        'attendance': attendance,
        'can_edit': can_edit,
    })


@admin_or_hr_required
def attendance_create(request):
    """Manual creation of attendance record by Admin or HR."""
    if request.method == 'POST':
        form = AttendanceAdminForm(request.POST)
        if form.is_valid():
            record = form.save()
            messages.success(request, f'Attendance record for {record.employee.full_name} on {record.date} created successfully.')
            return redirect('attendance:attendance_list')
    else:
        form = AttendanceAdminForm()

    return render(request, 'attendance/attendance_form.html', {'form': form, 'title': 'Create Attendance Record'})


@admin_or_hr_required
def attendance_edit(request, id):
    """Manual correction of attendance record by Admin or HR."""
    record = get_object_or_404(
        Attendance.objects.select_related('employee', 'employee__user'),
        id=id,
    )

    if request.method == 'POST':
        form = AttendanceCorrectionForm(request.POST, instance=record)
        if form.is_valid():
            form.save()
            messages.success(request, f'Attendance record for {record.employee.full_name} on {record.date} updated successfully.')
            return redirect('attendance:attendance_detail', id=record.id)
    else:
        form = AttendanceCorrectionForm(instance=record)

    return render(request, 'attendance/attendance_form.html', {
        'form': form,
        'attendance': record,
        'title': f'Edit Attendance: {record.employee.full_name} ({record.date})',
    })
