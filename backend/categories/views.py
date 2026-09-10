from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Category
from .serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Category.objects.all()

        active = self.request.query_params.get("active")

        if active == "true":
            queryset = queryset.filter(
                is_active=True
            )

        elif active == "false":
            queryset = queryset.filter(
                is_active=False
            )

        parent = self.request.query_params.get("parent")

        if parent:
            queryset = queryset.filter(
                parent_id=parent
            )

        return queryset