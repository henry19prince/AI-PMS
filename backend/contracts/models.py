from django.db import models

class ContractDocument(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='contracts/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # AI Results
    summary = models.TextField(blank=True)
    key_clauses = models.JSONField(default=dict)  # Stores extracted Payment, Penalty, etc.
    confidence_score = models.FloatField(default=0.0)

    def __str__(self):
        return self.title