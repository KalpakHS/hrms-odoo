from decimal import Decimal
from rest_framework import serializers
from .models import Payroll
from employees.models import Employee

class PayrollSerializer(serializers.ModelSerializer):
    employee_code = serializers.ReadOnlyField(source='employee.emp_code')
    employee_name = serializers.ReadOnlyField(source='employee.full_name')
    department = serializers.ReadOnlyField(source='employee.department')
    designation = serializers.ReadOnlyField(source='employee.designation')

    class Meta:
        model = Payroll
        fields = [
            'id',
            'employee',
            'employee_code',
            'employee_name',
            'department',
            'designation',
            'basic_salary',
            'allowances',
            'deductions',
            'net_salary',
            'currency',
            'payment_mode',
            'updated_at'
        ]
        read_only_fields = ['id', 'net_salary', 'updated_at']


class AdminPayrollUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payroll
        fields = [
            'basic_salary',
            'allowances',
            'deductions',
            'currency',
            'payment_mode'
        ]

    def validate_basic_salary(self, value):
        if value < Decimal('0.00'):
            raise serializers.ValidationError("Basic salary cannot be negative.")
        return value

    def validate_allowances(self, value):
        if value < Decimal('0.00'):
            raise serializers.ValidationError("Allowances cannot be negative.")
        return value

    def validate_deductions(self, value):
        if value < Decimal('0.00'):
            raise serializers.ValidationError("Deductions cannot be negative.")
        return value
