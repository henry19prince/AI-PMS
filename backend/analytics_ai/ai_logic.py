# backend/analytics_ai/ai_logic.py
"""
AI Logic - RandomForestRegressor + SHAP Explanation
"""

from vendors.models import Vendor
from inventory.models import InventoryItem
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib
import os
import shap
from typing import List, Dict, Optional

# Model paths
MODEL_PATH = 'analytics_ai/models/supplier_recommender.pkl'
SHAP_PATH  = 'analytics_ai/models/shap_explainer.pkl'
os.makedirs('analytics_ai/models', exist_ok=True)


def train_model():
    """Train model + SHAP explainer"""
    print("🔄 Training AI Vendor Recommender with SHAP...")

    vendors = Vendor.objects.all()
    if vendors.count() < 10:
        print("⚠️ Not enough data. Training skipped.")
        return False

    data = []
    for v in vendors:
        on_time_rate = (v.on_time_deliveries / v.total_orders) * 100 if v.total_orders > 0 else 50
        delivery_score = max(0, 100 - (v.avg_delivery_days * 3))

        target_score = (v.reliability_score * 0.35) + \
               (on_time_rate * 0.30) + \
               (delivery_score * 0.25) + \
               ((100 - v.avg_delivery_days * 2) * 0.10)
        target_score = min(100, max(0, target_score))

        data.append({
            'reliability_score': v.reliability_score or 50,
            'on_time_rate': on_time_rate,
            'avg_delivery_days': v.avg_delivery_days or 10,
            'total_orders': v.total_orders or 0,
            'target_score': target_score
        })

    df = pd.DataFrame(data)
    X = df[['reliability_score', 'on_time_rate', 'avg_delivery_days', 'total_orders']]
    y = df['target_score']

    model = RandomForestRegressor(n_estimators=150, random_state=42)
    model.fit(X, y)

    # Save model
    joblib.dump(model, MODEL_PATH)

    # Save SHAP explainer
    explainer = shap.TreeExplainer(model)
    joblib.dump(explainer, SHAP_PATH)

    print("✅ Model + SHAP explainer trained and saved!")
    return True


def calculate_ai_risk(vendor):
    """
    Balanced ML Risk Score + Complete SHAP Explanation
    """
    if not os.path.exists(SHAP_PATH):
        train_model()

    try:
        model = joblib.load(MODEL_PATH)
        explainer = joblib.load(SHAP_PATH)
    except:
        return 50.0, "Model not available."

    on_time_rate = (vendor.on_time_deliveries / vendor.total_orders * 100) if vendor.total_orders > 0 else 50

    features = pd.DataFrame([{
        'reliability_score': vendor.reliability_score or 50,
        'on_time_rate': on_time_rate,
        'avg_delivery_days': vendor.avg_delivery_days or 10,
        'total_orders': vendor.total_orders or 0
    }])

    goodness_score = model.predict(features)[0]
    risk_score = round(100 - goodness_score, 1)
    risk_score = max(0, min(100, risk_score))

    # SHAP values
    shap_values = explainer.shap_values(features)[0]
    feature_names = ["Reliability Score", "On-Time Rate (%)", "Avg Delivery Days", "Total Orders"]

    impacts = []
    total_explained = 0

    for name, shap_val in zip(feature_names, shap_values):
        if abs(shap_val) > 1.5:                     # Show only meaningful contributions
            direction = "increased" if shap_val > 0 else "decreased"
            impacts.append(f"{name} {direction} risk by {abs(round(shap_val, 1))} points")
            total_explained += abs(shap_val)

    # Add base/unexplained risk (the missing part)
    base_risk = round(risk_score - total_explained, 1)
    if base_risk > 3:
        impacts.append(f"Base risk level from overall vendor history: {base_risk} points")

    explanation = " • ".join(impacts)

    return risk_score, "**SHAP AI Analysis:** " + explanation

def get_vendor_recommendations(
    categories: Optional[List[int]] = None,
    budget: Optional[float] = None,
    top_n: int = 5
) -> List[Dict]:
    """
    MAIN AI FUNCTION - Now uses RandomForestRegressor
    Returns top vendors with ML-predicted goodness score.
    """
    # Load trained model (if not exists → fallback to rule-based)
    if not os.path.exists(MODEL_PATH):
        print("⚠️ Model not trained yet. Running training automatically...")
        train_model()

    try:
        model = joblib.load(MODEL_PATH)
    except:
        # Fallback if loading fails
        return get_rule_based_recommendations(categories, budget, top_n)

    # Get candidate vendors
    if categories:
        candidates = Vendor.objects.filter(categories__id__in=categories).distinct()
    else:
        candidates = Vendor.objects.all()

    if not candidates.exists():
        return []

    recommendations = []
    for vendor in candidates:
        on_time_rate = (vendor.on_time_deliveries / vendor.total_orders * 100) if vendor.total_orders > 0 else 50

        features = pd.DataFrame([{
            'reliability_score': vendor.reliability_score or 50,
            'on_time_rate': on_time_rate,
            'avg_delivery_days': vendor.avg_delivery_days or 10,
            'total_orders': vendor.total_orders or 0
        }])

        # Predict score using ML model
        ml_score = model.predict(features)[0]
        ml_score = max(0, min(100, round(ml_score, 1)))

        explanation = f"ML-predicted score based on reliability ({vendor.reliability_score}) + delivery history"

        recommendations.append({
            "vendor_id": vendor.id,
            "name": vendor.name,
            "score": ml_score,
            "explanation": explanation,
            "reliability": vendor.reliability_score,
            "risk": 100 - ml_score
        })

    # Sort by ML score
    recommendations.sort(key=lambda x: x["score"], reverse=True)
    return recommendations[:top_n]


# ==================== Fallback Rule-Based (if model fails) ====================
def get_rule_based_recommendations(categories=None, budget=None, top_n=5):
    """Old logic kept as safety net"""
    # (same as your previous version - kept minimal)
    if categories:
        candidates = Vendor.objects.filter(categories__id__in=categories).distinct()
    else:
        candidates = Vendor.objects.all()

    if budget:
        candidates = candidates.filter(reliability_score__gte=60)

    recommendations = []
    for vendor in candidates:
        score = vendor.reliability_score or 50
        if categories:
            matched = vendor.categories.filter(id__in=categories).count()
            score += 15 * (matched / len(categories)) if len(categories) > 0 else 0
        if vendor.avg_delivery_days > 10:
            score -= (vendor.avg_delivery_days - 10) * 2
        score = max(0, min(100, score))

        recommendations.append({
            "vendor_id": vendor.id,
            "name": vendor.name,
            "score": round(score, 1),
            "explanation": "Rule-based fallback (model not loaded)",
            "reliability": vendor.reliability_score,
            "risk": 100 - score
        })

    recommendations.sort(key=lambda x: x["score"], reverse=True)
    return recommendations[:top_n]
# Add this at the end of analytics_ai/ai_logic.py

