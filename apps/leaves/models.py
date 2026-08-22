"""
Leave Management Models for Dayflow HRMS.
"""
from django.db import models
from django.conf import settings
from employees.models import Employee

class LeaveType(models.TextChoices):
    PAID = 'PAID', 'Paid Leave'
    SICK = 'SICK', 'Sick Leave'
    UNPAID = 'UNPAID', 'Unpaid Leave'

class LeaveStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'

class LeaveRequest(models.Model):
    """
    Leave Application entity submitted by Employees and reviewed by Admin/HR.
    """
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='leave_requests',
        help_text="Employee requesting the leave."
    )
    leave_type = models.CharField(
        max_length=20,
        choices=LeaveType.choices,
        default=LeaveType.PAID
    )
    start_date = models.DateField(help_text="First day of leave.")
    end_date = models.DateField(help_text="Last day of leave.")
    remarks = models.TextField(help_text="Reason for leave provided by employee.")
    
    # Review workflow fields
    status = models.CharField(
        max_length=20,
        choices=LeaveStatus.choices,
        default=LeaveStatus.PENDING
    )
    admin_comment = models.TextField(
        blank=True,
        default='',
        help_text="Remarks/justification provided by HR upon approval/rejection."
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_leaves',
        help_text="Admin who approved/rejected this request."
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Leave Request'
        verbose_name_plural = 'Leave Requests'
        ordering = ['-applied_at']

    @property
    def duration_days(self):
        """Calculates total calendar days of requested leave."""
        if self.start_date and self.end_date:
            return (self.end_date - self.start_date).days + 1
        return 0

    def __str__(self):
        return f"{self.employee.emp_code} - {self.get_leave_type_display()} ({self.start_date} to {self.end_date}): {self.get_status_display()}"
