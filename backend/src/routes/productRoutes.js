const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories
} = require('../controllers/productController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Public catalog routes
router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin-only catalog modification routes
router.post('/', verifyToken, requireAdmin, createProduct);
router.put('/:id', verifyToken, requireAdmin, updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

module.exports = router;
