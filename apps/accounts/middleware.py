from django.shortcuts import redirect
from django.urls import reverse


class MustChangePasswordMiddleware:
    """
    Middleware that enforces mandatory password change for users who have
    `must_change_password=True` (e.g. upon first login).
    Redirects all regular page requests to the password change view until updated.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated and getattr(request.user, 'must_change_password', False):
            # Allowed paths during mandatory password change
            allowed_paths = [
                reverse('accounts:password_change'),
                reverse('accounts:logout'),
            ]

            # Don't intercept static/media files or allowed paths
            path = request.path_info
            if not any(path.startswith(allowed) for allowed in allowed_paths) and not path.startswith('/static/') and not path.startswith('/media/'):
                return redirect('accounts:password_change')

        response = self.get_response(request)
        return response
