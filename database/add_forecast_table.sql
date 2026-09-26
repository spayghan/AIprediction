-- ==============================================================
-- StockFlow E-Commerce & Inventory Management System
-- Demand Forecast Table & Stored Procedure Migration
-- ==============================================================

USE inventory_ecommerce_db;

-- 1. Demand Forecast Storage Table
CREATE TABLE IF NOT EXISTS demand_forecast (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_quantity INT NOT NULL DEFAULT 0,
    confidence_score DECIMAL(5,2) DEFAULT 85.00,
    horizon_days INT NOT NULL DEFAULT 30,
    model_version VARCHAR(50) NOT NULL DEFAULT 'v1.0.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_product_forecast_date (product_id, forecast_date),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_forecast_product ON demand_forecast(product_id);
CREATE INDEX idx_forecast_date ON demand_forecast(forecast_date);

-- 2. Stored Procedure for Upserting AI Demand Predictions
DROP PROCEDURE IF EXISTS sp_save_forecast;

DELIMITER $$
CREATE PROCEDURE sp_save_forecast(
    IN p_product_id INT,
    IN p_forecast_date DATE,
    IN p_predicted_quantity INT,
    IN p_confidence_score DECIMAL(5,2),
    IN p_horizon_days INT,
    IN p_model_version VARCHAR(50)
)
BEGIN
    INSERT INTO demand_forecast (
        product_id,
        forecast_date,
        predicted_quantity,
        confidence_score,
        horizon_days,
        model_version,
        updated_at
    )
    VALUES (
        p_product_id,
        p_forecast_date,
        p_predicted_quantity,
        p_confidence_score,
        p_horizon_days,
        p_model_version,
        CURRENT_TIMESTAMP
    )
    ON DUPLICATE KEY UPDATE
        predicted_quantity = p_predicted_quantity,
        confidence_score = p_confidence_score,
        horizon_days = p_horizon_days,
        model_version = p_model_version,
        updated_at = CURRENT_TIMESTAMP;
END$$
DELIMITER ;
