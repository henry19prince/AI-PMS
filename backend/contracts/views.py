from django.shortcuts import render

# Create your views here.
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

from .models import Contract, ContractSummary
from .serializers import ContractUploadSerializer, ContractSummarySerializer
from .services.text_extractor import extract_text
from .services.nlp_pipeline import summarize_contract


class ContractUploadView(APIView):

    def post(self, request):
        serializer = ContractUploadSerializer(data=request.data)
        if serializer.is_valid():
            contract = serializer.save()

            file_path = os.path.join(settings.MEDIA_ROOT, str(contract.document))
            text = extract_text(file_path)

            summary_data = summarize_contract(text)

            ContractSummary.objects.create(contract=contract, **summary_data)

            return Response({"message": "Contract processed successfully"}, status=201)
        return Response(serializer.errors, status=400)


class ContractSummaryView(APIView):

    def get(self, request, pk):
        try:
            summary = ContractSummary.objects.get(contract_id=pk)
            serializer = ContractSummarySerializer(summary)
            return Response(serializer.data)
        except ContractSummary.DoesNotExist:
            return Response({"error": "Summary not found"}, status=404)