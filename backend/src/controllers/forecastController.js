const forecastService = require('../services/forecastService');

/**
 * Controller handling predictive demand forecast APIs
 */
exports.getAIServiceHealth = async (req, res) => {
    try {
        const health = await forecastService.checkHealth();
        res.json({ success: true, data: health });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getProductForecast = async (req, res) => {
    try {
        const { productId } = req.params;
        const days = parseInt(req.query.days) || 14;

        if (!productId || isNaN(productId)) {
            return res.status(400).json({ success: false, message: 'Valid productId is required.' });
        }

        const result = await forecastService.getForecastForProduct(productId, days);
        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Error generating product forecast:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.syncAllForecasts = async (req, res) => {
    try {
        const days = parseInt(req.body.days) || 14;
        const result = await forecastService.syncAllProducts(days);
        res.json(result);
    } catch (err) {
        console.error('Error syncing AI forecasts with MySQL:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getStoredForecasts = async (req, res) => {
    try {
        const productId = req.params.productId ? parseInt(req.params.productId) : null;
        const forecasts = await forecastService.getStoredForecasts(productId);
        res.json({
            success: true,
            count: forecasts.length,
            data: forecasts
        });
    } catch (err) {
        console.error('Error fetching stored forecasts:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
