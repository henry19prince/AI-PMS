# backend/procurement/models.py (Added AI suggestion fields)
from django.db import models
from django.conf import settings
from inventory.models import InventoryItem
from vendors.models import Vendor
from django.utils import timezone


User = settings.AUTH_USER_MODEL

class PurchaseRequest(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('DECLINED', 'Declined'),  # New status
    ]

    requested_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='purchase_requests'
    )
    department = models.CharField(max_length=100)
    suggested_vendor = models.ForeignKey(  # New: Optional suggested vendor
        Vendor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='suggested_prs'
    )
    ai_suggested_vendors = models.JSONField(default=list, blank=True)  # New: AI-ready, list of vendor IDs/scores
    total_estimated_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='DRAFT'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"PR-{self.id} ({self.status})"

class PurchaseRequestItem(models.Model):
    purchase_request = models.ForeignKey(
        PurchaseRequest,
        on_delete=models.CASCADE,
        related_name='items'
    )
    item = models.ForeignKey(
        InventoryItem,
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField()
    estimated_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def __str__(self):
        return f"{self.item.name} x {self.quantity}"

class PurchaseOrder(models.Model):
    purchase_request = models.OneToOneField(
        PurchaseRequest,
        on_delete=models.CASCADE,
        related_name="purchase_order"
    )
    supplier = models.ForeignKey(
        Vendor,
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )
    final_cost = models.DecimalField(max_digits=10, decimal_places=2)

    # UPDATED: Only these 3 statuses as per your requirement
    STATUS_CHOICES = [
        ('CREATED', 'Created'),
        ('PURCHASED', 'Purchased'),
        ('CANCELLED', 'Cancelled'),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="CREATED"
    )

    status_updated_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"PO-{self.id} ({self.status})"