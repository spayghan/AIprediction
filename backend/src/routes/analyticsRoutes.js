const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Protected admin inventory analytics route
router.get('/', verifyToken, requireAdmin, getAnalytics);

module.exports = router;
