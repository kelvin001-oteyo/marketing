from django.db.models import Avg

from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Review
from .permissions import IsAdmin
from .serializers import ReviewSerializer


class ProductReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        product_id = self.kwargs["product_id"]

        return (
            Review.objects
            .filter(
                product_id=product_id,
                status=Review.Status.APPROVED,
            )
            .select_related("product", "user")
        )


class CreateReviewView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
        )


class MyReviewsView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Review.objects
            .filter(user=self.request.user)
            .select_related("product")
        )


class DeleteMyReviewView(generics.DestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(
            user=self.request.user,
        )


class ProductRatingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, product_id):
        reviews = Review.objects.filter(
            product_id=product_id,
            status=Review.Status.APPROVED,
        )

        average = reviews.aggregate(
            average=Avg("rating"),
        )["average"]

        return Response(
            {
                "product_id": product_id,
                "average_rating": round(float(average), 2)
                if average is not None
                else 0,
                "review_count": reviews.count(),
            }
        )


class AdminReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        queryset = (
            Review.objects
            .select_related("product", "user")
            .order_by("-created_at")
        )

        status = self.request.query_params.get("status")

        if status:
            queryset = queryset.filter(
                status=status,
            )

        return queryset


class AdminReviewUpdateView(generics.UpdateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAdmin]
    queryset = Review.objects.all()

    http_method_names = ["patch", "put"]

    def perform_update(self, serializer):
        serializer.save()