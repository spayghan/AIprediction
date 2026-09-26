import os
import joblib
import numpy as np
from pathlib import Path

# Environment variables
MODEL_DIR = os.getenv("ML_MODEL_DIR", "models")
MODEL_FILE = os.getenv("ML_MODEL_FILE", "demand_model.pkl")
VERSION_FILE = os.getenv("ML_MODEL_VERSION_FILE", "VERSION.txt")

_model = None
_model_version = None

def load_model():
    """Load the ML model and its version lazily.
    Returns:
        tuple: (model, version)
    """
    global _model, _model_version
    if _model is None:
        model_path = Path(MODEL_DIR) / MODEL_FILE
        version_path = Path(MODEL_DIR) / VERSION_FILE
        if not model_path.is_file():
            raise FileNotFoundError(f"Model file not found at {model_path}")
        _model = joblib.load(model_path)
        if version_path.is_file():
            _model_version = version_path.read_text().strip()
        else:
            _model_version = "unknown"
    return _model, _model_version

def predict_quantity(product_id: int, horizon_days: int = 30) -> (float, str):
    """Return a forecasted quantity for a product.
    This demo implementation creates a dummy feature vector and uses the loaded model.
    In a real scenario, you would feed historical sales data.
    """
    model, version = load_model()
    # Dummy feature: product_id and horizon_days as floats
    X = np.array([[float(product_id), float(horizon_days)]])
    # Assume model follows scikit-learn API with predict method returning array
    qty = model.predict(X)[0]
    return float(qty), version
