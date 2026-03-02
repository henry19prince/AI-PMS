from django.core.management.base import BaseCommand
from vendors.models import Vendor

class Command(BaseCommand):
    help = "Recalculate vendor metrics from delivery history"

    def handle(self, *args, **kwargs):
        for vendor in Vendor.objects.all():
            vendor.update_metrics_from_history()
            vendor.save()

        self.stdout.write(self.style.SUCCESS("Vendor metrics updated"))

""" RUN THIS TO UPDATE VENDORS TABLE AFTER INJECTING DATA OF DALIVERY HISTORY
python manage.py recalculate_vendor_metrics
"""