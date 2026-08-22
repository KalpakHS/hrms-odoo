from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('login_id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'must_change_password')
    list_filter = ('role', 'is_active', 'must_change_password', 'is_first_login')
    search_fields = ('login_id', 'email', 'first_name', 'last_name')
    ordering = ('login_id',)

    fieldsets = (
        (None, {'fields': ('login_id', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Role & Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Security & Login Flags', {'fields': ('must_change_password', 'is_first_login')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('login_id', 'email', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )
