"""
Synthetic Sales & Demand Data Generator for High-Accuracy Inventory Forecast AI
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

# Fallback product catalog with realistic baseline velocities
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
                p_price = float(r["price"])
                # Realistic base daily velocity mapped to price bracket
                if p_price > 80000:
                    base_vel = 1.2
                elif p_price > 30000:
                    base_vel = 2.0
                elif p_price > 15000:
                    base_vel = 4.5
                elif p_price > 7000:
                    base_vel = 6.5
                elif p_price > 4000:
                    base_vel = 9.0
                else:
                    base_vel = 14.0
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

        recent_history = [base_v] * 30

        curr = start_date
        while curr <= end_date:
            dow = curr.weekday() # 0 = Monday, 6 = Sunday
            is_weekend = 1 if dow in [5, 6] else 0
            month = curr.month
            
            # Weekend surge: retail orders jump on Sat/Sun
            dow_factor = 1.40 if is_weekend else (0.88 if dow == 0 else 1.0)

            # Seasonal consumer spending surge: Q4 (Oct-Dec) Diwali/Holiday boost
            month_factor = 1.30 if month in [10, 11, 12] else (1.10 if month in [7, 8] else 0.95)

            # Promotions occurring ~15% of days
            promotion = 1 if (random.random() < 0.15) else 0
            discount_percent = random.choice([10, 15, 20]) if promotion else 0
            promo_factor = 1.0 + (discount_percent / 100.0) * 1.6

            # Effective price
            effective_price = round(base_price * (1.0 - (discount_percent / 100.0)), 2)

            # Autoregressive lag features from actual sequence
            lag_1 = recent_history[-1]
            lag_7 = recent_history[-7]
            roll_7 = float(np.mean(recent_history[-7:]))
            roll_30 = float(np.mean(recent_history[-30:]))

            # Expected demand formula combining retail dynamics
            expected_demand = (
                0.50 * (base_v * dow_factor * month_factor * promo_factor) +
                0.30 * roll_7 +
                0.20 * lag_1
            )
            # Add gaussian noise (std dev = 0.45)
            noise = np.random.normal(0, 0.45)
            actual_sales = max(1, int(round(expected_demand + noise)))

            recent_history.append(actual_sales)

            records.append({
                "date": curr.strftime("%Y-%m-%d"),
                "product_id": p_id,
                "category_id": cat_id,
                "price": effective_price,
                "base_velocity": base_v,
                "day_of_week": dow,
                "month": month,
                "is_weekend": is_weekend,
                "promotion": promotion,
                "discount_percent": discount_percent,
                "lag_1d_sales": lag_1,
                "lag_7d_sales": lag_7,
                "rolling_7d_avg_sales": round(roll_7, 2),
                "rolling_30d_avg_sales": round(roll_30, 2),
                "sales_quantity": actual_sales
            })
            curr += datetime.timedelta(days=1)

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
