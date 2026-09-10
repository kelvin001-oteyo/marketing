from django.db.models.signals import post_save
from django.dispatch import receiver

from products.models import ProductVariant
from .models import InventoryRecord


@receiver(post_save, sender=ProductVariant)
def create_inventory_record(sender, instance, created, **kwargs):
    if created:
        InventoryRecord.objects.get_or_create(
            variant=instance
        )