from functools import wraps
from django.contrib.auth.mixins import AccessMixin
from django.core.exceptions import PermissionDenied
from django.shortcuts import redirect
from django.contrib import messages


def is_admin(user):
    """Check if user has ADMIN role or is superuser."""
    return user.is_authenticated and (user.role == 'ADMIN' or user.is_superuser)


def is_hr(user):
    """Check if user has HR role."""
    return user.is_authenticated and (user.role == 'HR' or user.is_superuser)


def is_admin_or_hr(user):
    """Check if user has either ADMIN or HR role."""
    return user.is_authenticated and (user.role in ['ADMIN', 'HR'] or user.is_superuser)


def is_employee(user):
    """Check if user is an active employee."""
    return user.is_authenticated and (user.role == 'EMPLOYEE' or hasattr(user, 'employee_profile'))


def role_required(*allowed_roles):
    """
    Decorator for views that checks if the user is authenticated, active,
    and has one of the allowed roles.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('accounts:login')

            if not request.user.is_active:
                raise PermissionDenied('Your user account is inactive.')

            if request.user.is_superuser or request.user.role in allowed_roles:
                return view_func(request, *args, **kwargs)

            raise PermissionDenied('You do not have permission to access this resource.')
        return _wrapped_view
    return decorator


def admin_required(view_func):
    """Decorator to restrict view access to ADMIN role only."""
    return role_required('ADMIN')(view_func)


def hr_required(view_func):
    """Decorator to restrict view access to HR role only."""
    return role_required('HR')(view_func)


def admin_or_hr_required(view_func):
    """Decorator to restrict view access to ADMIN or HR roles."""
    return role_required('ADMIN', 'HR')(view_func)


def employee_required(view_func):
    """Decorator to restrict view access to authenticated EMPLOYEE users."""
    return role_required('EMPLOYEE', 'ADMIN', 'HR')(view_func)


# =====================================================================
# Class-Based View Mixins
# =====================================================================

class RoleRequiredMixin(AccessMixin):
    """CBV Mixin to verify user has one of the allowed roles."""
    allowed_roles = []

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()

        if not request.user.is_active:
            raise PermissionDenied('Account is inactive.')

        if request.user.is_superuser or request.user.role in self.allowed_roles:
            return super().dispatch(request, *args, **kwargs)

        raise PermissionDenied('You do not have permission to access this resource.')


class AdminRequiredMixin(RoleRequiredMixin):
    allowed_roles = ['ADMIN']


class HRRequiredMixin(RoleRequiredMixin):
    allowed_roles = ['HR']


class AdminOrHRRequiredMixin(RoleRequiredMixin):
    allowed_roles = ['ADMIN', 'HR']


class EmployeeRequiredMixin(RoleRequiredMixin):
    allowed_roles = ['EMPLOYEE', 'ADMIN', 'HR']


# =====================================================================
# Object-Level Ownership & Security Checks
# =====================================================================

def can_access_employee_data(user, employee):
    """
    Checks if a user can access a given employee's data.
    - ADMIN and HR can access all employees' data.
    - An EMPLOYEE can only access their own data.
    - Unauthorized access returns False.
    """
    if not user.is_authenticated or not user.is_active:
        return False

    if user.is_superuser or getattr(user, 'role', '') in ['ADMIN', 'HR']:
        return True

    # Check direct user_id link
    if getattr(employee, 'user_id', None) == user.id:
        return True

    # Check reverse one-to-one profile link
    try:
        if hasattr(user, 'employee_profile') and user.employee_profile.id == employee.id:
            return True
    except Exception:
        pass

    return False


def check_employee_ownership_or_403(user, employee):
    """
    Raises PermissionDenied if the user is not allowed to access the employee record.
    """
    if not can_access_employee_data(user, employee):
        raise PermissionDenied('Access denied: You cannot view or modify another employee\'s data.')
    return True


def get_accessible_employee_queryset(user, queryset):
    """
    Filters an employee queryset based on the user's role.
    - ADMIN & HR: returns full queryset.
    - EMPLOYEE: returns queryset filtered to own profile only.
    - Inactive / Unauthenticated: returns empty queryset.
    """
    if not user.is_authenticated or not user.is_active:
        return queryset.none()

    if user.is_superuser or getattr(user, 'role', '') in ['ADMIN', 'HR']:
        return queryset

    return queryset.filter(user=user)
