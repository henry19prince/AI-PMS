from rest_framework import serializers
from .models import (
    PurchaseRequest,
    PurchaseRequestItem,
    PurchaseOrder
)
from inventory.models import InventoryItem
from vendors.models import Vendor

class PurchaseRequestItemSerializer(serializers.ModelSerializer):
    item_name = serializers.ReadOnlyField(source='item.name')

    class Meta:
        model = PurchaseRequestItem
        fields = [
            'id',
            'item',
            'item_name',
            'quantity',
            'estimated_price'
        ]

class PurchaseRequestSerializer(serializers.ModelSerializer):
    items = PurchaseRequestItemSerializer(many=True, required=False)
    requested_by_username = serializers.ReadOnlyField(
        source='requested_by.username'
    )
    suggested_vendor_name = serializers.ReadOnlyField(source='suggested_vendor.name')  # New: Vendor name for frontend

    suggested_vendor = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = PurchaseRequest
        fields = [
            'id',
            'requested_by_username',
            'department',
            'suggested_vendor',
            'suggested_vendor_name',  # New field
            'total_estimated_cost',
            'status',
            'created_at',
            'items'
        ]

        read_only_fields = [
            'status',
            'total_estimated_cost',
            'created_at'
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        if request is None or request.user.is_anonymous:
            raise serializers.ValidationError("Authentication required")

        items_data = validated_data.pop('items')
        purchase_request = PurchaseRequest.objects.create(
            requested_by=request.user,
            department=validated_data.get('department'),
            suggested_vendor=validated_data.get('suggested_vendor')
        )

        total_cost = 0
        for item_data in items_data:
            quantity = item_data['quantity']
            estimated_price = item_data['estimated_price']
            total_cost += quantity * estimated_price
            PurchaseRequestItem.objects.create(
                purchase_request=purchase_request,
                item=item_data['item'],
                quantity=quantity,
                estimated_price=estimated_price
            )

        purchase_request.total_estimated_cost = total_cost
        purchase_request.status = 'PENDING'
        purchase_request.save()

        return purchase_request

class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.ReadOnlyField(source="supplier.name")  # Keep as is, since Vendor has name
    purchase_request_items = serializers.SerializerMethodField()

    def get_purchase_request_items(self, obj):
        items = obj.purchase_request.items.all()
        return PurchaseRequestItemSerializer(items, many=True).data
    
    class Meta:
        model = PurchaseOrder
        fields = [
            "id",
            "purchase_request",
            "supplier_name",
            "final_cost",
            "status",
            "purchase_request_items",
        ]

        read_only_fields = [
            'status',
            'created_at'
        ]