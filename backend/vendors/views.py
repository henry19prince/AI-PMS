from rest_framework import viewsets, filters
from rest_framework.pagination import PageNumberPagination
from .models import Vendor
from .serializers import VendorSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class VendorPagination(PageNumberPagination):
    page_size = 10              # vendors per page
    page_size_query_param = "page_size"
    max_page_size = 50

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all().order_by("name")
    serializer_class = VendorSerializer
    pagination_class = VendorPagination
    permission_classes = [IsAuthenticated]
    # 🔎 search support
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "email", "contact_person", "phone"]

    @action(detail=False, methods=["get"], url_path="all")
    def all_vendors(self, request):
        vendors = Vendor.objects.all().order_by("name")
        serializer = self.get_serializer(vendors, many=True)
        return Response(serializer.data)

