from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class AdminCustomerListTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            phone_number="0700000000",
            password="secure-password",
            role=User.Role.ADMIN,
        )
        self.customer = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            phone_number="0700000001",
            password="secure-password",
        )

    def test_admin_can_list_accounts(self):
        self.client.force_authenticate(self.admin)

        response = self.client.get(reverse("admin-customer-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[1]["role"], User.Role.CUSTOMER)

    def test_non_admin_cannot_list_accounts(self):
        self.client.force_authenticate(self.customer)

        response = self.client.get(reverse("admin-customer-list"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
