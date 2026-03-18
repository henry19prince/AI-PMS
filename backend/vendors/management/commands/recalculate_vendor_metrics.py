# backend/vendors/management/commands/recalculate_vendor_metrics.py
from django.core.management.base import BaseCommand
from vendors.models import Vendor

class Command(BaseCommand):
    help = "Recalculate ALL vendor metrics + AI Risk Score & Explanation"

    def handle(self, *args, **kwargs):
        self.stdout.write("🔄 Recalculating metrics for all vendors (including AI Risk)...")

        for vendor in Vendor.objects.all():
            vendor.update_metrics_from_history()   # ← This now triggers AI

        self.stdout.write(self.style.SUCCESS(
            "✅ All vendor metrics + AI Risk Score + AI Explanation updated successfully!"
        ))
""" RUN THIS TO UPDATE VENDORS TABLE AFTER INJECTING DATA OF DALIVERY HISTORY
python manage.py recalculate_vendor_metrics
"""