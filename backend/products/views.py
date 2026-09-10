from django.shortcuts import get_object_or_404
from django.utils.text import slugify

from rest_framework import filters, permissions, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError

from sellers.models import SellerProfile

from .models import Product, ProductVariant, ProductImage
from .permissions import IsSellerOrAdmin
from .serializers import (
    ProductSerializer,
    ProductCreateSerializer,
    ProductVariantSerializer,
    ProductImageSerializer,
)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = (
        Product.objects
        .select_related("seller", "category")
        .prefetch_related("variants", "images")
    )

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "name",
        "description",
        "brand",
        "seller__store_name",
        "category__name",
    ]

    ordering_fields = [
        "price",
        "created_at",
        "updated_at",
        "rating",
        "name",
    ]

    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()

        user = self.request.user

        # Public users only see active products.
        if not user.is_authenticated:
            return queryset.filter(
                status=Product.Status.ACTIVE
            )

        # Administrators can manage everything.
        if user.role == "ADMIN":
            return queryset

        # Sellers can only see their own products.
        if user.role == "SELLER":
            return queryset.filter(
                seller__user=user
            )

        # Customers can only see active products.
        return queryset.filter(
            status=Product.Status.ACTIVE
        )

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]

        return [IsSellerOrAdmin()]

    def get_serializer_class(self):
        if self.action == "create":
            return ProductCreateSerializer

        return ProductSerializer

    def perform_create(self, serializer):
        user = self.request.user

        # Administrator creating a product.
        if user.role == "ADMIN":
            seller_id = self.request.data.get("seller")

            if not seller_id:
                raise ValidationError(
                    {
                        "seller": (
                            "Seller is required when an "
                            "administrator creates a product."
                        )
                    }
                )

            seller = get_object_or_404(
                SellerProfile,
                id=seller_id
            )

            if not seller.verified:
                raise ValidationError(
                    {
                        "seller": (
                            "Products can only be assigned "
                            "to verified sellers."
                        )
                    }
                )

        # Seller creating their own product.
        else:
            try:
                seller = user.seller_profile

            except SellerProfile.DoesNotExist:
                raise ValidationError(
                    {
                        "seller": (
                            "Seller profile does not exist."
                        )
                    }
                )

            if not seller.verified:
                raise PermissionDenied(
                    "Your seller account has not been approved yet."
                )

        name = serializer.validated_data["name"]

        base_slug = slugify(name)

        if not base_slug:
            raise ValidationError(
                {
                    "name": (
                        "Product name must contain valid "
                        "characters."
                    )
                }
            )

        slug = base_slug
        counter = 1

        while Product.objects.filter(
            slug=slug
        ).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        serializer.save(
            seller=seller,
            slug=slug
        )

    def perform_update(self, serializer):
        product = self.get_object()
        user = self.request.user

        # Seller ownership protection.
        if user.role == "SELLER":

            if product.seller.user != user:
                raise PermissionDenied(
                    "You can only modify your own products."
                )

            if not product.seller.verified:
                raise PermissionDenied(
                    "Your seller account is not approved."
                )

            submitted_seller = self.request.data.get(
                "seller"
            )

            if submitted_seller is not None:

                try:
                    submitted_seller = int(
                        submitted_seller
                    )

                except (TypeError, ValueError):
                    raise ValidationError(
                        {
                            "seller": (
                                "Invalid seller value."
                            )
                        }
                    )

                if submitted_seller != product.seller_id:
                    raise PermissionDenied(
                        "You cannot change product ownership."
                    )

            serializer.save(
                seller=product.seller
            )

            return

        # Administrator changing a product.
        if user.role == "ADMIN":

            seller_id = self.request.data.get(
                "seller"
            )

            if seller_id is not None:

                try:
                    seller = SellerProfile.objects.get(
                        id=seller_id
                    )

                except SellerProfile.DoesNotExist:
                    raise ValidationError(
                        {
                            "seller": (
                                "Selected seller does not exist."
                            )
                        }
                    )

                if not seller.verified:
                    raise ValidationError(
                        {
                            "seller": (
                                "Products can only be assigned "
                                "to verified sellers."
                            )
                        }
                    )

                serializer.save(
                    seller=seller
                )

                return

            serializer.save(
                seller=product.seller
            )

    def perform_destroy(self, instance):
        user = self.request.user

        if user.role == "SELLER":

            if instance.seller.user != user:
                raise PermissionDenied(
                    "You can only delete your own products."
                )

        instance.delete()


class ProductVariantViewSet(viewsets.ModelViewSet):
    serializer_class = ProductVariantSerializer
    permission_classes = [IsSellerOrAdmin]

    def get_queryset(self):
        product_id = self.kwargs["product_pk"]

        queryset = (
            ProductVariant.objects
            .filter(product_id=product_id)
            .select_related(
                "product",
                "product__seller",
            )
        )

        user = self.request.user

        if user.role == "ADMIN":
            return queryset

        return queryset.filter(
            product__seller__user=user
        )

    def perform_create(self, serializer):
        product = self.get_product()

        self.check_product_access(product)

        serializer.save(
            product=product
        )

    def perform_update(self, serializer):
        product = serializer.instance.product

        self.check_product_access(product)

        serializer.save(
            product=product
        )

    def perform_destroy(self, instance):
        self.check_product_access(
            instance.product
        )

        instance.delete()

    def get_product(self):
        return get_object_or_404(
            Product.objects.select_related("seller"),
            id=self.kwargs["product_pk"],
        )

    def check_product_access(self, product):
        user = self.request.user

        if user.role == "ADMIN":
            return

        if product.seller.user != user:
            raise PermissionDenied(
                "You can only manage variants for "
                "your own products."
            )

        if not product.seller.verified:
            raise PermissionDenied(
                "Your seller account is not approved."
            )


class ProductImageViewSet(viewsets.ModelViewSet):
    serializer_class = ProductImageSerializer
    permission_classes = [IsSellerOrAdmin]

    def get_queryset(self):
        product_id = self.kwargs["product_pk"]

        queryset = (
            ProductImage.objects
            .filter(product_id=product_id)
            .select_related(
                "product",
                "product__seller",
            )
        )

        user = self.request.user

        if user.role == "ADMIN":
            return queryset

        return queryset.filter(
            product__seller__user=user
        )

    def perform_create(self, serializer):
        product = self.get_product()

        self.check_product_access(product)

        serializer.save(
            product=product
        )

    def perform_update(self, serializer):
        product = serializer.instance.product

        self.check_product_access(product)

        serializer.save(
            product=product
        )

    def perform_destroy(self, instance):
        self.check_product_access(
            instance.product
        )

        instance.delete()

    def get_product(self):
        return get_object_or_404(
            Product.objects.select_related("seller"),
            id=self.kwargs["product_pk"],
        )

    def check_product_access(self, product):
        user = self.request.user

        if user.role == "ADMIN":
            return

        if product.seller.user != user:
            raise PermissionDenied(
                "You can only manage images for "
                "your own products."
            )

        if not product.seller.verified:
            raise PermissionDenied(
                "Your seller account is not approved."
            )