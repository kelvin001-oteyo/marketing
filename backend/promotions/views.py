from rest_framework import viewsets

from reviews.permissions import IsAdmin

from .models import Promotion
from .serializers import PromotionSerializer


class PromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.order_by("-created_at")
    serializer_class = PromotionSerializer
    permission_classes = [IsAdmin]
