"""
Role-Based Access Control (RBAC) Permissions for Dayflow HRMS.
"""
from rest_framework import permissions

class IsAdminOrHR(permissions.BasePermission):
    """
    Allows access only to users with the ADMIN role or superusers.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser)
        )


class IsEmployee(permissions.BasePermission):
    """
    Allows access to users with the EMPLOYEE role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'EMPLOYEE'
        )


class IsSelfOrAdmin(permissions.BasePermission):
    """
    Object-level permission allowing Admins to access anything,
    and Employees to access ONLY their own linked record.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Admin has unrestricted access
        if request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser:
            return True

        # Check if the object is the User itself
        if hasattr(obj, 'id') and isinstance(obj, request.user.__class__):
            return obj == request.user

        # Check if object is Employee and relates to request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user

        # Check if object has an 'employee' field that relates to request.user
        if hasattr(obj, 'employee') and hasattr(obj.employee, 'user'):
            return obj.employee.user == request.user

        return False


class IsAdminOrReadOnlyForSelf(permissions.BasePermission):
    """
    Allows Admins full read/write access.
    Allows Employees read-only access to their own records.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Admins can do anything
        if request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser:
            return True

        # Employees only get SAFE_METHODS on their own record
        if request.method in permissions.SAFE_METHODS:
            if hasattr(obj, 'user'):
                return obj.user == request.user
            if hasattr(obj, 'employee') and hasattr(obj.employee, 'user'):
                return obj.employee.user == request.user

        return False
