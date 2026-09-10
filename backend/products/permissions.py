from rest_framework.permissions import BasePermission


class IsSellerOrAdmin(BasePermission):
    message = "Seller or administrator access is required."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        return request.user.role in [
            "SELLER",
            "ADMIN",
        ]