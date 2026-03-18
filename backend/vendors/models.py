# backend/vendors/models.py (Added AI fields)
from django.db import models 

class Vendor(models.Model):
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    # Performance metrics (updated by Member 2 when orders are delivered)
    total_orders = models.PositiveIntegerField(default=0)
    on_time_deliveries = models.PositiveIntegerField(default=0)
    avg_delivery_days = models.FloatField(default=0.0)
    avg_rating = models.FloatField(default=0.0)   # 1-5 from reviews

    reliability_score = models.FloatField(default=50.0)  # 0-100, calculated

    # New AI-ready fields
    ai_risk_score = models.FloatField(default=0.0)  # 0-100, AI-calculated risk
    ai_explanation = models.TextField(blank=True)  # AI-generated text for performance/risk
    categories = models.ManyToManyField('inventory.InventoryCategory', blank=True)  # For AI suggestions matching

    # backend/vendors/models.py
    def update_metrics_from_history(self):
        deliveries = self.deliveries.all()
        
        total = deliveries.count()

        if total == 0:
            self.total_orders = 0
            self.on_time_deliveries = 0
            self.avg_delivery_days = 0
            self.avg_rating = 0
            self.reliability_score = 50
            self.ai_risk_score = 50.0
            self.ai_explanation = "No delivery history available."
            self.save()
            return

        self.total_orders = total
        self.on_time_deliveries = deliveries.filter(was_on_time=True).count()
        self.avg_delivery_days = round(sum(d.delivery_days for d in deliveries) / total, 2)
        self.avg_rating = round(sum(d.rating for d in deliveries) / total, 2)

        self.calculate_reliability_score()

        # 🔥 FIXED: Lazy import to break circular import
        from analytics_ai.ai_logic import calculate_ai_risk
        self.ai_risk_score, self.ai_explanation = calculate_ai_risk(self)

        self.save(update_fields=[
            "total_orders", "on_time_deliveries", "avg_delivery_days",
            "avg_rating", "reliability_score", "ai_risk_score", "ai_explanation"
        ])

    # You can keep your old calculate_reliability_score() and generate_ai_explanation()
    # We are no longer calling generate_ai_explanation() — it's now AI-powered above.

    def calculate_reliability_score(self):
        """Simple weighted AI scoring (rule-based + historical data)"""
        if self.total_orders == 0:
            self.reliability_score = 50.0
            return self.reliability_score

        on_time_rate = (self.on_time_deliveries / self.total_orders) * 100
        rating_score = self.avg_rating * 20                     # 0-100 scale
        delivery_score = max(0, (30 - self.avg_delivery_days) * 3)  # faster = better

        self.reliability_score = round(
            (on_time_rate * 0.5) + (rating_score * 0.3) + (delivery_score * 0.2), 1
        )
        self.reliability_score = max(0, min(100, self.reliability_score))
        # self.save()
        return self.reliability_score
    
    def generate_ai_explanation(self):
        if self.total_orders == 0:
            return "No delivery history available to evaluate vendor performance."

        on_time_rate = (self.on_time_deliveries / self.total_orders) * 100

        explanation = []

        # Delivery reliability
        if on_time_rate >= 80:
            explanation.append("Vendor consistently delivers on time.")
        elif on_time_rate >= 50:
            explanation.append("Vendor delivery punctuality is moderate.")
        else:
            explanation.append("Vendor frequently delivers late, increasing risk.")

        # Speed insight
        if self.avg_delivery_days <= 7:
            explanation.append("Delivery speed is fast.")
        elif self.avg_delivery_days <= 15:
            explanation.append("Delivery speed is acceptable.")
        else:
            explanation.append("Delivery speed is slow and may impact operations.")

        # Quality insight
        if self.avg_rating >= 8:
            explanation.append("Customer ratings indicate strong quality.")
        elif self.avg_rating >= 5:
            explanation.append("Quality feedback is average.")
        else:
            explanation.append("Low ratings suggest quality concerns.")

        return explanation

    def __str__(self):
        return self.name

class DeliveryHistory(models.Model):
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name="deliveries"
    )
    order_id = models.CharField(max_length=100, blank=True)
    delivered_on = models.DateField()

    was_on_time = models.BooleanField(default=True)
    delivery_days = models.PositiveIntegerField(default=0)

    rating = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.vendor.update_metrics_from_history()
        
    def __str__(self):
        return f"{self.vendor.name} - {self.delivered_on}"