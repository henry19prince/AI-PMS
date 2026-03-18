# backend/procurement/views.py (Added AI suggestion placeholder view)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import PurchaseRequest, PurchaseOrder
from .serializers import PurchaseRequestSerializer, PurchaseOrderSerializer
from django.shortcuts import get_object_or_404
from vendors.models import Vendor  # Changed from Supplier
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from inventory.models import InventoryItem
from django.db.models import Sum
from .permissions import IsAdminOrProcurementManager
from analytics_ai.ai_logic import get_vendor_recommendations

@method_decorator(csrf_exempt, name='dispatch')
class PurchaseRequestListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            prs = PurchaseRequest.objects.all().order_by("-id")
            serializer = PurchaseRequestSerializer(prs, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in PR list: {str(e)}")  # Log for debugging
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def post(self, request):
        serializer = PurchaseRequestSerializer(
            data=request.data,
            context={'request': request}
        )
        if not serializer.is_valid():
            print(serializer.errors) # 👈 IMPORTANT
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class PurchaseRequestApproveView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrProcurementManager]
    def patch(self, request, pk):
        pr = get_object_or_404(PurchaseRequest, pk=pk)
        if pr.status != "PENDING":
            return Response({"error": "PR already processed"}, status=status.HTTP_400_BAD_REQUEST)
        pr.status = "APPROVED"
        pr.save()
        if hasattr(pr, "purchase_order"):
            return Response({"message": "PR approved (PO already exists)"})
        # Use suggested_vendor if exists, else fallback
        vendor = pr.suggested_vendor or Vendor.objects.first()
        if not vendor:
            return Response({"error": "No vendor available or suggested"}, status=status.HTTP_400_BAD_REQUEST)
        total_cost = sum(item.quantity * item.estimated_price for item in pr.items.all())
        PurchaseOrder.objects.create(
            purchase_request=pr,
            supplier=vendor,
            final_cost=total_cost,
            status="CREATED"
        )
        return Response({"message": "PR approved and PO created automatically"})

class PurchaseRequestDeclineView(APIView):  # New view
    permission_classes = [IsAuthenticated, IsAdminOrProcurementManager]
    def patch(self, request, pk):
        pr = get_object_or_404(PurchaseRequest, pk=pk)
        if pr.status != "PENDING":
            return Response({"error": "PR already processed"}, status=status.HTTP_400_BAD_REQUEST)
        pr.status = "DECLINED"
        pr.save()
        return Response({"message": "PR declined"})

# ... (Rest of views same)
class PurchaseOrderCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pr_id):
        pr = get_object_or_404(PurchaseRequest, id=pr_id)
        if pr.status != "APPROVED":
            return Response(
                {"error": "PR must be approved before creating PO"},
                status=status.HTTP_400_BAD_REQUEST
            )
        if hasattr(pr, 'purchase_order'):
            return Response(
                {"error": "Purchase Order already exists for this PR"},
                status=status.HTTP_400_BAD_REQUEST
            )
        vendor = Vendor.objects.first()  # Changed
        if not vendor:
            return Response(
                {"error": "No vendor available"},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Calculate final cost from PR items
        total_cost = sum(
            item.quantity * item.estimated_price
            for item in pr.items.all()
        )
        po = PurchaseOrder.objects.create(
            purchase_request=pr,
            supplier=vendor,  # Changed
            final_cost=total_cost,
            status="CREATED"
        )
        serializer = PurchaseOrderSerializer(po)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class PurchaseOrderListView(APIView):
    def get(self, request):
        pos = PurchaseOrder.objects.all().order_by("-id")
        print("PO COUNT:", pos.count())
        serializer = PurchaseOrderSerializer(pos, many=True)
        return Response(serializer.data)

class PurchaseOrderDetailView(APIView):
    def get(self, request, pk):
        try:
            po = PurchaseOrder.objects.get(pk=pk)
        except PurchaseOrder.DoesNotExist:
            return Response(
                {"error": "Purchase Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = PurchaseOrderSerializer(po)
        return Response(serializer.data)

class PurchaseOrderStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, pk):
        try:
            po = PurchaseOrder.objects.get(pk=pk)
        except PurchaseOrder.DoesNotExist:
            return Response(
                {"error": "Purchase Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        new_status = request.data.get("status")
        if new_status not in ["SENT", "DELIVERED"]:
            return Response(
                {"error": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )
        # ✅ Only update inventory when delivered
        if new_status == "DELIVERED" and po.status != "DELIVERED":
            pr = po.purchase_request
            for pr_item in pr.items.all():
                inventory_item = pr_item.item
                inventory_item.current_stock += pr_item.quantity
                inventory_item.save()
        po.status = new_status
        po.save()
        return Response(
            {"message": f"PO status updated to {new_status}"}
        )

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        total_pr = PurchaseRequest.objects.count()
        pending_pr = PurchaseRequest.objects.filter(status="PENDING").count()
        approved_pr = PurchaseRequest.objects.filter(status="APPROVED").count()
        total_po = PurchaseOrder.objects.count()
        delivered_po = PurchaseOrder.objects.filter(status="DELIVERED").count()
        total_value = PurchaseOrder.objects.aggregate(
            total=Sum("final_cost")
        )["total"] or 0
        return Response({
            "total_pr": total_pr,
            "pending_pr": pending_pr,
            "approved_pr": approved_pr,
            "total_po": total_po,
            "delivered_po": delivered_po,
            "total_value": total_value,
        })
    
# ... (Existing code)
# In backend/procurement/views.py (add import at top)

# Replace the old PurchaseRequestAISuggestView with this:
class PurchaseRequestAISuggestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        department = request.data.get('department')
        item_id = request.data.get('item')
        quantity = request.data.get('quantity')
        estimated_price = request.data.get('estimated_price')

        if not all([department, item_id, quantity, estimated_price]):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        # Get category from the selected item
        try:
            item = InventoryItem.objects.get(id=item_id)
            category_id = item.category.id if item.category else None
        except InventoryItem.DoesNotExist:
            category_id = None

        # Call our clean AI function
        recommendations = get_vendor_recommendations(
            categories=[category_id] if category_id else None,
            budget=float(estimated_price) * int(quantity),
            top_n=5
        )

        return Response({
            "message": "AI suggestions ready",
            "suggestions": recommendations
        })