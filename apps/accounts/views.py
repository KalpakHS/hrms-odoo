from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django.views.decorators.http import require_http_methods

from .forms import LoginForm, FirstLoginPasswordChangeForm, ChangePasswordForm
from .services import login_user_session, logout_user_session


def login_view(request):
    """View to handle login using login_id and password."""
    if request.user.is_authenticated:
        if request.user.must_change_password:
            return redirect('accounts:password_change')
        return redirect('accounts:dashboard')

    if request.method == 'POST':
        form = LoginForm(request=request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login_user_session(request, user)
            messages.success(request, f'Welcome back, {user.first_name or user.login_id}!')

            # If user must change password on first login, force redirect
            if user.must_change_password:
                messages.info(request, 'Please change your temporary password before accessing the system.')
                return redirect('accounts:password_change')

            next_url = request.GET.get('next') or request.POST.get('next')
            if next_url and next_url != reverse('accounts:password_change'):
                return redirect(next_url)
            return redirect('accounts:dashboard')
    else:
        form = LoginForm(request=request)

    return render(request, 'accounts/login.html', {'form': form})


def logout_view(request):
    """View to log out the current user session."""
    logout_user_session(request)
    messages.info(request, 'You have been logged out successfully.')
    return redirect('accounts:login')


@login_required
def password_change_view(request):
    """View to change password for both first login and voluntary password updates."""
    user = request.user
    is_first_login_flow = user.must_change_password

    if request.method == 'POST':
        # If mandatory change, don't require old password; otherwise require old password
        if is_first_login_flow:
            form = FirstLoginPasswordChangeForm(user=user, data=request.POST)
        else:
            form = ChangePasswordForm(user=user, data=request.POST)

        if form.is_valid():
            form.save()
            # Update session hash so user remains logged in
            from django.contrib.auth import update_session_auth_hash
            update_session_auth_hash(request, user)

            messages.success(request, 'Your password has been changed successfully!')
            return redirect('accounts:dashboard')
    else:
        if is_first_login_flow:
            form = FirstLoginPasswordChangeForm(user=user)
        else:
            form = ChangePasswordForm(user=user)

    return render(request, 'accounts/password_change.html', {
        'form': form,
        'is_first_login_flow': is_first_login_flow,
    })


@login_required
def dashboard_view(request):
    """
    Landing dashboard router directing users according to their role.
    """
    user = request.user
    context = {
        'user': user,
        'role': user.role,
        'login_id': user.login_id,
        'is_admin': user.is_admin,
        'is_hr': user.is_hr,
        'is_employee': user.is_employee,
    }
    return render(request, 'accounts/dashboard.html', context)
