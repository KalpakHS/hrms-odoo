from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """Custom manager for Dayflow User model."""

    def create_user(self, login_id, email=None, password=None, **extra_fields):
        if not login_id:
            raise ValueError('The Login ID is required.')
        email = self.normalize_email(email) if email else None
        user = self.model(login_id=login_id, email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, login_id, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)
        extra_fields.setdefault('must_change_password', False)
        extra_fields.setdefault('is_first_login', False)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(login_id, email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom user model for Dayflow HRMS.
    Supports role-based access: ADMIN, HR, EMPLOYEE.
    Uses unique login_id (e.g. OIJOID20220001) as primary identifier.
    """

    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        HR = 'HR', 'HR Manager'
        EMPLOYEE = 'EMPLOYEE', 'Employee'

    username = None  # Remove username field
    login_id = models.CharField(
        max_length=30,
        unique=True,
        db_index=True,
        verbose_name='Login ID',
        help_text='Unique employee login identifier (e.g. OIJOID20220001)',
    )
    email = models.EmailField(unique=True, verbose_name='Email Address')
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.EMPLOYEE,
        db_index=True,
        verbose_name='User Role',
    )
    must_change_password = models.BooleanField(
        default=True,
        verbose_name='Must Change Password',
        help_text='Forces password change on initial login',
    )
    is_first_login = models.BooleanField(
        default=True,
        verbose_name='First Login Flag',
        help_text='Indicates if the user has never logged in before',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'login_id'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']

    def __str__(self):
        name = self.get_full_name()
        display_name = name if name else self.email
        return f"{self.login_id} ({display_name}) - {self.get_role_display()}"

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN or self.is_superuser

    @property
    def is_hr(self):
        return self.role == self.Role.HR

    @property
    def is_employee(self):
        return self.role == self.Role.EMPLOYEE

    @property
    def is_admin_or_hr(self):
        return self.is_admin or self.is_hr
