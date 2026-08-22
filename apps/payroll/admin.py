from django.contrib import admin
from .models import SalaryStructure, Payslip


@admin.register(SalaryStructure)
class SalaryStructureAdmin(admin.ModelAdmin):
    list_display = ('employee', 'monthly_wage', 'yearly_wage', 'basic_salary', 'hra', 'gross_salary', 'total_deductions', 'net_salary', 'is_active')
    list_filter = ('is_active', 'effective_from')
    search_fields = ('employee__first_name', 'employee__last_name', 'employee__user__login_id')
    readonly_fields = ('yearly_wage', 'basic_salary', 'hra', 'provident_fund', 'gross_salary', 'total_deductions', 'net_salary')


@admin.register(Payslip)
class PayslipAdmin(admin.ModelAdmin):
    list_display = ('employee', 'month', 'year', 'gross_salary', 'total_deductions', 'net_pay', 'payment_status', 'payment_date')
    list_filter = ('payment_status', 'year', 'month')
    search_fields = ('employee__first_name', 'employee__last_name', 'employee__user__login_id', 'transaction_id')
