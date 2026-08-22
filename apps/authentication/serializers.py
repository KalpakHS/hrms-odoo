from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class UserSerializer(serializers.ModelSerializer):
    employee_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'is_staff',
            'is_active',
            'date_joined',
            'employee_id'
        ]
        read_only_fields = ['id', 'is_staff', 'is_active', 'date_joined', 'employee_id']

    def get_employee_id(self, obj):
        if hasattr(obj, 'employee_profile'):
            return obj.employee_profile.emp_code
        return None


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials. Please verify your username and password.")
            if not user.is_active:
                raise serializers.ValidationError("User account is inactive. Please contact HR.")
        else:
            raise serializers.ValidationError("Must include both username and password.")

        data['user'] = user
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct.")
        return value
