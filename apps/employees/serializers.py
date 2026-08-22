from rest_framework import serializers
from django.db import transaction
from authentication.models import User, UserRole
from .models import Employee

class EmployeeListSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Employee
        fields = [
            'id',
            'emp_code',
            'full_name',
            'first_name',
            'last_name',
            'email',
            'phone',
            'department',
            'designation',
            'employment_type',
            'joining_date'
        ]


class EmployeeDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    username = serializers.ReadOnlyField(source='user.username')
    user_id = serializers.ReadOnlyField(source='user.id')
    role = serializers.ReadOnlyField(source='user.role')

    class Meta:
        model = Employee
        fields = [
            'id',
            'user_id',
            'username',
            'role',
            'emp_code',
            'full_name',
            'first_name',
            'last_name',
            'email',
            'phone',
            'address',
            'department',
            'designation',
            'joining_date',
            'employment_type',
            'date_of_birth',
            'gender',
            'emergency_contact_name',
            'emergency_contact_phone',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'user_id', 'username', 'role', 'created_at', 'updated_at']


class EmployeeCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    role = serializers.ChoiceField(choices=UserRole.choices, default=UserRole.EMPLOYEE, write_only=True)

    class Meta:
        model = Employee
        fields = [
            'id',
            'username',
            'password',
            'role',
            'emp_code',
            'first_name',
            'last_name',
            'email',
            'phone',
            'address',
            'department',
            'designation',
            'joining_date',
            'employment_type',
            'date_of_birth',
            'gender',
            'emergency_contact_name',
            'emergency_contact_phone'
        ]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists() or Employee.objects.filter(email=value).exists():
            raise serializers.ValidationError("An employee or user with this email already exists.")
        return value

    def validate_emp_code(self, value):
        if Employee.objects.filter(emp_code=value).exists():
            raise serializers.ValidationError("An employee with this Employee ID already exists.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        role = validated_data.pop('role', UserRole.EMPLOYEE)

        # 1. Create Django Auth User with hashed password
        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=role
        )

        # 2. Create Employee profile linked 1:1
        employee = Employee.objects.create(user=user, **validated_data)

        # 3. Initialize default blank Payroll record
        from payroll.models import Payroll
        Payroll.objects.create(employee=employee)

        return employee


class EmployeeSelfUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for employees updating their own editable personal info.
    Restricts changes to non-administrative fields.
    """
    class Meta:
        model = Employee
        fields = [
            'phone',
            'address',
            'emergency_contact_name',
            'emergency_contact_phone',
            'gender'
        ]
