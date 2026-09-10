from rest_framework.permissions import BasePermission


class IsSeller(BasePermission):
    message = "Seller access is required."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "SELLER"
        )


class IsAdmin(BasePermission):
    message = "Administrator access is required."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "ADMIN"
        )


class IsSellerOrAdmin(BasePermission):
    message = "Seller or administrator access is required."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        return request.user.role in [
            "SELLER",
            "ADMIN",
        ]