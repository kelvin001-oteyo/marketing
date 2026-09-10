from django.db import migrations, models


def populate_promotion_codes(apps, schema_editor):
    Promotion = apps.get_model("promotions", "Promotion")

    for promotion in Promotion.objects.all():
        promotion.code = f"PROMO-{promotion.pk}"
        promotion.save(update_fields=["code"])


class Migration(migrations.Migration):
    dependencies = [
        ("promotions", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="promotion",
            name="code",
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.RunPython(
            code=populate_promotion_codes,
            reverse_code=migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name="promotion",
            name="code",
            field=models.CharField(max_length=50, unique=True),
        ),
    ]
