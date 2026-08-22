import os
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied, ValidationError
from django.core.paginator import Paginator
from django.db.models import Q
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from accounts.permissions import (
    admin_required,
    admin_or_hr_required,
    can_access_employee_data,
)
from employees.models import Company, Department, Employee
from .forms import LeaveApplicationForm, LeaveRejectionForm, LeaveTypeForm
from .models import LeaveType, LeaveRequest, LeaveBalance
from .services import (
    apply_for_leave,
    approve_leave_request,
    reject_leave_request,
    cancel_leave_request,
    get_employee_leave_balances,
    get_leave_summary_stats,
)


@login_required
def leave_dashboard(request):
    """
    Main Leave Management Hub:
    - Employees see their remaining balances (CL, SL, PL, UL), pending applications, and recent history.
    - Admin/HR see organization-wide pending counts, approved counts, on-leave counts, and recent applications.
    """
    user = request.user
    today = timezone.localdate()
    employee = getattr(user, 'employee_profile', None)

    # 1. Employee Leave Balances & Recent Requests
    balances = []
    my_recent_requests = []
    pending_count = 0
    if employee:
        balances = get_employee_leave_balances(employee, year=today.year)
        my_recent_requests = (
            LeaveRequest.objects.filter(employee=employee)
            .select_related('leave_type', 'approver')
            .order_by('-applied_on')[:5]
        )
        pending_count = LeaveRequest.objects.filter(employee=employee, status=LeaveRequest.Status.PENDING).count()

    # 2. Admin / HR Org-wide Overview
    stats = None
    recent_org_requests = []
    is_admin_or_hr = user.is_admin or user.is_hr or user.is_superuser
    if is_admin_or_hr:
        stats = get_leave_summary_stats()
        recent_org_requests = (
            LeaveRequest.objects.select_related(
                'employee', 'employee__user', 'employee__department', 'leave_type'
            )
            .order_by('-applied_on')[:8]
        )

    return render(request, 'leave/dashboard.html', {
        'employee': employee,
        'balances': balances,
        'my_recent_requests': my_recent_requests,
        'pending_count': pending_count,
        'is_admin_or_hr': is_admin_or_hr,
        'stats': stats,
        'recent_org_requests': recent_org_requests,
        'today': today,
    })


@login_required
def leave_apply(request):
    """View for employees to submit a leave application."""
    employee = getattr(request.user, 'employee_profile', None)
    if not employee:
        messages.error(request, 'You do not have an active employee profile to apply for leave.')
        return redirect('leave:dashboard')

    if request.method == 'POST':
        form = LeaveApplicationForm(request.POST, request.FILES, employee=employee)
        if form.is_valid():
            try:
                leave_request = apply_for_leave(
                    employee=employee,
                    leave_type=form.cleaned_data['leave_type'],
                    start_date=form.cleaned_data['start_date'],
                    end_date=form.cleaned_data['end_date'],
                    reason=form.cleaned_data['reason'],
                    attachment=form.cleaned_data.get('attachment'),
                )
                messages.success(
                    request,
                    f'Leave request for {leave_request.total_days} day(s) submitted successfully. Status: Pending Approval.'
                )
                return redirect('leave:my_leave')
            except ValidationError as e:
                form.add_error(None, e.message if hasattr(e, 'message') else str(e))
    else:
        form = LeaveApplicationForm(employee=employee)

    balances = get_employee_leave_balances(employee)
    return render(request, 'leave/leave_form.html', {
        'form': form,
        'balances': balances,
        'title': 'Apply for Leave',
    })


