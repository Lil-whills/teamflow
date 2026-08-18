from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework import permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView


class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        identifier = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')

        if not identifier or not password:
            return Response(
                {"message": "Username/email and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Support login via username or email
        username = identifier
        if '@' in identifier:
            user_by_email = User.objects.filter(email=identifier).first()
            if user_by_email:
                username = user_by_email.username

        user = authenticate(request, username=username, password=password)
        if user is not None:
            if not user.is_active:
                return Response(
                    {"message": "User account is disabled"},
                    status=status.HTTP_403_FORBIDDEN
                )
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "message": "Login successful",
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                }
            }, status=status.HTTP_200_OK)

        return Response(
            {"message": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )


class RegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        username = str(request.data.get('username', '')).strip()
        email = str(request.data.get('email', '')).strip()
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')

        if not username or not email or not password or not confirm_password:
            return Response(
                {"message": "All fields are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_email(email)
        except ValidationError:
            return Response(
                {"message": "Please enter a valid email address"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if password != confirm_password:
            return Response(
                {"message": "Passwords do not match"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"message": "Username already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"message": "Email already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_password(password)
        except ValidationError as e:
            return Response(
                {"message": e.messages},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(username=username, email=email, password=password)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "message": "Registration successful",
            "token": token.key,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }, status=status.HTTP_201_CREATED)


class LogoutAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if hasattr(request.user, 'auth_token'):
            request.user.auth_token.delete()
        elif request.auth and hasattr(request.auth, 'delete'):
            request.auth.delete()
        else:
            Token.objects.filter(user=request.user).delete()
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)