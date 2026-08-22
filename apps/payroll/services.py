"""
Payroll calculation engine and service layer for Dayflow HRMS.
Handles Decimal-precise monetary computations, salary structure management,
payslip generation, payment status updates, and PDF payslip generation.
"""

from decimal import Decimal
import io
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Sum, Count, Q
from django.utils import timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from .models import SalaryStructure, Payslip


def calculate_salary_components(
    monthly_wage,
    standard_allowance=Decimal('0.00'),
    performance_bonus=Decimal('0.00'),
    leave_travel_allowance=Decimal('0.00'),
    fixed_allowance=None,
    professional_tax=Decimal('200.00'),
    other_deductions=Decimal('0.00'),
):
    """
    Authoritative server-side calculation of all salary breakdown components from monthly CTC:
    - Yearly Wage = 12 * Monthly Wage
    - Basic Salary = 50% of Monthly Wage
    - HRA = 50% of Basic Salary
    - Provident Fund (PF) = 12% of Basic Salary
    - Professional Tax = Default 200.00
    - Fixed Allowance = Remainder of monthly wage allocation (if not manually specified)
    - Gross Salary = Basic + HRA + Standard + Bonus + LTA + Fixed
    - Total Deductions = PF + PT + Other Deductions
    - Net Salary = Gross Salary - Total Deductions
    All calculations strictly use Decimal and round to 2 decimal places.
    """
    if not monthly_wage or monthly_wage < Decimal('0.00'):
        raise ValidationError('Monthly wage (CTC) must be a positive monetary value.')

    # Convert inputs to Decimal
    monthly_wage = Decimal(str(monthly_wage)).quantize(Decimal('0.01'))
    standard_allowance = Decimal(str(standard_allowance or '0.00')).quantize(Decimal('0.01'))
    performance_bonus = Decimal(str(performance_bonus or '0.00')).quantize(Decimal('0.01'))
    leave_travel_allowance = Decimal(str(leave_travel_allowance or '0.00')).quantize(Decimal('0.01'))
    professional_tax = Decimal(str(professional_tax or '200.00')).quantize(Decimal('0.01'))
    other_deductions = Decimal(str(other_deductions or '0.00')).quantize(Decimal('0.01'))

    yearly_wage = (monthly_wage * Decimal('12')).quantize(Decimal('0.01'))
    basic_salary = (monthly_wage * Decimal('0.50')).quantize(Decimal('0.01'))
    hra = (basic_salary * Decimal('0.50')).quantize(Decimal('0.01'))
    provident_fund = (basic_salary * Decimal('0.12')).quantize(Decimal('0.01'))

    if fixed_allowance is not None:
        fixed_allowance = Decimal(str(fixed_allowance)).quantize(Decimal('0.01'))
    else:
        allocated = basic_salary + hra + standard_allowance + performance_bonus + leave_travel_allowance
        fixed_allowance = max(Decimal('0.00'), (monthly_wage - allocated).quantize(Decimal('0.01')))

    gross_salary = (
        basic_salary + hra + standard_allowance + performance_bonus + leave_travel_allowance + fixed_allowance
    ).quantize(Decimal('0.01'))

    total_deductions = (provident_fund + professional_tax + other_deductions).quantize(Decimal('0.01'))
    net_salary = (gross_salary - total_deductions).quantize(Decimal('0.01'))

    return {
        'monthly_wage': monthly_wage,
        'yearly_wage': yearly_wage,
        'basic_salary': basic_salary,
        'hra': hra,
        'standard_allowance': standard_allowance,
        'performance_bonus': performance_bonus,
        'leave_travel_allowance': leave_travel_allowance,
        'fixed_allowance': fixed_allowance,
        'provident_fund': provident_fund,
        'professional_tax': professional_tax,
        'other_deductions': other_deductions,
        'gross_salary': gross_salary,
        'total_deductions': total_deductions,
        'net_salary': net_salary,
    }


@transaction.atomic
def create_or_update_salary_structure(
    employee,
    monthly_wage,
    effective_from,
    standard_allowance=Decimal('0.00'),
    performance_bonus=Decimal('0.00'),
    leave_travel_allowance=Decimal('0.00'),
    fixed_allowance=None,
    professional_tax=Decimal('200.00'),
    other_deductions=Decimal('0.00'),
    is_active=True,
):
    """
    Creates or updates the SalaryStructure for an employee using authoritative server-side math.
    """
    comp = calculate_salary_components(
        monthly_wage=monthly_wage,
        standard_allowance=standard_allowance,
        performance_bonus=performance_bonus,
        leave_travel_allowance=leave_travel_allowance,
        fixed_allowance=fixed_allowance,
        professional_tax=professional_tax,
        other_deductions=other_deductions,
    )

    structure, created = SalaryStructure.objects.update_or_create(
        employee=employee,
        defaults={
            'monthly_wage': comp['monthly_wage'],
            'yearly_wage': comp['yearly_wage'],
            'basic_salary': comp['basic_salary'],
            'hra': comp['hra'],
            'standard_allowance': comp['standard_allowance'],
            'performance_bonus': comp['performance_bonus'],
            'leave_travel_allowance': comp['leave_travel_allowance'],
            'fixed_allowance': comp['fixed_allowance'],
            'provident_fund': comp['provident_fund'],
            'professional_tax': comp['professional_tax'],
            'other_deductions': comp['other_deductions'],
            'gross_salary': comp['gross_salary'],
            'total_deductions': comp['total_deductions'],
            'net_salary': comp['net_salary'],
            'effective_from': effective_from,
            'is_active': is_active,
        },
    )
    return structure


