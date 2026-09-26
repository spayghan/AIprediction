const express = require('express');
const router = express.Router();
const {
    getAllSuppliers,
    createSupplier,
    updateSupplier
} = require('../controllers/supplierController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken, requireAdmin);

router.get('/', getAllSuppliers);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);

module.exports = router;
