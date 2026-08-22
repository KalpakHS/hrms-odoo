from django import forms
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


class LoginForm(forms.Form):
    """Form for logging in using login_id and password."""
    login_id = forms.CharField(
        label='Login ID',
        max_length=30,
        widget=forms.TextInput(attrs={
            'placeholder': 'e.g. OIJODO20260001',
            'class': 'form-control',
            'autocomplete': 'username',
            'autofocus': True,
        }),
    )
    password = forms.CharField(
        label='Password',
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Enter your password',
            'class': 'form-control',
            'autocomplete': 'current-password',
        }),
    )

    def __init__(self, request=None, *args, **kwargs):
        self.request = request
        self.user_cache = None
        super().__init__(*args, **kwargs)

    def clean(self):
        cleaned_data = super().clean()
        login_id = cleaned_data.get('login_id')
        password = cleaned_data.get('password')

        if login_id and password:
            self.user_cache = authenticate(
                self.request,
                login_id=login_id.strip(),
                password=password,
            )
            if self.user_cache is None:
                raise ValidationError(
                    'Invalid Login ID or password. Please try again.',
                    code='invalid_login',
                )
            elif not self.user_cache.is_active:
                raise ValidationError(
                    'This account is currently inactive. Please contact HR or Admin.',
                    code='inactive',
                )

        return cleaned_data

    def get_user(self):
        return self.user_cache


class FirstLoginPasswordChangeForm(forms.Form):
    """Form used specifically when an employee must change initial password on first login."""
    new_password1 = forms.CharField(
        label='New Password',
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Enter new password',
            'class': 'form-control',
            'autocomplete': 'new-password',
        }),
        help_text='Use at least 8 characters with a mix of letters, numbers, and symbols.',
    )
    new_password2 = forms.CharField(
        label='Confirm New Password',
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Confirm new password',
            'class': 'form-control',
            'autocomplete': 'new-password',
        }),
    )

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super().__init__(*args, **kwargs)

    def clean_new_password1(self):
        password = self.cleaned_data.get('new_password1')
        validate_password(password, self.user)
        return password

    def clean(self):
        cleaned_data = super().clean()
        p1 = cleaned_data.get('new_password1')
        p2 = cleaned_data.get('new_password2')

        if p1 and p2 and p1 != p2:
            self.add_error('new_password2', 'The two password fields did not match.')

        return cleaned_data

    def save(self, commit=True):
        password = self.cleaned_data['new_password1']
        self.user.set_password(password)
        self.user.must_change_password = False
        self.user.is_first_login = False
        if commit:
            self.user.save()
        return self.user


class ChangePasswordForm(forms.Form):
    """Standard password change form requiring current password."""
    old_password = forms.CharField(
        label='Current Password',
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Enter current password',
            'class': 'form-control',
            'autocomplete': 'current-password',
        }),
    )
    new_password1 = forms.CharField(
        label='New Password',
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Enter new password',
            'class': 'form-control',
            'autocomplete': 'new-password',
        }),
    )
    new_password2 = forms.CharField(
        label='Confirm New Password',
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Confirm new password',
            'class': 'form-control',
            'autocomplete': 'new-password',
        }),
    )

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super().__init__(*args, **kwargs)

    def clean_old_password(self):
        old_password = self.cleaned_data.get('old_password')
        if not self.user.check_password(old_password):
            raise ValidationError('Your current password was entered incorrectly.')
        return old_password

    def clean_new_password1(self):
        password = self.cleaned_data.get('new_password1')
        validate_password(password, self.user)
        return password

    def clean(self):
        cleaned_data = super().clean()
        p1 = cleaned_data.get('new_password1')
        p2 = cleaned_data.get('new_password2')

        if p1 and p2 and p1 != p2:
            self.add_error('new_password2', 'The two password fields did not match.')

        return cleaned_data

    def save(self, commit=True):
        password = self.cleaned_data['new_password1']
        self.user.set_password(password)
        self.user.must_change_password = False
        self.user.is_first_login = False
        if commit:
            self.user.save()
        return self.user
