"""
Service layer for Dayflow HRMS Leave Management.
Encapsulates business logic, balance validation, atomic transactions, and approval workflows.
"""

from datetime import date
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from .models import LeaveType, LeaveRequest, LeaveBalance


def calculate_leave_days(start_date, end_date):
    """Calculates inclusive calendar days between start_date and end_date."""
    if not start_date or not end_date:
        return Decimal('0.0')
    if end_date < start_date:
        raise ValidationError('End date cannot be earlier than start date.')
    return Decimal((end_date - start_date).days + 1)


def get_or_create_leave_balance(employee, leave_type, year=None):
    """
    Retrieves or initializes an employee's leave balance for a given leave type and year.
    Defaults allocated days to LeaveType.max_days_per_year.
    """
    target_year = year or timezone.localdate().year
    balance, created = LeaveBalance.objects.get_or_create(
        employee=employee,
        leave_type=leave_type,
        year=target_year,
        defaults={
            'total_allocated': leave_type.max_days_per_year,
            'used_days': Decimal('0.0'),
        },
    )
    return balance


def get_employee_leave_balances(employee, year=None):
    """
    Returns a list of leave balance objects for all active leave types for the employee.
    Ensures all leave types have an initialized balance record for the year.
    """
    target_year = year or timezone.localdate().year
    leave_types = LeaveType.objects.all().order_by('name')
    balances = []
    for lt in leave_types:
        balance = get_or_create_leave_balance(employee, lt, target_year)
        balances.append(balance)
    return balances


@transaction.atomic
def apply_for_leave(employee, leave_type, start_date, end_date, reason, attachment=None):
    """
    Submits a new leave request.
    Rules:
    1. start_date <= end_date.
    2. Validates that required attachments are provided.
    3. For paid leave, checks that requested days do not exceed available balance.
    4. Sets initial status to PENDING. Does NOT deduct balance upon submission.
    """
    if not start_date or not end_date:
        raise ValidationError('Start date and end date are required.')

    if end_date < start_date:
        raise ValidationError('Start date cannot be after end date.')

    total_days = calculate_leave_days(start_date, end_date)

    if leave_type.requires_attachment and not attachment:
        raise ValidationError(f'Supporting document / medical certificate is mandatory for {leave_type.name}.')

    # Check available balance for paid leave types
    current_year = start_date.year
    balance = get_or_create_leave_balance(employee, leave_type, current_year)

    if leave_type.is_paid:
        if total_days > balance.remaining_days:
            raise ValidationError(
                f'Insufficient leave balance for {leave_type.name}. '
                f'Requested: {total_days} days, Available: {balance.remaining_days} days.'
            )

    leave_request = LeaveRequest.objects.create(
        employee=employee,
        leave_type=leave_type,
        start_date=start_date,
        end_date=end_date,
        total_days=total_days,
        reason=reason,
        attachment=attachment,
        status=LeaveRequest.Status.PENDING,
    )
    return leave_request


@transaction.atomic
def approve_leave_request(leave_request_id, approver_user, remarks=None):
    """
    Approves a PENDING leave request.
    Uses select_for_update to prevent race conditions during balance deduction.
    """
    leave_request = LeaveRequest.objects.select_for_update().get(id=leave_request_id)

    if leave_request.status != LeaveRequest.Status.PENDING:
        raise ValidationError(f'Cannot approve a request that is already {leave_request.get_status_display()}.')

    # For paid leave, re-verify and deduct balance
    if leave_request.leave_type.is_paid:
        year = leave_request.start_date.year
        balance = LeaveBalance.objects.select_for_update().filter(
            employee=leave_request.employee,
            leave_type=leave_request.leave_type,
            year=year,
        ).first()

        if not balance:
            balance = get_or_create_leave_balance(leave_request.employee, leave_request.leave_type, year)
            balance = LeaveBalance.objects.select_for_update().get(id=balance.id)

        if leave_request.total_days > balance.remaining_days:
            raise ValidationError(
                f'Approval failed: Insufficient balance. '
                f'Requested: {leave_request.total_days} days, Available: {balance.remaining_days} days.'
            )

        balance.used_days += leave_request.total_days
        balance.save()

    leave_request.status = LeaveRequest.Status.APPROVED
    leave_request.approver = approver_user
    leave_request.action_taken_at = timezone.now()
    if remarks:
        leave_request.rejection_reason = remarks
    leave_request.save()
    return leave_request


@transaction.atomic
def reject_leave_request(leave_request_id, approver_user, rejection_reason):
    """
    Rejects a PENDING leave request.
    Does NOT deduct any leave balance.
    """
    if not rejection_reason or not rejection_reason.strip():
        raise ValidationError('A reason for rejection must be provided.')

    leave_request = LeaveRequest.objects.select_for_update().get(id=leave_request_id)

    if leave_request.status != LeaveRequest.Status.PENDING:
        raise ValidationError(f'Cannot reject a request that is already {leave_request.get_status_display()}.')

    leave_request.status = LeaveRequest.Status.REJECTED
    leave_request.approver = approver_user
    leave_request.rejection_reason = rejection_reason.strip()
    leave_request.action_taken_at = timezone.now()
    leave_request.save()
    return leave_request


@transaction.atomic
def cancel_leave_request(leave_request_id, employee):
    """
    Cancels a PENDING leave request submitted by the employee.
    """
    leave_request = LeaveRequest.objects.select_for_update().get(id=leave_request_id)

    if leave_request.employee != employee:
        raise ValidationError('You can only cancel your own leave requests.')

    if leave_request.status != LeaveRequest.Status.PENDING:
        raise ValidationError('Only pending leave requests can be cancelled.')

    leave_request.status = LeaveRequest.Status.CANCELLED
    leave_request.action_taken_at = timezone.now()
    leave_request.save()
    return leave_request


def get_leave_summary_stats():
    """
    Aggregates leave statistics for the Admin/HR dashboard.
    """
    today = timezone.localdate()
    qs = LeaveRequest.objects.all()

    # Employees on leave today (Approved leaves where start_date <= today <= end_date)
    on_leave_today_count = qs.filter(
        status=LeaveRequest.Status.APPROVED,
        start_date__lte=today,
        end_date__gte=today,
    ).count()

    return {
        'total_pending': qs.filter(status=LeaveRequest.Status.PENDING).count(),
        'total_approved': qs.filter(status=LeaveRequest.Status.APPROVED).count(),
        'total_rejected': qs.filter(status=LeaveRequest.Status.REJECTED).count(),
        'total_cancelled': qs.filter(status=LeaveRequest.Status.CANCELLED).count(),
        'on_leave_today': on_leave_today_count,
    }
