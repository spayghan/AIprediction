const db = require('../config/db');

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

        // Compute metrics
        let totalUnits = 0;
        let totalValuation = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;

        products.forEach(p => {
            totalUnits += p.stock_quantity;
            totalValuation += Number(p.price) * p.stock_quantity;
            if (p.stock_quantity === 0) {
                outOfStockCount++;
            } else if (p.stock_quantity <= p.reorder_point) {
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
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const product = products[0];
        const previousStock = product.stock_quantity;
        const delta = Number(changeAmount);
        const newStock = Math.max(0, previousStock + delta);

        // Update product stock
        await db.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, productId]);

        // Insert audit log
        await db.query(`
            INSERT INTO inventory_logs (product_id, change_type, quantity_changed, previous_stock, new_stock, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            productId,
            changeType || 'adjustment',
            delta,
            previousStock,
            newStock,
            notes || `Admin manual stock adjustment`
        ]);

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

const getInventoryLogs = async (req, res) => {
    try {
        const { productId, limit = 50 } = req.query;
        let queryStr = `
            SELECT 
                l.*,
                p.name as product_name,
                p.sku
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
        console.error('Inventory logs error:', err);
        return res.status(500).json({ success: false, message: 'Failed to load inventory audit logs.' });
    }
};

const getPurchaseOrders = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT 
                po.*,
                s.name as supplier_name,
                s.contact_email as supplier_email,
                p.name as product_name,
                p.sku,
                p.stock_quantity as current_stock
            FROM purchase_orders po
            JOIN suppliers s ON po.supplier_id = s.id
            JOIN products p ON po.product_id = p.id
            ORDER BY po.id DESC
        `);
        return res.json({ success: true, count: orders.length, orders });
    } catch (err) {
        console.error('Fetch purchase orders error:', err);
        return res.status(500).json({ success: false, message: 'Failed to load purchase orders.' });
    }
};

const createPurchaseOrder = async (req, res) => {
    try {
        const { supplierId, productId, quantity, expectedDeliveryDays } = req.body;

        if (!supplierId || !productId || !quantity || Number(quantity) <= 0) {
            return res.status(400).json({ success: false, message: 'Supplier, product, and valid quantity are required.' });
        }

        const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
        const days = Number(expectedDeliveryDays) || 5;

        // Calculate expected date
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + days);
        const formattedDate = expDate.toISOString().split('T')[0];

        await db.query(`
            INSERT INTO purchase_orders (po_number, supplier_id, product_id, quantity, status, expected_delivery_date)
            VALUES (?, ?, ?, ?, 'ordered', ?)
        `, [poNumber, supplierId, productId, Number(quantity), formattedDate]);

        return res.status(201).json({
            success: true,
            message: `Purchase order ${poNumber} created and dispatched to supplier.`,
            poNumber
        });
    } catch (err) {
        console.error('Create PO error:', err);
        return res.status(500).json({ success: false, message: 'Failed to create purchase order.' });
    }
};

const updatePurchaseOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const [pos] = await db.query('SELECT * FROM purchase_orders WHERE id = ?', [id]);
        if (pos.length === 0) {
            return res.status(404).json({ success: false, message: 'Purchase order not found.' });
        }

        const po = pos[0];

        // If transitioning to received, automatically increment product stock!
        if (status === 'received' && po.status !== 'received') {
            const [prods] = await db.query('SELECT * FROM products WHERE id = ?', [po.product_id]);
            if (prods.length > 0) {
                const prev = prods[0].stock_quantity;
                const updated = prev + po.quantity;
                await db.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [updated, po.product_id]);

                await db.query(`
                    INSERT INTO inventory_logs (product_id, change_type, quantity_changed, previous_stock, new_stock, notes)
                    VALUES (?, 'supplier_received', ?, ?, ?, ?)
                `, [po.product_id, po.quantity, prev, updated, `Purchase Order #${po.po_number} shipment received`]);
            }
        }

        await db.query('UPDATE purchase_orders SET status = ? WHERE id = ?', [status, id]);

        return res.json({ success: true, message: `PO #${po.po_number} status updated to "${status}".` });
    } catch (err) {
        console.error('Update PO status error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update purchase order.' });
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
