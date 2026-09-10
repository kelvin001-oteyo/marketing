from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Product
from .models import Wishlist, WishlistItem
from .serializers import WishlistSerializer


def get_wishlist(user):
    wishlist, created = Wishlist.objects.get_or_create(
        user=user
    )

    return wishlist


class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist = get_wishlist(request.user)

        serializer = WishlistSerializer(
            wishlist,
            context={"request": request},
        )

        return Response(serializer.data)


class AddToWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product")

        if not product_id:
            return Response(
                {
                    "error": "Product is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            product = Product.objects.get(
                id=product_id
            )
        except Product.DoesNotExist:
            return Response(
                {
                    "error": "Product not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        wishlist = get_wishlist(request.user)

        item, created = WishlistItem.objects.get_or_create(
            wishlist=wishlist,
            product=product,
        )

        serializer = WishlistSerializer(
            wishlist,
            context={"request": request},
        )

        if created:
            return Response(
                {
                    "message": "Product added to wishlist.",
                    "wishlist": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {
                "message": "Product is already in your wishlist.",
                "wishlist": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class RemoveFromWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        wishlist = get_wishlist(request.user)

        try:
            item = WishlistItem.objects.get(
                id=item_id,
                wishlist=wishlist,
            )
        except WishlistItem.DoesNotExist:
            return Response(
                {
                    "error": "Wishlist item not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        item.delete()

        serializer = WishlistSerializer(
            wishlist,
            context={"request": request},
        )

        return Response(
            {
                "message": "Product removed from wishlist.",
                "wishlist": serializer.data,
            },
            status=status.HTTP_200_OK,
        )