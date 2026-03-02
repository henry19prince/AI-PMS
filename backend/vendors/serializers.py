from rest_framework import serializers
from django.db.models import Count, Q
from django.db.models.functions import TruncMonth
from datetime import date, timedelta
from .models import Vendor, DeliveryHistory
from dateutil.relativedelta import relativedelta


class DeliveryHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryHistory
        fields = "__all__"


class VendorSerializer(serializers.ModelSerializer):
    # deliveries = DeliveryHistorySerializer(many=True, read_only=True)
    monthly_delivery_stats = serializers.SerializerMethodField()
    ai_explanation = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = "__all__"

    def get_monthly_delivery_stats(self, obj):
        six_months_ago = date.today().replace(day=1) - relativedelta(months=5)

        qs = (
            obj.deliveries
            .filter(delivered_on__gte=six_months_ago)
            .annotate(month=TruncMonth("delivered_on"))
            .values("month")
            .annotate(
                total=Count("id"),
                on_time=Count("id", filter=Q(was_on_time=True)),
                late=Count("id", filter=Q(was_on_time=False)),
            )
            .order_by("month")
        )

        return [
            {
                "month": item["month"].strftime("%b %Y"),
                "total": item["total"],
                "onTime": item["on_time"],
                "late": item["late"],
            }
            for item in qs
        ]
    
    def get_ai_explanation(self, obj):
        return obj.generate_ai_explanation()