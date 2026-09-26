const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecastController');

// GET /api/forecast/health - AI microservice & model status
router.get('/health', forecastController.getAIServiceHealth);

// POST /api/forecast/sync - Batch sync all products to MySQL
router.post('/sync', forecastController.syncAllForecasts);

// GET /api/forecast/stored - Get all saved forecasts from MySQL
router.get('/stored', forecastController.getStoredForecasts);

// GET /api/forecast/stored/:productId - Get saved forecasts for specific product
router.get('/stored/:productId', forecastController.getStoredForecasts);

// GET /api/forecast/product/:productId - Get forward forecast for specific product
router.get('/product/:productId', forecastController.getProductForecast);

module.exports = router;