@login_required
def my_leave_list(request):
    """
    Employee personal leave history.
    Strictly restricted to the logged-in employee's own requests.
    """
    employee = getattr(request.user, 'employee_profile', None)
    if not employee:
        messages.error(request, 'You do not have an active employee profile.')
        return redirect('accounts:dashboard')

    queryset = (
        LeaveRequest.objects.filter(employee=employee)
        .select_related('leave_type', 'approver')
        .order_by('-applied_on')
    )

    # Filters
    status = request.GET.get('status', '').strip()
    leave_type_id = request.GET.get('leave_type', '').strip()
    date_from = request.GET.get('date_from', '').strip()
    date_to = request.GET.get('date_to', '').strip()

    if status:
        queryset = queryset.filter(status=status)
    if leave_type_id and leave_type_id.isdigit():
        queryset = queryset.filter(leave_type_id=leave_type_id)
    if date_from:
        queryset = queryset.filter(start_date__gte=date_from)
    if date_to:
        queryset = queryset.filter(end_date__lte=date_to)

    paginator = Paginator(queryset, 10)
    page_obj = paginator.get_page(request.GET.get('page'))

    leave_types = LeaveType.objects.all()

    return render(request, 'leave/my_leave.html', {
        'page_obj': page_obj,
        'leave_types': leave_types,
        'status_choices': LeaveRequest.Status.choices,
        'selected_status': status,
        'selected_type': leave_type_id,
        'selected_from': date_from,
        'selected_to': date_to,
        'total_count': paginator.count,
    })


@admin_or_hr_required
def leave_list(request):
    """
    Admin & HR organizational leave directory.
    Includes search, multi-field filters, and pagination.
    """
    queryset = LeaveRequest.objects.select_related(
        'employee',
        'employee__user',
        'employee__company',
        'employee__department',
        'leave_type',
        'approver',
    ).all().order_by('-applied_on')

    # Search (Employee name, login ID, email)
    q = request.GET.get('q', '').strip()
    if q:
        queryset = queryset.filter(
            Q(employee__first_name__icontains=q) |
            Q(employee__last_name__icontains=q) |
            Q(employee__user__login_id__icontains=q) |
            Q(employee__email__icontains=q)
        )

    # Filters
    leave_type_id = request.GET.get('leave_type', '').strip()
    status = request.GET.get('status', '').strip()
    department_id = request.GET.get('department', '').strip()
    company_id = request.GET.get('company', '').strip()
    date_from = request.GET.get('date_from', '').strip()
    date_to = request.GET.get('date_to', '').strip()

    if leave_type_id and leave_type_id.isdigit():
        queryset = queryset.filter(leave_type_id=leave_type_id)
    if status:
        queryset = queryset.filter(status=status)
    if department_id and department_id.isdigit():
        queryset = queryset.filter(employee__department_id=department_id)
    if company_id and company_id.isdigit():
        queryset = queryset.filter(employee__company_id=company_id)
    if date_from:
        queryset = queryset.filter(start_date__gte=date_from)
    if date_to:
        queryset = queryset.filter(end_date__lte=date_to)

    paginator = Paginator(queryset, 15)
    page_obj = paginator.get_page(request.GET.get('page'))

    leave_types = LeaveType.objects.all()
    departments = Department.objects.all()
    companies = Company.objects.all()

    return render(request, 'leave/leave_list.html', {
        'page_obj': page_obj,
        'leave_types': leave_types,
        'departments': departments,
        'companies': companies,
        'status_choices': LeaveRequest.Status.choices,
        'selected_q': q,
        'selected_type': leave_type_id,
        'selected_status': status,
        'selected_dept': department_id,
        'selected_company': company_id,
        'selected_from': date_from,
        'selected_to': date_to,
        'total_count': paginator.count,
    })


@login_required
def leave_detail(request, id):
    """
    Detailed leave request view.
    Enforces object-level ownership:
    - Admin & HR can view any request.
    - Employee can view ONLY their own request.
    """
    leave_request = get_object_or_404(
        LeaveRequest.objects.select_related(
            'employee',
            'employee__user',
            'employee__company',
            'employee__department',
            'leave_type',
            'approver',
        ),
        id=id,
    )

    if not can_access_employee_data(request.user, leave_request.employee):
        raise PermissionDenied('You do not have permission to view this leave application.')

    is_admin_or_hr = request.user.is_admin or request.user.is_hr or request.user.is_superuser
    is_owner = getattr(request.user, 'employee_profile', None) == leave_request.employee

    return render(request, 'leave/leave_detail.html', {
        'leave_request': leave_request,
        'is_admin_or_hr': is_admin_or_hr,
        'is_owner': is_owner,
    })


