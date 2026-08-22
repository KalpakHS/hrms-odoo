"""
Service layer for Dayflow HRMS user accounts, authentication, and password management.
"""

from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password


def authenticate_user(request, login_id, password):
    """
    Authenticates a user via login_id and password.
    Returns the User instance if valid and active, else None.
    """
    if not login_id or not password:
        return None

    user = authenticate(request, login_id=login_id.strip(), password=password)
    if user and user.is_active:
        return user
    return None


def login_user_session(request, user):
    """Logs the user into the current Django session."""
    login(request, user)


def logout_user_session(request):
    """Logs out the user and flushes their session."""
    logout(request)


def process_password_change(user, new_password, request=None):
    """
    Validates and updates user password, clearing must_change_password and is_first_login.
    Maintains session auth hash if request is provided so user isn't logged out.
    """
    validate_password(new_password, user)
    user.set_password(new_password)
    user.must_change_password = False
    user.is_first_login = False
    user.save()

    if request:
        update_session_auth_hash(request, user)

    return user
