from decimal import Decimal
from django.conf import settings
from django.db import models


class LeaveType(models.Model):
    """
    Catalog of leave types (Casual Leave, Sick Leave, Paid Time Off, Unpaid Leave).
    """
    name = models.CharField(max_length=100, unique=True, verbose_name='Leave Type Name')
    code = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='Code',
        help_text='Short code (e.g. CL, SL, PL, UL)',
    )
    max_days_per_year = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        default=Decimal('12.0'),
        verbose_name='Max Days Allowed Per Year',
    )
    is_paid = models.BooleanField(default=True, verbose_name='Is Paid Leave')
    requires_attachment = models.BooleanField(
        default=False,
        verbose_name='Requires Medical / Supporting Attachment',
    )
    description = models.TextField(blank=True, null=True, verbose_name='Description')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Leave Type'
        verbose_name_plural = 'Leave Types'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class LeaveRequest(models.Model):
    """
    Leave application request submitted by an employee.
    """

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Approval'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        CANCELLED = 'CANCELLED', 'Cancelled'

    employee = models.ForeignKey(
        'employees.Employee',
        on_delete=models.CASCADE,
        related_name='leave_requests',
        verbose_name='Employee',
    )
    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.PROTECT,
        related_name='leave_requests',
        verbose_name='Leave Type',
    )
    start_date = models.DateField(verbose_name='Start Date')
    end_date = models.DateField(verbose_name='End Date')
    total_days = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        default=Decimal('1.0'),
        verbose_name='Total Days Requested',
    )
    reason = models.TextField(verbose_name='Reason for Leave')
    attachment = models.FileField(
        upload_to='leave_attachments/',
        null=True,
        blank=True,
        verbose_name='Supporting Document / Medical Certificate',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
        verbose_name='Approval Status',
    )
    applied_on = models.DateTimeField(auto_now_add=True, verbose_name='Applied On')

    # Approval Details
    approver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_leaves',
        verbose_name='Reviewed By',
    )
    rejection_reason = models.TextField(
        blank=True,
        null=True,
        verbose_name='Remarks / Reason for Rejection',
    )
    action_taken_at = models.DateTimeField(null=True, blank=True, verbose_name='Action Taken At')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Leave Request'
        verbose_name_plural = 'Leave Requests'
        ordering = ['-applied_on']
        indexes = [
            models.Index(fields=['status', 'start_date']),
            models.Index(fields=['employee', 'status']),
        ]

    def __str__(self):
        return f"{self.employee.full_name} - {self.leave_type.name} ({self.start_date} to {self.end_date}) [{self.get_status_display()}]"

    def calculate_days(self):
        """Calculates total calendar days between start_date and end_date."""
        if self.start_date and self.end_date and self.end_date >= self.start_date:
            days = (self.end_date - self.start_date).days + 1
            self.total_days = Decimal(days)
            return self.total_days
        return Decimal('1.0')

    def save(self, *args, **kwargs):
        if self.start_date and self.end_date and not self.total_days:
            self.calculate_days()
        super().save(*args, **kwargs)


class LeaveBalance(models.Model):
    """
    Tracks annual leave quota and consumed days for each employee.
    """
    employee = models.ForeignKey(
        'employees.Employee',
        on_delete=models.CASCADE,
        related_name='leave_balances',
        verbose_name='Employee',
    )
    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.CASCADE,
        related_name='balances',
        verbose_name='Leave Type',
    )
    year = models.PositiveIntegerField(verbose_name='Year')
    total_allocated = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        default=Decimal('0.0'),
        verbose_name='Total Allocated Days',
    )
    used_days = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        default=Decimal('0.0'),
        verbose_name='Consumed Days',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Leave Balance'
        verbose_name_plural = 'Leave Balances'
        unique_together = ('employee', 'leave_type', 'year')
        ordering = ['-year', 'employee']

    def __str__(self):
        return f"{self.employee.full_name} - {self.leave_type.code} ({self.year}): {self.remaining_days} remaining"

    @property
    def remaining_days(self):
        return max(Decimal('0.0'), self.total_allocated - self.used_days)
