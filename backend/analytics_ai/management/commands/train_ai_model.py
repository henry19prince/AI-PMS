# backend/analytics_ai/management/commands/train_ai_model.py
"""
Management Command:
    python manage.py train_ai_model

Trains the RandomForestRegressor for vendor recommendation.
"""

from django.core.management.base import BaseCommand
from analytics_ai.ai_logic import train_model


class Command(BaseCommand):
    help = 'Train the AI Vendor Recommendation model (RandomForestRegressor)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("🚀 Starting AI Model Training..."))

        success = train_model()

        if success:
            self.stdout.write(self.style.SUCCESS(
                "✅ AI Model trained successfully!\n"
                "   Model saved at: analytics_ai/models/supplier_recommender.pkl\n"
                "   You can now use 'Get AI Vendor Suggestions' button."
            ))
        else:
            self.stdout.write(self.style.ERROR(
                "❌ Training failed. Not enough vendor data.\n"
                "   Please add more vendors and delivery history first."
            ))