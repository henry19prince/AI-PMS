from django.db import models
from procurement.models import PurchaseOrder

class AnalyticsReport(models.Model):
    title = models.CharField(max_length=200)
    report_type = models.CharField(max_length=50, choices=[
        ('trend', 'Spend Trend'),
        ('forecast', 'Forecast'),
        ('outlier', 'Outlier Detection')
    ])
    data_json = models.JSONField()           # Chart data + forecast
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.report_type}"