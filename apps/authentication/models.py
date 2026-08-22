"""
Authentication Models for Dayflow HRMS.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models

class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Admin/HR'
    EMPLOYEE = 'EMPLOYEE', 'Employee'

class User(AbstractUser):
    """
    Custom User Model extending AbstractUser to support explicit HRMS roles.
    Passwords are automatically hashed by Django's PBKDF2/SHA256 password hasher.
    """
    email = models.EmailField(unique=True, help_text="Work email address used for login and notifications.")
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.EMPLOYEE,
        help_text="System role determining permission boundaries (ADMIN vs EMPLOYEE)."
    )

    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']

    def save(self, *args, **kwargs):
        # Synchronize is_staff status with ADMIN role
        if self.role == UserRole.ADMIN:
            self.is_staff = True
        super().save(*args, **kwargs)

    @property
    def is_admin_user(self):
        return self.role == UserRole.ADMIN or self.is_superuser

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
