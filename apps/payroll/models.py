from decimal import Decimal
from django.db import models


class SalaryStructure(models.Model):
    """
    Salary structure and compensation breakdown for an employee.
    Restricted to Admin & HR access.
    Supports automated component calculations from monthly wage (CTC).
    """
    employee = models.OneToOneField(
        'employees.Employee',
        on_delete=models.CASCADE,
        related_name='salary_structure',
        verbose_name='Employee',
    )
    monthly_wage = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name='Monthly Wage (CTC)',
        help_text='Total cost to company per month',
    )
    yearly_wage = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Yearly Wage (CTC)',
        help_text='12 * monthly_wage',
    )

    # Earnings Components
    basic_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Basic Salary',
        help_text='Calculated at 50% of monthly wage',
    )
    hra = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='House Rent Allowance (HRA)',
        help_text='Calculated at 50% of Basic Salary',
    )
    standard_allowance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Standard Allowance',
    )
    performance_bonus = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Performance Bonus',
    )
    leave_travel_allowance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Leave Travel Allowance (LTA)',
    )
    fixed_allowance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Fixed / Special Allowance',
        help_text='Remaining monthly wage allocation',
    )

    # Deductions
    provident_fund = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Provident Fund (PF)',
        help_text='Calculated at 12% of Basic Salary',
    )
    professional_tax = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('200.00'),
        verbose_name='Professional Tax (PT)',
    )
    other_deductions = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Other Deductions',
    )

    # Totals
    gross_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Gross Monthly Salary',
    )
    total_deductions = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Total Deductions',
    )
    net_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Net Salary (In-Hand)',
        help_text='Gross salary minus total deductions',
    )

    effective_from = models.DateField(verbose_name='Effective Date')
    is_active = models.BooleanField(default=True, verbose_name='Is Active Salary Structure')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Salary Structure'
        verbose_name_plural = 'Salary Structures'
        ordering = ['-effective_from']

    def __str__(self):
        return f"{self.employee.full_name} - Monthly: {self.monthly_wage} (Net: {self.net_salary})"

    def calculate_components(self, auto_fill_fixed=True):
        """
        Calculates all salary breakdown components automatically from monthly_wage:
        - Yearly Wage = 12 * Monthly Wage
        - Basic Salary = 50% of Monthly Wage
        - HRA = 50% of Basic Salary
        - Provident Fund (PF) = 12% of Basic Salary
        - Professional Tax = 200 (or existing value)
        - Fixed Allowance = Monthly Wage - (Basic + HRA + Standard + Bonus + LTA)
        - Gross Salary = Basic + HRA + Allowances + Bonus
        - Total Deductions = PF + PT + Other Deductions
        - Net Salary = Gross Salary - Total Deductions
        """
        if self.monthly_wage:
            # Yearly Wage
            self.yearly_wage = (self.monthly_wage * Decimal('12')).quantize(Decimal('0.01'))

            # Basic Salary (50% of monthly CTC)
            self.basic_salary = (self.monthly_wage * Decimal('0.50')).quantize(Decimal('0.01'))

            # HRA (50% of Basic)
            self.hra = (self.basic_salary * Decimal('0.50')).quantize(Decimal('0.01'))

            # Provident Fund (12% of Basic)
            self.provident_fund = (self.basic_salary * Decimal('0.12')).quantize(Decimal('0.01'))

            # Fixed Allowance balancing
            if auto_fill_fixed:
                used_earnings = (
                    self.basic_salary +
                    self.hra +
                    self.standard_allowance +
                    self.performance_bonus +
                    self.leave_travel_allowance
                )
                remainder = self.monthly_wage - used_earnings
                self.fixed_allowance = max(Decimal('0.00'), remainder.quantize(Decimal('0.01')))

            # Gross Earnings
            self.gross_salary = (
                self.basic_salary +
                self.hra +
                self.standard_allowance +
                self.performance_bonus +
                self.leave_travel_allowance +
                self.fixed_allowance
            ).quantize(Decimal('0.01'))

            # Total Deductions
            self.total_deductions = (
                self.provident_fund +
                self.professional_tax +
                self.other_deductions
            ).quantize(Decimal('0.01'))

            # Net Take-Home Salary
            self.net_salary = (self.gross_salary - self.total_deductions).quantize(Decimal('0.01'))

    def save(self, *args, **kwargs):
        self.calculate_components()
        super().save(*args, **kwargs)


class Payslip(models.Model):
    """
    Generated monthly payslip record for an employee.
    """

    class Status(models.TextChoices):
        UNPAID = 'UNPAID', 'Unpaid'
        GENERATED = 'GENERATED', 'Generated'
        PAID = 'PAID', 'Paid'

    employee = models.ForeignKey(
        'employees.Employee',
        on_delete=models.CASCADE,
        related_name='payslips',
        verbose_name='Employee',
    )
    month = models.PositiveSmallIntegerField(
        verbose_name='Month',
        choices=[(i, f"{i:02d}") for i in range(1, 13)],
    )
    year = models.PositiveIntegerField(verbose_name='Year')

    # Breakdown snapshots
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    hra = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    allowances = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    bonus = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    gross_salary = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    # Deductions snapshot
    provident_fund = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    professional_tax = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    other_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    net_pay = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    payment_status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.GENERATED,
        verbose_name='Payment Status',
    )
    payment_date = models.DateField(null=True, blank=True, verbose_name='Payment Date')
    payment_method = models.CharField(max_length=50, blank=True, null=True, verbose_name='Payment Method')
    transaction_id = models.CharField(max_length=100, blank=True, null=True, verbose_name='Transaction / Ref ID')
    remarks = models.TextField(blank=True, null=True, verbose_name='Remarks')

    generated_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Payslip'
        verbose_name_plural = 'Payslips'
        unique_together = ('employee', 'month', 'year')
        ordering = ['-year', '-month', 'employee']

    def __str__(self):
        return f"Payslip {self.month:02d}/{self.year} - {self.employee.full_name} ({self.get_payment_status_display()})"


Payroll = SalaryStructure
