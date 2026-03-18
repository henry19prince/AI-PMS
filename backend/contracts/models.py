from django.db import models

class Contract(models.Model):
    title = models.CharField(max_length=255)
    document = models.FileField(upload_to="contracts/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class ContractSummary(models.Model):
    contract = models.OneToOneField(Contract, on_delete=models.CASCADE, related_name="summary")

    payment_terms = models.TextField(blank=True)
    penalty_clauses = models.TextField(blank=True)
    delivery_schedule = models.TextField(blank=True)
    contract_duration = models.TextField(blank=True)
    compliance_obligations = models.TextField(blank=True)

    full_summary = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Summary of {self.contract.title}"