from django.contrib import admin
from .models import PurchaseRequest,PurchaseRequestItem,PurchaseOrder

# Register your models here.
admin.site.register(PurchaseRequest)
admin.site.register(PurchaseRequestItem)
admin.site.register(PurchaseOrder)
