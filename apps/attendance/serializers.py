from rest_framework import serializers
from .models import Attendance, AttendanceStatus
from apps.employees.models import Employee

class AttendanceSerializer(serializers.ModelSerializer):
    employee_code = serializers.ReadOnlyField(source='employee.emp_code')
    employee_name = serializers.ReadOnlyField(source='employee.full_name')
    department = serializers.ReadOnlyField(source='employee.department')
    total_hours = serializers.ReadOnlyField()

    class Meta:
        model = Attendance
        fields = [
            'id',
            'employee',
            'employee_code',
            'employee_name',
            'department',
            'date',
            'check_in',
            'check_out',
            'status',
            'total_hours',
            'notes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_hours']


class CheckInSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True, max_length=255)


class CheckOutSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True, max_length=255)


class AdminAttendanceCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = [
            'id',
            'employee',
            'date',
            'check_in',
            'check_out',
            'status',
            'notes'
        ]
