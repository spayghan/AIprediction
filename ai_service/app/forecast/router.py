from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import date

from .model import load_model, predict_quantity

router = APIRouter()

class ForecastRequest(BaseModel):
    product_id: int
    horizon_days: int = 30  # default forecast horizon

class ForecastResponse(BaseModel):
    product_id: int
    forecast_date: date
    predicted_quantity: int
    model_version: str

@router.post("/predict", response_model=ForecastResponse)
async def predict(request: ForecastRequest):
    if request.horizon_days <= 0:
        raise HTTPException(status_code=400, detail="horizon_days must be positive")
    try:
        qty, version = predict_quantity(request.product_id, request.horizon_days)
        response = ForecastResponse(
            product_id=request.product_id,
            forecast_date=date.today(),
            predicted_quantity=int(qty),
            model_version=version,
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
