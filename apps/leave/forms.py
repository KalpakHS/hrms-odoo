import os
from django import forms
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import LeaveType, LeaveRequest, LeaveBalance

DANGEROUS_EXTENSIONS = {'.exe', '.bat', '.cmd', '.sh', '.bin', '.js', '.vbs', '.msi', '.com', '.scr', '.pif'}
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB


class LeaveApplicationForm(forms.ModelForm):
    """Form used by employees to apply for leave."""
    class Meta:
        model = LeaveRequest
        fields = ['leave_type', 'start_date', 'end_date', 'reason', 'attachment']
        widgets = {
            'leave_type': forms.Select(attrs={'class': 'form-control', 'required': True}),
            'start_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date', 'required': True}),
            'end_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date', 'required': True}),
            'reason': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Provide detailed reason for leave...', 'required': True}),
            'attachment': forms.FileInput(attrs={'class': 'form-control', 'accept': '.pdf,.png,.jpg,.jpeg,.doc,.docx'}),
        }

    def __init__(self, *args, employee=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.employee = employee
        self.fields['leave_type'].queryset = LeaveType.objects.all()

    def clean_attachment(self):
        file = self.cleaned_data.get('attachment')
        if file:
            if file.size > MAX_UPLOAD_SIZE:
                raise ValidationError('File size exceeds the 10 MB limit.')
            ext = os.path.splitext(file.name)[1].lower()
            if ext in DANGEROUS_EXTENSIONS:
                raise ValidationError(f'Security error: File type "{ext}" is not permitted.')
        return file

    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get('start_date')
        end_date = cleaned_data.get('end_date')
        leave_type = cleaned_data.get('leave_type')
        attachment = cleaned_data.get('attachment')

        if start_date and end_date:
            if end_date < start_date:
                raise ValidationError({'end_date': 'End date cannot be earlier than start date.'})

        if leave_type and leave_type.requires_attachment and not attachment:
            raise ValidationError({'attachment': f'Supporting document / medical certificate is required for {leave_type.name}.'})

        return cleaned_data


class LeaveRejectionForm(forms.Form):
    """Form used by Admin/HR to provide mandatory remarks when rejecting a leave request."""
    rejection_reason = forms.CharField(
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 3,
            'placeholder': 'State the reason for rejecting this leave application...',
            'required': True,
        }),
        label='Reason for Rejection',
        required=True,
    )


class LeaveTypeForm(forms.ModelForm):
    """Form used by Admin to create or edit leave type catalogs."""
    class Meta:
        model = LeaveType
        fields = ['name', 'code', 'max_days_per_year', 'is_paid', 'requires_attachment', 'description']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Casual Leave', 'required': True}),
            'code': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. CL', 'required': True}),
            'max_days_per_year': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.5', 'required': True}),
            'is_paid': forms.CheckboxInput(attrs={'style': 'margin-right: 8px;'}),
            'requires_attachment': forms.CheckboxInput(attrs={'style': 'margin-right: 8px;'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Optional description / policy notes'}),
        }

    def clean_code(self):
        code = self.cleaned_data.get('code', '').strip().upper()
        qs = LeaveType.objects.filter(code__iexact=code)
        if self.instance.pk:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise ValidationError(f'Leave type code "{code}" already exists.')
        return code
