"""
AI Demand Forecast Model Loading & Multi-Day Inference Engine
Loads the trained DemandForecastEnsemble artifact (.pkl) and provides forward
day-by-day predictive forecasts, stockout projections, and restock recommendations.
"""

import os
import sys
import json
import joblib
import datetime
import numpy as np
import pandas as pd
from pathlib import Path

# Ensure models directory is in python path for class unpickling
MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
if str(MODELS_DIR) not in sys.path:
    sys.path.insert(0, str(MODELS_DIR))

# Import class so pickle can reconstruct it
try:
    from ensemble import DemandForecastEnsemble, FEATURE_COLUMNS
except ImportError:
    from ai_service.models.ensemble import DemandForecastEnsemble, FEATURE_COLUMNS

_cached_model = None
_cached_metadata = None

def get_model():
    """Lazily load and cache the trained PKL model and metadata."""
    global _cached_model, _cached_metadata
    if _cached_model is None:
        model_path = MODELS_DIR / "demand_forecast_model.pkl"
        metadata_path = MODELS_DIR / "metadata.json"
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found at: {model_path}. Please train the model first.")
            
        _cached_model = joblib.load(model_path)
        
        if metadata_path.exists():
            with open(metadata_path, "r") as f:
                _cached_metadata = json.load(f)
        else:
            _cached_metadata = {
                "model_version": "v1.0.0",
                "metrics": {"confidence_pct": 85.0}
            }
    return _cached_model, _cached_metadata

def generate_product_forecast(
    product_id: int,
    category_id: int = 1,
    price: float = 1000.0,
    current_stock: int = 25,
    horizon_days: int = 30,
    baseline_velocity: float = 5.0
):
    """
    Generate forward multi-day demand predictions using the trained ensemble model.
    Dynamically projects forward calendar dates, weekend surges, and autoregressive lag steps.
    """
    model, metadata = get_model()
    model_version = metadata.get("model_version", "v1.0.0")
    confidence = metadata.get("metrics", {}).get("confidence_pct", 85.0)

    daily_forecasts = []
    today = datetime.date.today()

    # Track rolling features iteratively
    simulated_lag_1d = baseline_velocity
    simulated_lag_7d = baseline_velocity
    rolling_7d_window = [baseline_velocity] * 7
    rolling_30d_window = [baseline_velocity] * 30

    total_predicted = 0

    for day_offset in range(1, horizon_days + 1):
        target_date = today + datetime.timedelta(days=day_offset)
        dow = target_date.weekday()
        is_weekend = 1 if dow in [5, 6] else 0
        month = target_date.month

        # Estimate promotional impact (e.g. slight chance on weekends)
        promo = 1 if (is_weekend and day_offset % 7 == 0) else 0
        discount = 10 if promo else 0
        effective_price = price * (1.0 - (discount / 100.0))

        rolling_7d_avg = float(np.mean(rolling_7d_window))
        rolling_30d_avg = float(np.mean(rolling_30d_window))

        # Build feature vector matching FEATURE_COLUMNS
        feature_vector = [
            product_id,
            category_id,
            effective_price,
            dow,
            month,
            is_weekend,
            promo,
            discount,
            current_stock,
            simulated_lag_1d,
            simulated_lag_7d,
            rolling_7d_avg,
            rolling_30d_avg
        ]

        # Model prediction
        pred_qty_raw = model.predict(np.array([feature_vector]))[0]
        # Demand cannot be negative
        pred_qty = max(1, int(round(float(pred_qty_raw))))

        daily_forecasts.append({
            "date": target_date.strftime("%Y-%m-%d"),
            "day_name": target_date.strftime("%a"),
            "predicted_quantity": pred_qty,
            "is_weekend": bool(is_weekend),
            "promotion": bool(promo)
        })

        total_predicted += pred_qty

        # Advance rolling lag windows
        simulated_lag_7d = rolling_7d_window[0]
        simulated_lag_1d = pred_qty
        rolling_7d_window.pop(0)
        rolling_7d_window.append(pred_qty)
        rolling_30d_window.pop(0)
        rolling_30d_window.append(pred_qty)

    avg_daily_demand = round(total_predicted / horizon_days, 2)
    
    # Days of supply remaining before stockout
    days_of_supply = int(current_stock / avg_daily_demand) if avg_daily_demand > 0 else 999
    
    # Risk calculation
    if current_stock <= (avg_daily_demand * 5):
        stockout_risk = "CRITICAL"
    elif current_stock <= (avg_daily_demand * 12):
        stockout_risk = "MODERATE"
    else:
        stockout_risk = "LOW"

    # Suggested restock units
    target_buffer_stock = int(avg_daily_demand * (horizon_days + 7))
    recommended_restock = max(0, target_buffer_stock - current_stock)

    return {
        "product_id": product_id,
        "horizon_days": horizon_days,
        "model_version": model_version,
        "confidence_score": confidence,
        "total_predicted_quantity": total_predicted,
        "avg_daily_demand": avg_daily_demand,
        "current_stock": current_stock,
        "days_of_supply": days_of_supply,
        "stockout_risk": stockout_risk,
        "recommended_restock": recommended_restock,
        "forecast_timeline": daily_forecasts
    }
