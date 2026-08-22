from decimal import Decimal
from django import forms
from django.core.exceptions import ValidationError
from django.utils import timezone
from employees.models import Employee
from .models import SalaryStructure, Payslip


class SalaryStructureForm(forms.ModelForm):
    """
    Form for Admin/HR to configure an employee's salary package.
    Calculated fields are not directly editable; the server computes them on save.
    """
    class Meta:
        model = SalaryStructure
        fields = [
            'monthly_wage',
            'standard_allowance',
            'performance_bonus',
            'leave_travel_allowance',
            'fixed_allowance',
            'professional_tax',
            'other_deductions',
            'effective_from',
            'is_active',
        ]
        widgets = {
            'monthly_wage': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01', 'required': True, 'placeholder': 'e.g. 50000.00'}),
            'standard_allowance': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01', 'placeholder': '0.00'}),
            'performance_bonus': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01', 'placeholder': '0.00'}),
            'leave_travel_allowance': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01', 'placeholder': '0.00'}),
            'fixed_allowance': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01', 'placeholder': 'Leave blank to auto-balance'}),
            'professional_tax': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01', 'placeholder': '200.00'}),
            'other_deductions': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01', 'placeholder': '0.00'}),
            'effective_from': forms.DateInput(attrs={'class': 'form-control', 'type': 'date', 'required': True}),
            'is_active': forms.CheckboxInput(attrs={'style': 'margin-right: 8px;'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['standard_allowance'].required = False
        self.fields['performance_bonus'].required = False
        self.fields['leave_travel_allowance'].required = False
        self.fields['fixed_allowance'].required = False
        self.fields['professional_tax'].required = False
        self.fields['other_deductions'].required = False

    def clean_monthly_wage(self):
        wage = self.cleaned_data.get('monthly_wage')
        if wage is None or wage <= Decimal('0.00'):
            raise ValidationError('Monthly wage must be greater than zero.')
        return wage

    def clean_standard_allowance(self):
        return self.cleaned_data.get('standard_allowance') or Decimal('0.00')

    def clean_performance_bonus(self):
        return self.cleaned_data.get('performance_bonus') or Decimal('0.00')

    def clean_leave_travel_allowance(self):
        return self.cleaned_data.get('leave_travel_allowance') or Decimal('0.00')

    def clean_professional_tax(self):
        val = self.cleaned_data.get('professional_tax')
        return Decimal('200.00') if val is None else val

    def clean_other_deductions(self):
        return self.cleaned_data.get('other_deductions') or Decimal('0.00')


class PayslipPaymentForm(forms.ModelForm):
    """
    Form for Admin/HR to mark a payslip as PAID and record transaction references.
    """
    class Meta:
        model = Payslip
        fields = ['payment_status', 'payment_date', 'payment_method', 'transaction_id', 'remarks']
        widgets = {
            'payment_status': forms.Select(attrs={'class': 'form-control', 'required': True}),
            'payment_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'payment_method': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Bank Transfer, NEFT, UPI, Cheque'}),
            'transaction_id': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Transaction reference ID'}),
            'remarks': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Payment notes / reconciliation info'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        status = cleaned_data.get('payment_status')
        date = cleaned_data.get('payment_date')

        if status == Payslip.Status.PAID and not date:
            cleaned_data['payment_date'] = timezone.localdate()

        return cleaned_data


class PayslipGenerateForm(forms.Form):
    """
    Form for Admin/HR to generate payslips for a given month and year.
    """
    MONTH_CHOICES = [(i, f"{i:02d} - {timezone.datetime(2000, i, 1).strftime('%B')}") for i in range(1, 13)]

    month = forms.ChoiceField(
        choices=MONTH_CHOICES,
        widget=forms.Select(attrs={'class': 'form-control'}),
        initial=timezone.localdate().month,
    )
    year = forms.IntegerField(
        widget=forms.NumberInput(attrs={'class': 'form-control'}),
        initial=timezone.localdate().year,
        min_value=2000,
        max_value=2100,
    )
    employee = forms.ModelChoiceField(
        queryset=Employee.objects.filter(is_active=True, salary_structure__is_active=True).select_related('user', 'company', 'department'),
        required=False,
        empty_label='All Active Employees with Salary Structure',
        widget=forms.Select(attrs={'class': 'form-control'}),
        help_text='Select a single employee or leave empty to generate for all eligible employees.',
    )
