const express = require('express');
const router = express.Router();
const {
    getInventoryOverview,
    updateStock,
    getInventoryLogs,
    getPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrderStatus
} = require('../controllers/inventoryController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Admin inventory management
router.use(verifyToken, requireAdmin);

router.get('/overview', getInventoryOverview);
router.post('/adjust-stock', updateStock);
router.get('/logs', getInventoryLogs);

// Purchase orders (restock orders to suppliers)
router.get('/purchase-orders', getPurchaseOrders);
router.post('/purchase-orders', createPurchaseOrder);
router.put('/purchase-orders/:id/status', updatePurchaseOrderStatus);

module.exports = router;
