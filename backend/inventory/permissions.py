from rest_framework.permissions import BasePermission


class IsInventoryManager(BasePermission):
    message = (
        "Only sellers and administrators can manage inventory."
    )

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        return request.user.role in [
            "SELLER",
            "ADMIN",
        ]