@transaction.atomic
def generate_payslip(employee, month, year):
    """
    Generates a monthly payslip from the employee's active salary structure.
    Saves an immutable historical snapshot.
    Prevents duplicate payslips for (employee, month, year).
    """
    # Check if payslip already exists
    existing = Payslip.objects.filter(employee=employee, month=month, year=year).first()
    if existing:
        return existing, False

    # Fetch active salary structure
    salary = getattr(employee, 'salary_structure', None)
    if not salary or not salary.is_active:
        raise ValidationError(f'Employee {employee.full_name} does not have an active salary structure.')

    # Aggregate allowances
    total_allowances = (
        salary.standard_allowance +
        salary.leave_travel_allowance +
        salary.fixed_allowance
    ).quantize(Decimal('0.01'))

    bonus = salary.performance_bonus.quantize(Decimal('0.01'))

    gross_salary = (
        salary.basic_salary +
        salary.hra +
        total_allowances +
        bonus
    ).quantize(Decimal('0.01'))

    total_deductions = (
        salary.provident_fund +
        salary.professional_tax +
        salary.other_deductions
    ).quantize(Decimal('0.01'))

    net_pay = (gross_salary - total_deductions).quantize(Decimal('0.01'))

    payslip = Payslip.objects.create(
        employee=employee,
        month=month,
        year=year,
        basic_salary=salary.basic_salary,
        hra=salary.hra,
        allowances=total_allowances,
        bonus=bonus,
        gross_salary=gross_salary,
        provident_fund=salary.provident_fund,
        professional_tax=salary.professional_tax,
        other_deductions=salary.other_deductions,
        total_deductions=total_deductions,
        net_pay=net_pay,
        payment_status=Payslip.Status.GENERATED,
    )
    return payslip, True


@transaction.atomic
def update_payment_status(
    payslip_id,
    payment_status,
    payment_date=None,
    payment_method=None,
    transaction_id=None,
    remarks=None,
):
    """
    Updates the payment status and records audit details for a payslip.
    """
    payslip = Payslip.objects.select_for_update().get(id=payslip_id)

    payslip.payment_status = payment_status
    if payment_status == Payslip.Status.PAID:
        payslip.payment_date = payment_date or timezone.localdate()
        payslip.payment_method = payment_method
        payslip.transaction_id = transaction_id
    elif payment_status in (Payslip.Status.UNPAID, Payslip.Status.GENERATED):
        payslip.payment_date = payment_date
        payslip.payment_method = payment_method
        payslip.transaction_id = transaction_id

    if remarks is not None:
        payslip.remarks = remarks

    payslip.save()
    return payslip


