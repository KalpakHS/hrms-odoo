from datetime import datetime, date
from decimal import Decimal
from django.db import models


class Attendance(models.Model):
    """
    Daily attendance tracking record for an employee.
    """

    class Status(models.TextChoices):
        PRESENT = 'PRESENT', 'Present'
        ABSENT = 'ABSENT', 'Absent'
        HALF_DAY = 'HALF_DAY', 'Half Day'
        ON_LEAVE = 'ON_LEAVE', 'On Leave'
        LATE = 'LATE', 'Late Arrival'
        WFH = 'WFH', 'Work From Home'

    employee = models.ForeignKey(
        'employees.Employee',
        on_delete=models.CASCADE,
        related_name='attendance_records',
        verbose_name='Employee',
    )
    date = models.DateField(default=date.today, db_index=True, verbose_name='Attendance Date')
    check_in = models.TimeField(null=True, blank=True, verbose_name='Check-In Time')
    check_out = models.TimeField(null=True, blank=True, verbose_name='Check-Out Time')
    work_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Total Work Hours',
        help_text='Computed duration between check-in and check-out in hours',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PRESENT,
        db_index=True,
        verbose_name='Attendance Status',
    )
    notes = models.TextField(blank=True, null=True, verbose_name='Remarks / Reason for Late or WFH')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Attendance Record'
        verbose_name_plural = 'Attendance Records'
        unique_together = ('employee', 'date')
        ordering = ['-date', 'employee']
        indexes = [
            models.Index(fields=['date', 'status']),
            models.Index(fields=['employee', 'date']),
        ]

    def __str__(self):
        return f"{self.employee.full_name} - {self.date} ({self.get_status_display()})"

    def calculate_work_hours(self):
        """Calculates total hours between check_in and check_out."""
        if self.check_in and self.check_out:
            t1 = datetime.combine(self.date, self.check_in)
            t2 = datetime.combine(self.date, self.check_out)
            if t2 >= t1:
                diff_seconds = (t2 - t1).total_seconds()
                hours = Decimal(diff_seconds / 3600.0).quantize(Decimal('0.01'))
                self.work_hours = hours
                return hours
        return Decimal('0.00')

    def save(self, *args, **kwargs):
        if self.check_in and self.check_out:
            self.calculate_work_hours()
        super().save(*args, **kwargs)


AttendanceStatus = Attendance.Status
