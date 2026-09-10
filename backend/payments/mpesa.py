import base64
from datetime import datetime

import requests
from django.conf import settings


def normalize_phone_number(phone_number):
    digits = "".join(character for character in phone_number if character.isdigit())

    if digits.startswith("0") and len(digits) == 10:
        digits = f"254{digits[1:]}"
    elif digits.startswith("7") and len(digits) == 9:
        digits = f"254{digits}"

    if not (digits.startswith("2547") and len(digits) == 12):
        raise ValueError("Enter a valid Kenyan M-Pesa phone number.")

    return digits


class MpesaService:
    def __init__(self):
        missing_settings = [
            name
            for name, value in {
                "MPESA_CONSUMER_KEY": settings.MPESA_CONSUMER_KEY,
                "MPESA_CONSUMER_SECRET": settings.MPESA_CONSUMER_SECRET,
                "MPESA_PASSKEY": settings.MPESA_PASSKEY,
                "MPESA_CALLBACK_URL": settings.MPESA_CALLBACK_URL,
            }.items()
            if not value
        ]

        if missing_settings:
            raise RuntimeError(
                "M-Pesa is not configured: " + ", ".join(missing_settings)
            )

        if settings.MPESA_ENVIRONMENT == "production":
            self.base_url = (
                "https://api.safaricom.co.ke"
            )
        else:
            self.base_url = (
                "https://sandbox.safaricom.co.ke"
            )

    def get_access_token(self):
        url = (
            f"{self.base_url}"
            "/oauth/v1/generate"
            "?grant_type=client_credentials"
        )

        response = requests.get(
            url,
            auth=(
                settings.MPESA_CONSUMER_KEY,
                settings.MPESA_CONSUMER_SECRET,
            ),
            timeout=30,
        )

        response.raise_for_status()

        return response.json()["access_token"]

    def generate_password(self, timestamp):
        data = (
            f"{settings.MPESA_SHORTCODE}"
            f"{settings.MPESA_PASSKEY}"
            f"{timestamp}"
        )

        return base64.b64encode(
            data.encode("utf-8")
        ).decode("utf-8")

    def stk_push(
        self,
        phone_number,
        amount,
        account_reference,
        transaction_desc,
    ):
        phone_number = normalize_phone_number(phone_number)
        timestamp = datetime.now().strftime(
            "%Y%m%d%H%M%S"
        )

        password = self.generate_password(
            timestamp
        )

        access_token = self.get_access_token()

        url = (
            f"{self.base_url}"
            "/mpesa/stkpush/v1/processrequest"
        )

        headers = {
            "Authorization": (
                f"Bearer {access_token}"
            ),
            "Content-Type": (
                "application/json"
            ),
        }

        payload = {
            "BusinessShortCode": int(
                settings.MPESA_SHORTCODE
            ),
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": (
                "CustomerPayBillOnline"
            ),
            "Amount": max(1, int(amount)),
            "PartyA": phone_number,
            "PartyB": int(
                settings.MPESA_SHORTCODE
            ),
            "PhoneNumber": phone_number,
            "CallBackURL": (
                settings.MPESA_CALLBACK_URL
            ),
            "AccountReference": (
                account_reference
            ),
            "TransactionDesc": (
                transaction_desc
            ),
        }

        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=30,
        )

        response.raise_for_status()

        return response.json()