def generate_payslip_pdf(payslip):
    """
    Generates a professional, print-ready PDF payslip using ReportLab.
    Returns bytes buffer.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1e293b'),
        alignment=1,  # Center
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#64748b'),
        alignment=1,
    )
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=6,
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("DAYFLOW HRMS", title_style))
    elements.append(Paragraph(f"Salary Payslip - {payslip.month:02d} / {payslip.year}", subtitle_style))
    elements.append(Spacer(1, 15))

    # Employee Details Table
    emp = payslip.employee
    emp_data = [
        [
            Paragraph("<b>Employee Name:</b>", styles['Normal']),
            Paragraph(emp.full_name, styles['Normal']),
            Paragraph("<b>Employee ID:</b>", styles['Normal']),
            Paragraph(emp.user.login_id, styles['Normal']),
        ],
        [
            Paragraph("<b>Department:</b>", styles['Normal']),
            Paragraph(emp.department.name if emp.department else "N/A", styles['Normal']),
            Paragraph("<b>Designation:</b>", styles['Normal']),
            Paragraph(emp.designation.title if emp.designation else "N/A", styles['Normal']),
        ],
        [
            Paragraph("<b>Company:</b>", styles['Normal']),
            Paragraph(emp.company.name if emp.company else "N/A", styles['Normal']),
            Paragraph("<b>Payment Status:</b>", styles['Normal']),
            Paragraph(f"<b>{payslip.get_payment_status_display()}</b>", styles['Normal']),
        ],
    ]
    if payslip.payment_date:
        emp_data.append([
            Paragraph("<b>Payment Date:</b>", styles['Normal']),
            Paragraph(str(payslip.payment_date), styles['Normal']),
            Paragraph("<b>Transaction Ref:</b>", styles['Normal']),
            Paragraph(payslip.transaction_id or "N/A", styles['Normal']),
        ])

    emp_table = Table(emp_data, colWidths=[110, 160, 110, 160])
    emp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(emp_table)
    elements.append(Spacer(1, 20))

    # Earnings and Deductions Table
    elements.append(Paragraph("Salary Breakdown", header_style))

    breakdown_data = [
        [
            Paragraph("<b>Earnings Component</b>", styles['Normal']),
            Paragraph("<b>Amount (INR)</b>", styles['Normal']),
            Paragraph("<b>Deduction Component</b>", styles['Normal']),
            Paragraph("<b>Amount (INR)</b>", styles['Normal']),
        ],
        [
            "Basic Salary",
            f"Rs. {payslip.basic_salary:.2f}",
            "Provident Fund (PF)",
            f"Rs. {payslip.provident_fund:.2f}",
        ],
        [
            "House Rent Allowance (HRA)",
            f"Rs. {payslip.hra:.2f}",
            "Professional Tax (PT)",
            f"Rs. {payslip.professional_tax:.2f}",
        ],
        [
            "Special & Standard Allowances",
            f"Rs. {payslip.allowances:.2f}",
            "Other Deductions",
            f"Rs. {payslip.other_deductions:.2f}",
        ],
        [
            "Performance Bonus",
            f"Rs. {payslip.bonus:.2f}",
            "",
            "",
        ],
        [
            Paragraph("<b>Gross Earnings</b>", styles['Normal']),
            Paragraph(f"<b>Rs. {payslip.gross_salary:.2f}</b>", styles['Normal']),
            Paragraph("<b>Total Deductions</b>", styles['Normal']),
            Paragraph(f"<b>Rs. {payslip.total_deductions:.2f}</b>", styles['Normal']),
        ],
    ]

    breakdown_table = Table(breakdown_data, colWidths=[160, 110, 160, 110])
    breakdown_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#94a3b8')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#f1f5f9')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(breakdown_table)
    elements.append(Spacer(1, 20))

    # Net Salary Highlight Box
    net_data = [
        [
            Paragraph("<b>NET TAKE-HOME PAY</b>", ParagraphStyle('NetTitle', parent=styles['Normal'], fontSize=12, textColor=colors.HexColor('#1e293b'))),
            Paragraph(f"<b>Rs. {payslip.net_pay:.2f}</b>", ParagraphStyle('NetAmt', parent=styles['Heading2'], fontSize=16, textColor=colors.HexColor('#16a34a'))),
        ]
    ]
    net_table = Table(net_data, colWidths=[270, 270])
    net_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#dcfce7')),
        ('BOX', (0, 0), (-1, -1), 1.5, colors.HexColor('#16a34a')),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(net_table)
    elements.append(Spacer(1, 30))

    # Footer note
    elements.append(Paragraph(
        "<i>This is a computer-generated document and does not require a physical signature. Generated by Dayflow HRMS.</i>",
        styles['Italic']
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer


def get_payroll_summary_stats():
    """
    Aggregates high-level payroll statistics for the Admin/HR dashboard using efficient ORM queries.
    """
    structures = SalaryStructure.objects.filter(is_active=True)
    today = timezone.localdate()

    agg = structures.aggregate(
        total_monthly_wage=Sum('monthly_wage'),
        total_gross=Sum('gross_salary'),
        total_deductions=Sum('total_deductions'),
        total_net=Sum('net_salary'),
        count=Count('id'),
    )

    # Current month payslips
    month_payslips = Payslip.objects.filter(month=today.month, year=today.year)
    payslips_gen_count = month_payslips.count()
    payslips_paid_count = month_payslips.filter(payment_status=Payslip.Status.PAID).count()
    payslips_unpaid_count = month_payslips.filter(
        Q(payment_status=Payslip.Status.UNPAID) | Q(payment_status=Payslip.Status.GENERATED)
    ).count()

    return {
        'total_active_structures': agg['count'] or 0,
        'total_monthly_payroll': agg['total_monthly_wage'] or Decimal('0.00'),
        'total_gross_payroll': agg['total_gross'] or Decimal('0.00'),
        'total_deductions': agg['total_deductions'] or Decimal('0.00'),
        'total_net_payroll': agg['total_net'] or Decimal('0.00'),
        'current_month_payslips': payslips_gen_count,
        'current_month_paid': payslips_paid_count,
        'current_month_unpaid': payslips_unpaid_count,
    }
