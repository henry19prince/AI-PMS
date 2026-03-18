# backend/reports/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum
from procurement.models import PurchaseOrder
import pandas as pd
from datetime import timedelta
from sklearn.linear_model import LinearRegression
import numpy as np

@api_view(['GET'])
def spend_trends(request):
    """Monthly spend trend"""
    orders = PurchaseOrder.objects.values('purchase_request__created_at', 'final_cost')
    df = pd.DataFrame(orders)
    
    if df.empty:
        return Response({'type': 'trend', 'data': {'labels': [], 'spend': []}})
    
    df['created_at'] = pd.to_datetime(df['purchase_request__created_at'])
    df['month'] = df['created_at'].dt.to_period('M')
    monthly = df.groupby('month')['final_cost'].sum().reset_index()
    
    data = {
        'labels': monthly['month'].astype(str).tolist(),
        'spend': monthly['final_cost'].round(2).tolist()
    }
    return Response({'type': 'trend', 'data': data})


@api_view(['GET'])
def spend_forecast(request):
    """Spend forecast for next 3 months (fixed for pandas 3.0+)"""
    orders = PurchaseOrder.objects.values('purchase_request__created_at', 'final_cost')
    df = pd.DataFrame(orders)
    
    if len(df) < 3:
        return Response({
            'forecast_months': ["+1", "+2", "+3"],
            'forecast_values': [0, 0, 0],
            'note': 'Not enough data for accurate forecast'
        })

    df['date'] = pd.to_datetime(df['purchase_request__created_at'])
    
    # FIXED: Use 'ME' instead of deprecated 'M'
    monthly = df.resample('ME', on='date')['final_cost'].sum().reset_index()
    
    # Simple linear regression for forecast
    monthly['month_num'] = np.arange(len(monthly))
    X = monthly[['month_num']]
    y = monthly['final_cost']
    
    model = LinearRegression().fit(X, y)
    
    future = pd.DataFrame({'month_num': np.arange(len(monthly), len(monthly) + 3)})
    forecast_values = model.predict(future).round(2).tolist()
    
    return Response({
        'forecast_months': [f"+{i+1}" for i in range(3)],
        'forecast_values': forecast_values
    })


@api_view(['GET'])
def detect_outliers(request):
    """High-cost order outliers"""
    pos = list(PurchaseOrder.objects.all())
    if len(pos) < 5:
        return Response({"outliers": []})
    
    costs = np.array([float(po.final_cost) for po in pos]).reshape(-1, 1)
    
    from sklearn.ensemble import IsolationForest
    model = IsolationForest(contamination=0.15, random_state=42)
    outliers = model.fit_predict(costs)
    
    outlier_list = []
    for i, is_outlier in enumerate(outliers):
        if is_outlier == -1:
            outlier_list.append({
                "po_id": pos[i].id,
                "cost": float(pos[i].final_cost),
                "reason": "Unusually high cost compared to others"
            })
    
    return Response({"outliers": outlier_list})