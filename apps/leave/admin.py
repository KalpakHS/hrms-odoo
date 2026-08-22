from django.contrib import admin
from .models import LeaveType, LeaveRequest, LeaveBalance


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'max_days_per_year', 'is_paid', 'requires_attachment')
    search_fields = ('name', 'code')


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('employee', 'leave_type', 'start_date', 'end_date', 'total_days', 'status', 'applied_on', 'approver')
    list_filter = ('status', 'leave_type', 'start_date')
    search_fields = ('employee__first_name', 'employee__last_name', 'employee__user__login_id')
    date_hierarchy = 'applied_on'


@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'leave_type', 'year', 'total_allocated', 'used_days', 'remaining_days')
    list_filter = ('year', 'leave_type')
    search_fields = ('employee__first_name', 'employee__last_name')
