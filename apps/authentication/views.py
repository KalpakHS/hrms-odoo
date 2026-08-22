from rest_framework import status, views, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .serializers import LoginSerializer, UserSerializer, ChangePasswordSerializer

class LoginView(views.APIView):
    """
    Public endpoint: Authenticates a User using Django's password verification
    and returns a DRF Auth Token and user role profile.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        token, _ = Token.objects.get_or_create(user=user)
        user_data = UserSerializer(user).data

        return Response({
            "message": "Authentication successful",
            "token": token.key,
            "user": user_data
        }, status=status.HTTP_200_OK)


class LogoutView(views.APIView):
    """
    Authenticated endpoint: Deletes the user's active token.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Delete the token associated with the requesting user
        Token.objects.filter(user=request.user).delete()
        return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)


class CurrentUserView(views.APIView):
    """
    Authenticated endpoint: Returns the profile details and role of the currently logged-in user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChangePasswordView(views.APIView):
    """
    Authenticated endpoint: Allows users to securely update their account password.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()

        # Re-issue token to maintain session
        Token.objects.filter(user=request.user).delete()
        token = Token.objects.create(user=request.user)

        return Response({
            "message": "Password updated successfully",
            "token": token.key
        }, status=status.HTTP_200_OK)
