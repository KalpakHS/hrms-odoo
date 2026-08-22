"""
Service layer for Dayflow HRMS Attendance Management.
"""

from datetime import datetime, date, time
from decimal import Decimal
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from .models import Attendance


# Configurable Workday Start Time (e.g. 09:15 AM threshold for LATE status)
WORK_START_TIME = getattr(settings, 'ATTENDANCE_WORK_START', time(9, 15))


def get_today_attendance(employee, date_val=None):
    """
    Returns today's Attendance instance for the given employee if it exists, else None.
    """
    target_date = date_val or timezone.localdate()
    return Attendance.objects.filter(employee=employee, date=target_date).first()


@transaction.atomic
def check_in_employee(employee, check_in_time=None, date_val=None, notes=None):
    """
    Records employee check-in for the day.
    Rules:
    1. Only one record per employee per day.
    2. Duplicate check-in is rejected.
    3. Auto-assigns LATE status if check-in time > WORK_START_TIME, else PRESENT.
    """
    target_date = date_val or timezone.localdate()
    now_time = check_in_time or timezone.localtime().time()

    # Normalize now_time to remove microseconds for clean time storage
    now_time = time(now_time.hour, now_time.minute, now_time.second)

    attendance, created = Attendance.objects.get_or_create(
        employee=employee,
        date=target_date,
        defaults={
            'check_in': now_time,
            'status': Attendance.Status.LATE if now_time > WORK_START_TIME else Attendance.Status.PRESENT,
            'notes': notes or '',
        },
    )

    if not created:
        if attendance.check_in is not None:
            raise ValidationError('You have already checked in today.')
        # If record existed (e.g. marked WFH or created without check-in time)
        attendance.check_in = now_time
        if attendance.status == Attendance.Status.ABSENT or not attendance.status:
            attendance.status = Attendance.Status.LATE if now_time > WORK_START_TIME else Attendance.Status.PRESENT
        if notes:
            attendance.notes = f"{attendance.notes} | {notes}".strip(' |')
        attendance.save()

    return attendance


@transaction.atomic
def check_out_employee(employee, check_out_time=None, date_val=None, notes=None):
    """
    Records employee check-out for the day.
    Rules:
    1. Check-in must exist.
    2. Check-out must not already be recorded.
    3. Check-out cannot be earlier than check-in.
    4. Automatically calculates and stores work hours.
    """
    target_date = date_val or timezone.localdate()
    now_time = check_out_time or timezone.localtime().time()

    now_time = time(now_time.hour, now_time.minute, now_time.second)

    attendance = Attendance.objects.filter(employee=employee, date=target_date).first()

    if not attendance or not attendance.check_in:
        raise ValidationError('Cannot check out without checking in first.')

    if attendance.check_out is not None:
        raise ValidationError('You have already checked out today.')

    if now_time < attendance.check_in:
        raise ValidationError('Check-out time cannot be earlier than check-in time.')

    attendance.check_out = now_time
    if notes:
        attendance.notes = f"{attendance.notes} | {notes}".strip(' |') if attendance.notes else notes

    attendance.calculate_work_hours()
    attendance.save()
    return attendance


def get_attendance_summary_stats(date_val=None):
    """
    Aggregates attendance counts for the dashboard.
    """
    target_date = date_val or timezone.localdate()
    records = Attendance.objects.filter(date=target_date)

    return {
        'date': target_date,
        'total_records': records.count(),
        'present_count': records.filter(status=Attendance.Status.PRESENT).count(),
        'late_count': records.filter(status=Attendance.Status.LATE).count(),
        'half_day_count': records.filter(status=Attendance.Status.HALF_DAY).count(),
        'wfh_count': records.filter(status=Attendance.Status.WFH).count(),
        'on_leave_count': records.filter(status=Attendance.Status.ON_LEAVE).count(),
        'absent_count': records.filter(status=Attendance.Status.ABSENT).count(),
    }
