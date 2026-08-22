from rest_framework import serializers
from .models import LeaveRequest, LeaveStatus, LeaveType
from apps.employees.models import Employee

class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_code = serializers.ReadOnlyField(source='employee.emp_code')
    employee_name = serializers.ReadOnlyField(source='employee.full_name')
    department = serializers.ReadOnlyField(source='employee.department')
    reviewed_by_name = serializers.ReadOnlyField(source='reviewed_by.username')
    duration_days = serializers.ReadOnlyField()

    class Meta:
        model = LeaveRequest
        fields = [
            'id',
            'employee',
            'employee_code',
            'employee_name',
            'department',
            'leave_type',
            'start_date',
            'end_date',
            'duration_days',
            'remarks',
            'status',
            'admin_comment',
            'reviewed_by',
            'reviewed_by_name',
            'reviewed_at',
            'applied_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'employee',
            'status',
            'admin_comment',
            'reviewed_by',
            'reviewed_by_name',
            'reviewed_at',
            'applied_at',
            'updated_at'
        ]


class LeaveApplySerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = [
            'leave_type',
            'start_date',
            'end_date',
            'remarks'
        ]

    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError("End date cannot be prior to start date.")
        return data


class LeaveReviewSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[LeaveStatus.APPROVED, LeaveStatus.REJECTED],
        required=True
    )
    admin_comment = serializers.CharField(
        required=False,
        allow_blank=True,
        default=''
    )
