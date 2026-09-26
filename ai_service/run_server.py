"""
Launch runner for StockFlow AI Demand Forecasting Microservice.
Starts Uvicorn ASGI server on http://localhost:8000.
"""

import sys
import os
from pathlib import Path

# Add ai_service to Python path
SERVICE_DIR = Path(__file__).resolve().parent
if str(SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(SERVICE_DIR))

MODELS_DIR = SERVICE_DIR / "models"
if str(MODELS_DIR) not in sys.path:
    sys.path.insert(0, str(MODELS_DIR))

import uvicorn

if __name__ == "__main__":
    print("[*] Starting AI Demand Forecasting Microservice on port 8000...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False, log_level="info")
