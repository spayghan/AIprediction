const db = require('../config/db');

let sendOutOfStockAlert;
try {
    const emailService = require('../services/emailService');
    sendOutOfStockAlert = emailService.sendOutOfStockAlert;
} catch (err) {
    sendOutOfStockAlert = async () => {};
}

const getInventoryOverview = async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT 
                p.*,
                c.name as category_name,
                s.name as supplier_name,
                s.contact_email as supplier_email,
                s.lead_time_days
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            ORDER BY p.stock_quantity ASC
        `);

        let totalUnits = 0;
        let totalValuation = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;

        products.forEach(p => {
            totalUnits += Number(p.stock_quantity);
            totalValuation += Number(p.price) * Number(p.stock_quantity);
            if (Number(p.stock_quantity) === 0) {
                outOfStockCount++;
            } else if (Number(p.stock_quantity) <= Number(p.reorder_point)) {
                lowStockCount++;
            }
        });

        return res.json({
            success: true,
            summary: {
                totalSKUs: products.length,
                totalUnits,
                totalValuation: Number(totalValuation.toFixed(2)),
                lowStockCount,
                outOfStockCount
            },
            inventory: products
        });
    } catch (err) {
        console.error('Inventory overview error:', err);
        return res.status(500).json({ success: false, message: 'Failed to load inventory data.' });
    }
};

const updateStock = async (req, res) => {
    try {
        const { productId, changeAmount, changeType, notes } = req.body;

        if (!productId || changeAmount === undefined || !changeType) {
            return res.status(400).json({ success: false, message: 'Product ID, change amount, and change type are required.' });
        }

        const [products] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
        if (!products || products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const product = products[0];
        let previousStock = Number(product.stock_quantity);
        let newStock = Math.max(0, previousStock + Number(changeAmount));

        if (db.getDbType() === 'mysql') {
            // ✅ USE STORED PROCEDURE: sp_adjust_stock
            const [procResult] = await db.query(
                'CALL sp_adjust_stock(?, ?, ?, ?)',
                [productId, Number(changeAmount), changeType, notes || '']
            );
            if (procResult && procResult[0] && procResult[0][0]) {
                previousStock = procResult[0][0].previous_stock;
                newStock = procResult[0][0].new_stock;
            }
        } else {
            await db.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, productId]);
            await db.query(`
                INSERT INTO inventory_logs (product_id, change_type, quantity_changed, previous_stock, new_stock, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [productId, changeType, Number(changeAmount), previousStock, newStock, notes || 'Manual adjustment']);
        }

        // Email alert if stock reached 0
        if (previousStock > 0 && newStock === 0 && typeof sendOutOfStockAlert === 'function') {
            sendOutOfStockAlert({
                product,
                triggerReason: notes || 'Admin manual stock adjustment'
            }).catch(e => console.error('[Email Alert Error]:', e.message));
        }

        return res.json({
            success: true,
            message: `Stock updated for "${product.name}". Previous: ${previousStock}, New: ${newStock}.`,
            previousStock,
            newStock
        });
    } catch (err) {
        console.error('Update stock error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update stock.' });
    }
};

const updatePurchaseOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const [pos] = await db.query('SELECT * FROM purchase_orders WHERE id = ?', [id]);
        if (!pos || pos.length === 0) {
            return res.status(404).json({ success: false, message: 'Purchase order not found.' });
        }

        // Updating status to 'received' will automatically trigger `trg_after_po_status_update` in MySQL!
        await db.query('UPDATE purchase_orders SET status = ? WHERE id = ?', [status, id]);

        return res.json({ success: true, message: `PO status updated to "${status}".` });
    } catch (err) {
        console.error('Update PO status error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update purchase order.' });
    }
};

const getInventoryLogs = async (req, res) => {
    try {
        const { productId, limit = 50 } = req.query;
        let queryStr = `
            SELECT l.*, p.name as product_name, p.sku
            FROM inventory_logs l
            JOIN products p ON l.product_id = p.id
            WHERE 1=1
        `;
        const params = [];
        if (productId) {
            queryStr += ` AND l.product_id = ?`;
            params.push(productId);
        }
        queryStr += ` ORDER BY l.id DESC LIMIT ?`;
        params.push(Number(limit));

        const [logs] = await db.query(queryStr, params);
        return res.json({ success: true, count: logs.length, logs });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to load inventory audit logs.' });
    }
};

const getPurchaseOrders = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT po.*, s.name as supplier_name, s.contact_email as supplier_email, p.name as product_name, p.sku, p.stock_quantity as current_stock
            FROM purchase_orders po
            JOIN suppliers s ON po.supplier_id = s.id
            JOIN products p ON po.product_id = p.id
            ORDER BY po.id DESC
        `);
        return res.json({ success: true, count: orders.length, orders });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to load purchase orders.' });
    }
};

const createPurchaseOrder = async (req, res) => {
    try {
        const { supplierId, productId, quantity, expectedDeliveryDays } = req.body;
        if (!supplierId || !productId || !quantity) {
            return res.status(400).json({ success: false, message: 'Supplier, product, and quantity required.' });
        }
        const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + (Number(expectedDeliveryDays) || 5));
        const formattedDate = expDate.toISOString().split('T')[0];

        await db.query(`
            INSERT INTO purchase_orders (po_number, supplier_id, product_id, quantity, status, expected_delivery_date)
            VALUES (?, ?, ?, ?, 'ordered', ?)
        `, [poNumber, supplierId, productId, Number(quantity), formattedDate]);

        return res.status(201).json({ success: true, message: `PO ${poNumber} created.`, poNumber });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to create PO.' });
    }
};

module.exports = {
    getInventoryOverview,
    updateStock,
    getInventoryLogs,
    getPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrderStatus
};