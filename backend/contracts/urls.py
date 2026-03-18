from django.urls import path
from .views import ContractUploadView, ContractSummaryView

urlpatterns = [
    path('upload/', ContractUploadView.as_view()),
    path('<int:pk>/summary/', ContractSummaryView.as_view()),
]