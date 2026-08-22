from django import forms
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import Attendance
from employees.models import Employee


class AttendanceAdminForm(forms.ModelForm):
    """Form used by Admin/HR to manually record or create attendance for an employee."""
    class Meta:
        model = Attendance
        fields = ['employee', 'date', 'check_in', 'check_out', 'status', 'notes']
        widgets = {
            'employee': forms.Select(attrs={'class': 'form-control', 'required': True}),
            'date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date', 'required': True}),
            'check_in': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'check_out': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Optional remarks/notes'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['employee'].queryset = Employee.objects.select_related('user', 'company').all()
        if not self.instance.pk and 'date' in self.fields:
            self.fields['date'].initial = timezone.localdate()

    def clean(self):
        cleaned_data = super().clean()
        employee = cleaned_data.get('employee')
        date_val = cleaned_data.get('date')
        check_in = cleaned_data.get('check_in')
        check_out = cleaned_data.get('check_out')

        if employee and date_val:
            qs = Attendance.objects.filter(employee=employee, date=date_val)
            if self.instance.pk:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise ValidationError(f'An attendance record already exists for {employee.full_name} on {date_val}.')

        if check_in and check_out:
            if check_out < check_in:
                raise ValidationError({'check_out': 'Check-out time cannot be earlier than check-in time.'})

        return cleaned_data

    def save(self, commit=True):
        instance = super().save(commit=False)
        if instance.check_in and instance.check_out:
            instance.calculate_work_hours()
        elif not instance.check_out:
            instance.work_hours = 0.00
        if commit:
            instance.save()
        return instance


class AttendanceCorrectionForm(forms.ModelForm):
    """Form used by Admin/HR to edit/correct an existing attendance record."""
    class Meta:
        model = Attendance
        fields = ['date', 'check_in', 'check_out', 'status', 'notes']
        widgets = {
            'date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date', 'required': True}),
            'check_in': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'check_out': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 2}),
        }

    def clean(self):
        cleaned_data = super().clean()
        check_in = cleaned_data.get('check_in')
        check_out = cleaned_data.get('check_out')
        date_val = cleaned_data.get('date')

        if date_val and self.instance.employee:
            qs = Attendance.objects.filter(employee=self.instance.employee, date=date_val).exclude(pk=self.instance.pk)
            if qs.exists():
                raise ValidationError(f'An attendance record already exists for {self.instance.employee.full_name} on {date_val}.')

        if check_in and check_out:
            if check_out < check_in:
                raise ValidationError({'check_out': 'Check-out time cannot be earlier than check-in time.'})

        return cleaned_data

    def save(self, commit=True):
        instance = super().save(commit=False)
        if instance.check_in and instance.check_out:
            instance.calculate_work_hours()
        elif not instance.check_out:
            instance.work_hours = 0.00
        if commit:
            instance.save()
        return instance
