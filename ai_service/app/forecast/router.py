"""
FastAPI Forecast Microservice Router
Provides REST API endpoints for demand forecasting, batch predictions,
model diagnostics, and retraining triggers.
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, BackgroundTasks

from app.model import generate_product_forecast, get_model
from models.train_demand_model import train_model
from data.generate_synthetic_data import generate_synthetic_dataset

router = APIRouter()

class ForecastSingleRequest(BaseModel):
    product_id: int = Field(..., description="ID of the product")
    category_id: Optional[int] = Field(1, description="Category ID of the product")
    price: Optional[float] = Field(1000.0, description="Selling price of the product")
    current_stock: Optional[int] = Field(10, description="Current stock quantity in warehouse")
    horizon_days: Optional[int] = Field(30, ge=1, le=90, description="Forecast horizon in days (1 to 90)")
    baseline_velocity: Optional[float] = Field(4.0, description="Recent average daily velocity")

class ProductInfo(BaseModel):
    product_id: int
    category_id: Optional[int] = 1
    price: Optional[float] = 1000.0
    current_stock: Optional[int] = 10
    baseline_velocity: Optional[float] = 4.0

class ForecastBatchRequest(BaseModel):
    horizon_days: Optional[int] = Field(30, ge=1, le=90)
    products: List[ProductInfo]

class DayForecastItem(BaseModel):
    date: str
    day_name: str
    predicted_quantity: int
    is_weekend: bool
    promotion: bool

class ForecastSingleResponse(BaseModel):
    model_config = {'protected_namespaces': ()}
    product_id: int
    horizon_days: int
    model_version: str
    confidence_score: float
    total_predicted_quantity: int
    avg_daily_demand: float
    current_stock: int
    days_of_supply: int
    stockout_risk: str
    recommended_restock: int
    forecast_timeline: List[DayForecastItem]

@router.get("/health")
def get_service_health():
    """Health check & model telemetry endpoint."""
    try:
        _, metadata = get_model()
        return {
            "status": "online",
            "microservice": "AI Demand Forecast Service (FastAPI)",
            "model_type": metadata.get("model_type", "DemandForecastEnsemble"),
            "model_version": metadata.get("model_version", "v1.0.0"),
            "metrics": metadata.get("metrics", {}),
            "features_count": len(metadata.get("features", [])),
            "trained_at": metadata.get("trained_at", "unknown")
        }
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e)
        }

@router.post("/predict", response_model=ForecastSingleResponse)
def predict_product_demand(req: ForecastSingleRequest):
    """Generate forward multi-day demand forecast for a single product."""
    try:
        result = generate_product_forecast(
            product_id=req.product_id,
            category_id=req.category_id or 1,
            price=float(req.price or 1000.0),
            current_stock=int(req.current_stock or 0),
            horizon_days=req.horizon_days or 30,
            baseline_velocity=float(req.baseline_velocity or 4.0)
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@router.post("/predict-batch")
def predict_batch_demand(req: ForecastBatchRequest):
    """Generate forward forecasts for an entire catalog of products."""
    results = []
    for p in req.products:
        try:
            forecast = generate_product_forecast(
                product_id=p.product_id,
                category_id=p.category_id or 1,
                price=float(p.price or 1000.0),
                current_stock=int(p.current_stock or 0),
                horizon_days=req.horizon_days or 30,
                baseline_velocity=float(p.baseline_velocity or 4.0)
            )
            results.append(forecast)
        except Exception as e:
            results.append({
                "product_id": p.product_id,
                "error": str(e)
            })
    return {
        "success": True,
        "count": len(results),
        "horizon_days": req.horizon_days,
        "forecasts": results
    }

@router.post("/retrain")
def retrain_model_pipeline(background_tasks: BackgroundTasks):
    """Trigger background regeneration of synthetic data and model retraining."""
    def run_pipeline():
        generate_synthetic_dataset(days_history=365)
        train_model()

    background_tasks.add_task(run_pipeline)
    return {
        "success": True,
        "message": "Retraining task launched in background."
    }
