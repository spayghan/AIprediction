"""
Synthetic Sales & Demand Data Generator for Inventory Forecast AI Model
Generates realistic multi-month daily transaction histories per product,
incorporating day-of-week seasonality, promotional lifts, pricing elasticity,
and autoregressive lag features (1d, 7d, 30d rolling averages).
"""

import os
import random
import datetime
import numpy as np
import pandas as pd
import mysql.connector
from pathlib import Path
from dotenv import load_dotenv

# Load backend .env if available
backend_env_path = Path(__file__).resolve().parent.parent.parent / "backend" / ".env"
if backend_env_path.exists():
    load_dotenv(dotenv_path=backend_env_path)

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Shashvat@8080")
DB_NAME = os.getenv("DB_NAME", "inventory_ecommerce_db")

# Fallback product catalog if MySQL is not reachable
DEFAULT_PRODUCTS = [
    {"id": 1, "name": "AeroPulse ANC Pro Headphones", "category_id": 1, "price": 19999.00, "base_velocity": 4.5},
    {"id": 2, "name": "TrueSonic Wireless Studio Buds", "category_id": 1, "price": 9999.00, "base_velocity": 8.0},
    {"id": 3, "name": "UltraWide 34-Inch Curved Display", "category_id": 2, "price": 49990.00, "base_velocity": 2.0},
    {"id": 4, "name": "NovaMechanical Wireless Keyboard", "category_id": 2, "price": 8999.00, "base_velocity": 5.5},
    {"id": 5, "name": "ApexErgo Precision Wireless Mouse", "category_id": 2, "price": 5999.00, "base_velocity": 9.0},
    {"id": 6, "name": "PulseFit Horizon Smartwatch 5", "category_id": 3, "price": 24990.00, "base_velocity": 3.8},
    {"id": 7, "name": "VibeBand Active Fitness Tracker", "category_id": 3, "price": 3999.00, "base_velocity": 11.5},
    {"id": 8, "name": "AuraBeam Smart Ambient Light Bar", "category_id": 4, "price": 6999.00, "base_velocity": 3.2},
    {"id": 9, "name": "GuardEye 2K Wireless Security Cam", "category_id": 4, "price": 11999.00, "base_velocity": 4.0},
    {"id": 10, "name": "LumixPro 4K Mirrorless Cinema Rig", "category_id": 5, "price": 114990.00, "base_velocity": 1.2},
    {"id": 11, "name": "GigaCharge 65W GaN Multi-Port Charger", "category_id": 2, "price": 2499.00, "base_velocity": 14.0}
]

def fetch_products_from_db():
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT id, name, category_id, price FROM products")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        if rows:
            products = []
            for r in rows:
                p_id = r["id"]
                # assign base velocity based on price bracket
                p_price = float(r["price"])
                if p_price > 50000:
                    base_vel = 1.5
                elif p_price > 15000:
                    base_vel = 4.0
                elif p_price > 5000:
                    base_vel = 7.0
                else:
                    base_vel = 12.0
                products.append({
                    "id": p_id,
                    "name": r["name"],
                    "category_id": r["category_id"] or 1,
                    "price": p_price,
                    "base_velocity": base_vel
                })
            print(f"[+] Loaded {len(products)} products from MySQL database.")
            return products
    except Exception as e:
        print(f"[!] Warning: Could not connect to MySQL ({e}). Using default product catalog.")
    return DEFAULT_PRODUCTS

def generate_synthetic_dataset(days_history=365, output_csv="synthetic_sales.csv"):
    products = fetch_products_from_db()
    end_date = datetime.date.today()
    start_date = end_date - datetime.timedelta(days=days_history)

    records = []
    
    # Set seed for reproducible synthetic generation
    np.random.seed(42)
    random.seed(42)

    for prod in products:
        p_id = prod["id"]
        base_v = prod["base_velocity"]
        base_price = prod["price"]
        cat_id = prod["category_id"]

        history_sales = []

        curr = start_date
        while curr <= end_date:
            day_of_week = curr.weekday() # 0 = Monday, 6 = Sunday
            is_weekend = 1 if day_of_week in [5, 6] else 0
            month = curr.month
            
            # Weekend multiplier: weekend demand spikes +35% to +60%
            weekend_boost = 1.45 if is_weekend else 1.0

            # Seasonality multiplier: holiday months (Oct, Nov, Dec) have higher retail demand
            season_boost = 1.0
            if month in [10, 11, 12]:
                season_boost = 1.35
            elif month in [7, 8]:
                season_boost = 1.15

            # Random promotions occurring ~12% of the days
            promotion = 1 if (random.random() < 0.12) else 0
            discount_percent = random.choice([10, 15, 20, 25]) if promotion else 0
            promo_boost = 1.5 if promotion else 1.0

            # Effective price after promotional discount
            effective_price = round(base_price * (1.0 - (discount_percent / 100.0)), 2)

            # Calculate expected Poisson lambda for sales demand
            expected_lambda = base_v * weekend_boost * season_boost * promo_boost
            # Add gaussian noise
            noise = np.random.normal(0, 0.4)
            final_lambda = max(0.2, expected_lambda + noise)

            daily_sales = int(np.random.poisson(final_lambda))

            # Stock availability
            stock_available = max(5, int(final_lambda * 8 + np.random.randint(5, 50)))

            history_sales.append({
                "date": curr.strftime("%Y-%m-%d"),
                "product_id": p_id,
                "category_id": cat_id,
                "price": effective_price,
                "stock_available": stock_available,
                "day_of_week": day_of_week,
                "month": month,
                "is_weekend": is_weekend,
                "promotion": promotion,
                "discount_percent": discount_percent,
                "sales_quantity": daily_sales
            })
            curr += datetime.timedelta(days=1)

        # Compute autoregressive / rolling features for each product timeline
        df_p = pd.DataFrame(history_sales)
        df_p["lag_1d_sales"] = df_p["sales_quantity"].shift(1).fillna(base_v).astype(int)
        df_p["lag_7d_sales"] = df_p["sales_quantity"].shift(7).fillna(base_v).astype(int)
        df_p["rolling_7d_avg_sales"] = df_p["sales_quantity"].shift(1).rolling(window=7, min_periods=1).mean().round(2)
        df_p["rolling_30d_avg_sales"] = df_p["sales_quantity"].shift(1).rolling(window=30, min_periods=1).mean().round(2)

        records.extend(df_p.to_dict(orient="records"))

    df_full = pd.DataFrame(records)
    
    # Save to target CSV
    data_dir = Path(__file__).resolve().parent
    data_dir.mkdir(parents=True, exist_ok=True)
    out_path = data_dir / output_csv
    df_full.to_csv(out_path, index=False)
    print(f"[OK] Successfully generated {len(df_full)} synthetic records for {len(products)} products.")
    print(f"[OK] Saved dataset to: {out_path.resolve()}")
    return out_path

if __name__ == "__main__":
    generate_synthetic_dataset(days_history=365)
