from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from .models import ContractDocument
from .ai_contract_summarizer import summarize_contract

@api_view(['POST'])
def upload_contract(request):
    if 'file' not in request.FILES:
        return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['file']
    file_name = default_storage.save(f'contracts/{file.name}', file)
    file_path = default_storage.path(file_name)

    result = summarize_contract(file_path)

    contract = ContractDocument.objects.create(
        title=file.name,
        file=file,
        summary=result["summary"],
        key_clauses=result["key_clauses"],
        confidence_score=result["confidence"]
    )

    return Response({
        "contract_id": contract.id,
        "title": contract.title,
        "summary": result["summary"],
        "key_clauses": result["key_clauses"],
        "confidence": result["confidence"]
    })