const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    getOrderById
} = require('../controllers/orderController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Customer order routes
router.post('/', verifyToken, createOrder);
router.get('/my-orders', verifyToken, getMyOrders);
router.get('/:id', verifyToken, getOrderById);

// Admin order routes
router.get('/', verifyToken, requireAdmin, getAllOrders);
router.put('/:id/status', verifyToken, requireAdmin, updateOrderStatus);

module.exports = router;
