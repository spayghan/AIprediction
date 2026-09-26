import sys
from pathlib import Path
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure ai_service root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Ensure models directory is in sys.path for unpickling
MODELS_DIR = BASE_DIR / "models"
if str(MODELS_DIR) not in sys.path:
    sys.path.insert(0, str(MODELS_DIR))

from app.forecast.router import router as forecast_router

app = FastAPI(
    title="StockFlow AI Demand Forecasting Microservice",
    description="Production-grade AI forecasting microservice powering inventory demand planning, stockout prevention, and automated restock triggers.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forecast_router, prefix="/forecast", tags=["Demand Forecasting"])

@app.get("/")
def root():
    return {
        "service": "StockFlow AI Demand Forecasting Microservice",
        "status": "online",
        "docs_url": "/docs",
        "endpoints": [
            "/forecast/health",
            "/forecast/predict",
            "/forecast/predict-batch",
            "/forecast/retrain"
        ]
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
