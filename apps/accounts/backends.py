from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class LoginIdAuthBackend(ModelBackend):
    """
    Custom authentication backend that authenticates users using login_id and password.
    Enforces active-user check.
    """

    def authenticate(self, request, username=None, password=None, login_id=None, **kwargs):
        # Support both 'login_id' parameter and standard 'username' parameter
        identifier = login_id or username or kwargs.get('login_id')
        if not identifier or not password:
            return None

        try:
            user = User.objects.get(login_id=identifier.strip())
        except User.DoesNotExist:
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None

    def user_can_authenticate(self, user):
        """Reject inactive users from authenticating."""
        return getattr(user, 'is_active', True)