@admin_or_hr_required
@require_POST
def leave_approve(request, id):
    """Admin / HR approval of a pending leave request."""
    leave_request = get_object_or_404(LeaveRequest, id=id)

    try:
        approve_leave_request(leave_request.id, approver_user=request.user)
        messages.success(
            request,
            f'Leave request #{leave_request.id} for {leave_request.employee.full_name} has been APPROVED.'
        )
    except ValidationError as e:
        messages.error(request, str(e.message if hasattr(e, 'message') else e))

    return redirect(request.POST.get('next') or 'leave:leave_detail', id=leave_request.id)


@admin_or_hr_required
def leave_reject(request, id):
    """Admin / HR rejection of a pending leave request with mandatory remarks."""
    leave_request = get_object_or_404(
        LeaveRequest.objects.select_related('employee', 'leave_type'),
        id=id,
    )

    if request.method == 'POST':
        form = LeaveRejectionForm(request.POST)
        if form.is_valid():
            try:
                reject_leave_request(
                    leave_request.id,
                    approver_user=request.user,
                    rejection_reason=form.cleaned_data['rejection_reason'],
                )
                messages.warning(
                    request,
                    f'Leave request #{leave_request.id} for {leave_request.employee.full_name} has been REJECTED.'
                )
                return redirect('leave:leave_detail', id=leave_request.id)
            except ValidationError as e:
                messages.error(request, str(e.message if hasattr(e, 'message') else e))
    else:
        form = LeaveRejectionForm()

    return render(request, 'leave/leave_reject.html', {
        'form': form,
        'leave_request': leave_request,
    })


@login_required
@require_POST
def leave_cancel(request, id):
    """Employee cancellation of own pending leave request."""
    employee = getattr(request.user, 'employee_profile', None)
    if not employee:
        raise PermissionDenied('No employee profile associated with account.')

    leave_request = get_object_or_404(LeaveRequest, id=id)

    if leave_request.employee != employee:
        raise PermissionDenied('You can only cancel your own leave requests.')

    try:
        cancel_leave_request(leave_request.id, employee=employee)
        messages.info(request, f'Leave request #{leave_request.id} has been cancelled.')
    except ValidationError as e:
        messages.error(request, str(e.message if hasattr(e, 'message') else e))

    return redirect(request.POST.get('next') or 'leave:my_leave')


@login_required
def leave_attachment_download(request, id):
    """
    Secure authorized download endpoint for leave attachments.
    Verifies object-level authorization before serving the file.
    """
    leave_request = get_object_or_404(LeaveRequest, id=id)

    if not leave_request.attachment:
        raise Http404('No attachment associated with this leave request.')

    if not can_access_employee_data(request.user, leave_request.employee):
        raise PermissionDenied('You do not have permission to view or download this attachment.')

    file_path = leave_request.attachment.path
    if not os.path.exists(file_path):
        raise Http404('The requested file could not be found on the server.')

    return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=os.path.basename(file_path))


@admin_or_hr_required
def leave_type_list(request):
    """Catalog of all Leave Types."""
    leave_types = LeaveType.objects.all().order_by('name')
    return render(request, 'leave/leave_type_list.html', {'leave_types': leave_types})


@admin_required
def leave_type_create(request):
    """Admin view to create a new leave type."""
    if request.method == 'POST':
        form = LeaveTypeForm(request.POST)
        if form.is_valid():
            lt = form.save()
            messages.success(request, f'Leave type "{lt.name}" created successfully.')
            return redirect('leave:leave_type_list')
    else:
        form = LeaveTypeForm()

    return render(request, 'leave/leave_type_form.html', {'form': form, 'title': 'Create Leave Type'})


@admin_required
def leave_type_edit(request, id):
    """Admin view to edit an existing leave type."""
    leave_type = get_object_or_404(LeaveType, id=id)
    if request.method == 'POST':
        form = LeaveTypeForm(request.POST, instance=leave_type)
        if form.is_valid():
            lt = form.save()
            messages.success(request, f'Leave type "{lt.name}" updated successfully.')
            return redirect('leave:leave_type_list')
    else:
        form = LeaveTypeForm(instance=leave_type)

    return render(request, 'leave/leave_type_form.html', {
        'form': form,
        'leave_type': leave_type,
        'title': f'Edit Leave Type: {leave_type.name}',
    })
