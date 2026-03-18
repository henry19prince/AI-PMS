from rest_framework import serializers
from .models import Contract, ContractSummary

class ContractUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contract
        fields = ['id', 'title', 'document', 'uploaded_at']


class ContractSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContractSummary
        fields = '__all__'