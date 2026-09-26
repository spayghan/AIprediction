"""
Demand Forecasting ML Model Training Pipeline
Trains an ensemble tree regression model using synthetic sales transaction data,
evaluates test metrics (MAE, RMSE, R2), and saves the serialized model artifact
to demand_forecast_model.pkl with metadata.json.
"""

import os
import json
import time
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from ensemble import DemandForecastEnsemble, FEATURE_COLUMNS, TARGET_COLUMN

def train_model(
    csv_file="synthetic_sales.csv",
    model_output_name="demand_forecast_model.pkl",
    model_version="v1.0.0"
):
    base_dir = Path(__file__).resolve().parent
    data_path = base_dir.parent / "data" / csv_file
    models_dir = base_dir
    models_dir.mkdir(parents=True, exist_ok=True)
    model_output_path = models_dir / model_output_name
    metadata_output_path = models_dir / "metadata.json"
    version_output_path = models_dir / "VERSION.txt"

    if not data_path.exists():
        raise FileNotFoundError(f"Training dataset not found at: {data_path}")

    print(f"[*] Loading training dataset from: {data_path}")
    df = pd.read_csv(data_path)

    # Impute any missing values
    df["rolling_7d_avg_sales"] = df["rolling_7d_avg_sales"].fillna(df["sales_quantity"].mean())
    df["rolling_30d_avg_sales"] = df["rolling_30d_avg_sales"].fillna(df["sales_quantity"].mean())
    df["lag_1d_sales"] = df["lag_1d_sales"].fillna(df["sales_quantity"].mean())
    df["lag_7d_sales"] = df["lag_7d_sales"].fillna(df["sales_quantity"].mean())

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    print(f"[*] Total samples: {len(df)} | Features: {len(FEATURE_COLUMNS)}")

    # 80/20 train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, shuffle=True
    )

    print("[*] Training DemandForecastEnsemble model...")
    start_time = time.time()
    model = DemandForecastEnsemble(n_estimators=35, max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    training_duration = round(time.time() - start_time, 2)

    # Predictions & Evaluation
    y_pred = model.predict(X_test)
    mae = float(mean_absolute_error(y_test, y_pred))
    mse = float(mean_squared_error(y_test, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_test, y_pred))

    print(f"[OK] Training complete in {training_duration}s")
    print(f"[+] Evaluation Metrics:")
    print(f"    - Mean Absolute Error (MAE) : {mae:.4f} units")
    print(f"    - Root Mean Squared Error   : {rmse:.4f}")
    print(f"    - R-Squared (R2 Score)      : {r2:.4f}")

    # Feature Importance Mapping
    importances = model.feature_importances_
    feat_importance_dict = {
        col: round(float(imp), 4) for col, imp in zip(FEATURE_COLUMNS, importances)
    }

    # Save trained model artifact to .pkl
    joblib.dump(model, model_output_path)
    print(f"[OK] Saved model artifact to: {model_output_path}")

    # Save VERSION.txt
    version_output_path.write_text(model_version)

    # Save detailed metadata
    metadata = {
        "model_version": model_version,
        "model_type": "DemandForecastEnsemble (Bootstrapped Trees)",
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "training_duration_seconds": training_duration,
        "total_training_samples": len(X_train),
        "total_test_samples": len(X_test),
        "metrics": {
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "r2_score": round(r2, 4),
            "confidence_pct": round(max(70.0, min(99.0, r2 * 100)), 2)
        },
        "features": FEATURE_COLUMNS,
        "feature_importances": feat_importance_dict
    }

    with open(metadata_output_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"[OK] Saved metadata to: {metadata_output_path}")

    return model_output_path, metadata

if __name__ == "__main__":
    train_model()
