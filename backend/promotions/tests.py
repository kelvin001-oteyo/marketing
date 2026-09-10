from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User


class PromotionApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            phone_number="0700000000",
            password="secure-password",
            role=User.Role.ADMIN,
        )

    def test_admin_can_create_and_list_promotions(self):
        self.client.force_authenticate(self.admin)
        now = timezone.now()
        payload = {
            "name": "Weekend Sale",
            "code": "weekend20",
            "discount_type": "PERCENTAGE",
            "discount_value": "20.00",
            "start_date": now.isoformat(),
            "end_date": (now + timedelta(days=2)).isoformat(),
            "is_active": True,
            "minimum_order_amount": "0.00",
        }

        create_response = self.client.post(
            "/api/v1/promotions/",
            payload,
            format="json",
        )
        list_response = self.client.get("/api/v1/promotions/")

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_response.data["code"], "WEEKEND20")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
