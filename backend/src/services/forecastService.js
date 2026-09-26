const db = require('../config/db');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Service to communicate with FastAPI Demand Forecast Microservice
 * and synchronize predictions with MySQL demand_forecast table.
 */
class ForecastService {
    /**
     * Check AI microservice health & model diagnostics
     */
    async checkHealth() {
        try {
            const response = await fetch(`${AI_SERVICE_URL}/forecast/health`);
            if (!response.ok) {
                return { status: 'offline', error: `HTTP ${response.status}` };
            }
            return await response.json();
        } catch (err) {
            return { status: 'offline', error: err.message };
        }
    }

    /**
     * Request forward multi-day demand prediction for a single product
     * and persist forecast records into MySQL database.
     */
    async getForecastForProduct(productId, horizonDays = 30) {
        // 1. Fetch product information from database
        const [products] = await db.query(
            `SELECT p.id, p.name, p.sku, p.category_id, p.price, p.stock_quantity, p.safety_stock_level, p.reorder_point
             FROM products p WHERE p.id = ?`,
            [productId]
        );

        if (!products || products.length === 0) {
            throw new Error(`Product with ID ${productId} not found.`);
        }

        const product = products[0];

        // 2. Fetch recent 30-day velocity from order_items
        const [velocityRows] = await db.query(
            `SELECT COALESCE(SUM(oi.quantity), 0) / 30.0 AS avg_daily_velocity
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             WHERE oi.product_id = ? AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND o.status != 'cancelled'`,
            [productId]
        );
        const baselineVelocity = Math.max(1.0, parseFloat(velocityRows[0]?.avg_daily_velocity || 3.5));

        // 3. Call FastAPI microservice
        const aiResponse = await fetch(`${AI_SERVICE_URL}/forecast/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id: parseInt(productId),
                category_id: product.category_id || 1,
                price: parseFloat(product.price),
                current_stock: parseInt(product.stock_quantity),
                horizon_days: parseInt(horizonDays),
                baseline_velocity: baselineVelocity
            })
        });

        if (!aiResponse.ok) {
            const errText = await aiResponse.text();
            throw new Error(`AI Microservice error (${aiResponse.status}): ${errText}`);
        }

        const forecastData = await aiResponse.json();

        // 4. Synchronize predictions into MySQL table demand_forecast
        await this.persistForecastTimeline(
            product.id,
            forecastData.forecast_timeline,
            forecastData.confidence_score,
            horizonDays,
            forecastData.model_version
        );

        return {
            product: {
                id: product.id,
                name: product.name,
                sku: product.sku,
                price: Number(product.price),
                stock_quantity: product.stock_quantity,
                safety_stock_level: product.safety_stock_level,
                reorder_point: product.reorder_point
            },
            forecast: forecastData
        };
    }

    /**
     * Persist forecast items into MySQL using stored procedure or upsert query
     */
    async persistForecastTimeline(productId, timeline, confidenceScore, horizonDays, modelVersion) {
        if (!timeline || timeline.length === 0) return;

        for (const item of timeline) {
            try {
                // Call stored procedure sp_save_forecast
                await db.query(
                    `CALL sp_save_forecast(?, ?, ?, ?, ?, ?)`,
                    [
                        productId,
                        item.date,
                        item.predicted_quantity,
                        confidenceScore,
                        horizonDays,
                        modelVersion
                    ]
                );
            } catch (spErr) {
                // Fallback to direct UPSERT in case procedure has issues
                await db.query(
                    `INSERT INTO demand_forecast (product_id, forecast_date, predicted_quantity, confidence_score, horizon_days, model_version)
                     VALUES (?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE 
                        predicted_quantity = VALUES(predicted_quantity),
                        confidence_score = VALUES(confidence_score),
                        horizon_days = VALUES(horizon_days),
                        model_version = VALUES(model_version),
                        updated_at = CURRENT_TIMESTAMP`,
                    [
                        productId,
                        item.date,
                        item.predicted_quantity,
                        confidenceScore,
                        horizonDays,
                        modelVersion
                    ]
                );
            }
        }
    }

    /**
     * Batch Synchronize all products:
     * Pulls entire catalog, queries FastAPI microservice, and stores in MySQL.
     */
    async syncAllProducts(horizonDays = 30) {
        const [products] = await db.query(
            `SELECT id, name, sku, category_id, price, stock_quantity FROM products`
        );

        if (!products || products.length === 0) {
            return { success: true, count: 0, message: 'No products in database to sync.' };
        }

        const productPayload = products.map(p => ({
            product_id: p.id,
            category_id: p.category_id || 1,
            price: parseFloat(p.price),
            current_stock: parseInt(p.stock_quantity),
            baseline_velocity: 4.0
        }));

        const aiResponse = await fetch(`${AI_SERVICE_URL}/forecast/predict-batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                horizon_days: parseInt(horizonDays),
                products: productPayload
            })
        });

        if (!aiResponse.ok) {
            throw new Error(`AI Microservice batch error: ${await aiResponse.text()}`);
        }

        const batchResult = await aiResponse.json();

        let persistedCount = 0;
        for (const f of batchResult.forecasts) {
            if (f.forecast_timeline && !f.error) {
                await this.persistForecastTimeline(
                    f.product_id,
                    f.forecast_timeline,
                    f.confidence_score,
                    horizonDays,
                    f.model_version
                );
                persistedCount++;
            }
        }

        return {
            success: true,
            totalProducts: products.length,
            syncedCount: persistedCount,
            horizonDays,
            syncedAt: new Date().toISOString()
        };
    }

    /**
     * Fetch saved forecasts directly from MySQL demand_forecast table
     */
    async getStoredForecasts(productId = null) {
        let query = `
            SELECT df.*, p.name as product_name, p.sku, p.price, p.stock_quantity
            FROM demand_forecast df
            JOIN products p ON df.product_id = p.id
        `;
        const params = [];

        if (productId) {
            query += ` WHERE df.product_id = ? `;
            params.push(productId);
        }

        query += ` ORDER BY df.product_id ASC, df.forecast_date ASC `;

        const [rows] = await db.query(query, params);
        return rows;
    }
}

module.exports = new ForecastService();
