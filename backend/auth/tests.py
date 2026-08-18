from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient


class AuthAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.login_url = '/auth/login/'
        self.register_url = '/auth/register/'
        self.logout_url = '/auth/logout/'

        self.user = User.objects.create_user(
            username='existinguser',
            email='existing@example.com',
            password='ValidPassword123!'
        )

    def test_register_success(self):
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'SecurePassword123!',
            'confirm_password': 'SecurePassword123!'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'newuser')
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_register_missing_fields(self):
        data = {
            'username': 'newuser',
            'email': '',
            'password': 'password123',
            'confirm_password': 'password123'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'All fields are required')

    def test_register_invalid_email(self):
        data = {
            'username': 'newuser',
            'email': 'not-an-email',
            'password': 'ValidPassword123!',
            'confirm_password': 'ValidPassword123!'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Please enter a valid email address')

    def test_register_password_mismatch(self):
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'Password123!',
            'confirm_password': 'PasswordMismatch!'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Passwords do not match')

    def test_register_existing_username(self):
        data = {
            'username': 'existinguser',
            'email': 'different@example.com',
            'password': 'ValidPassword123!',
            'confirm_password': 'ValidPassword123!'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Username already exists')

    def test_register_existing_email(self):
        data = {
            'username': 'anotheruser',
            'email': 'existing@example.com',
            'password': 'ValidPassword123!',
            'confirm_password': 'ValidPassword123!'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Email already exists')

    def test_login_with_username_success(self):
        data = {
            'username': 'existinguser',
            'password': 'ValidPassword123!'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'existinguser')

    def test_login_with_email_success(self):
        data = {
            'email': 'existing@example.com',
            'password': 'ValidPassword123!'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_login_invalid_password(self):
        data = {
            'username': 'existinguser',
            'password': 'WrongPassword'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['message'], 'Invalid credentials')

    def test_login_missing_credentials(self):
        data = {
            'username': '',
            'password': ''
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_authenticated(self):
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Token.objects.filter(user=self.user).exists())

    def test_logout_unauthenticated(self):
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_get_method_not_allowed(self):
        response = self.client.get(self.login_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_register_get_method_not_allowed(self):
        response = self.client.get(self.register_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
