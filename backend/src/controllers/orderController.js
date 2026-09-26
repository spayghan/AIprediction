const db = require('../config/db');

const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items, shippingAddress, paymentMethod, notes } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart items cannot be empty.' });
        }

        if (!shippingAddress) {
            return res.status(400).json({ success: false, message: 'Shipping address is required.' });
        }

        // Validate stock availability for each item
        let totalAmount = 0;
        const productDataList = [];

        for (const item of items) {
            const [prods] = await db.query('SELECT * FROM products WHERE id = ?', [item.productId]);
            if (prods.length === 0) {
                return res.status(404).json({ success: false, message: `Product ID ${item.productId} not found.` });
            }
            const product = prods[0];
            const qty = Number(item.quantity);

            if (qty <= 0) {
                return res.status(400).json({ success: false, message: `Invalid quantity for ${product.name}.` });
            }

            if (product.stock_quantity < qty) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient inventory for "${product.name}". Available: ${product.stock_quantity}, Requested: ${qty}.`
                });
            }

            const subtotal = Number(product.price) * qty;
            totalAmount += subtotal;

            productDataList.push({
                product,
                quantity: qty,
                unitPrice: Number(product.price),
                subtotal
            });
        }

        // Generate clean unique Order Number
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `ORD-${new Date().getFullYear()}-${randomCode}`;

        // Insert Order
        const [orderResult] = await db.query(`
            INSERT INTO orders (order_number, user_id, total_amount, status, shipping_address, payment_method, payment_status, notes)
            VALUES (?, ?, ?, 'pending', ?, ?, 'paid', ?)
        `, [
            orderNumber,
            userId,
            totalAmount.toFixed(2),
            shippingAddress,
            paymentMethod || 'Credit Card',
            notes || null
        ]);

        const orderId = orderResult.insertId;

        // Insert Order Items and update product stock with audit log
        for (const entry of productDataList) {
            await db.query(`
                INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
                VALUES (?, ?, ?, ?, ?)
            `, [
                orderId,
                entry.product.id,
                entry.quantity,
                entry.unitPrice.toFixed(2),
                entry.subtotal.toFixed(2)
            ]);

            // Deduct stock
            const newStock = entry.product.stock_quantity - entry.quantity;
            await db.query(`
                UPDATE products SET stock_quantity = ? WHERE id = ?
            `, [newStock, entry.product.id]);

            // Create inventory log
            await db.query(`
                INSERT INTO inventory_logs (product_id, change_type, quantity_changed, previous_stock, new_stock, notes)
                VALUES (?, 'order_deduction', ?, ?, ?, ?)
            `, [
                entry.product.id,
                -entry.quantity,
                entry.product.stock_quantity,
                newStock,
                `Customer Order #${orderNumber}`
            ]);
        }

        return res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            orderId,
            orderNumber,
            totalAmount: Number(totalAmount.toFixed(2))
        });
    } catch (err) {
        console.error('Create order error:', err);
        return res.status(500).json({ success: false, message: 'Server error processing order checkout.' });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const [orders] = await db.query(`
            SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC
        `, [userId]);

        // Attach items for each order
        for (const order of orders) {
            const [items] = await db.query(`
                SELECT 
                    oi.*,
                    p.name as product_name,
                    p.sku,
                    p.image_url
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [order.id]);
            order.items = items;
        }

        return res.json({ success: true, count: orders.length, orders });
    } catch (err) {
        console.error('Fetch customer orders error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const { status, search } = req.query;
        let queryStr = `
            SELECT 
                o.*,
                u.name as customer_name,
                u.email as customer_email,
                u.phone as customer_phone
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            queryStr += ` AND o.status = ?`;
            params.push(status);
        }

        if (search) {
            queryStr += ` AND (o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        queryStr += ` ORDER BY o.id DESC`;

        const [orders] = await db.query(queryStr, params);

        // Attach items for each order
        for (const order of orders) {
            const [items] = await db.query(`
                SELECT 
                    oi.*,
                    p.name as product_name,
                    p.sku,
                    p.image_url
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [order.id]);
            order.items = items;
        }

        return res.json({ success: true, count: orders.length, orders });
    } catch (err) {
        console.error('Fetch all orders error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve order registry.' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid order status value.' });
        }

        const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        const currentOrder = orders[0];

        // If transitioning from non-cancelled to cancelled, restore inventory
        if (status === 'cancelled' && currentOrder.status !== 'cancelled') {
            const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
            for (const item of items) {
                const [prods] = await db.query('SELECT stock_quantity FROM products WHERE id = ?', [item.product_id]);
                if (prods.length > 0) {
                    const currentStock = prods[0].stock_quantity;
                    const restoredStock = currentStock + item.quantity;
                    await db.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [restoredStock, item.product_id]);
                    await db.query(`
                        INSERT INTO inventory_logs (product_id, change_type, quantity_changed, previous_stock, new_stock, notes)
                        VALUES (?, 'return_addition', ?, ?, ?, ?)
                    `, [item.product_id, item.quantity, currentStock, restoredStock, `Restock from cancelled order #${currentOrder.order_number}`]);
                }
            }
        }

        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

        return res.json({ success: true, message: `Order #${currentOrder.order_number} status updated to "${status}".` });
    } catch (err) {
        console.error('Update order status error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update order status.' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const [orders] = await db.query(`
            SELECT 
                o.*,
                u.name as customer_name,
                u.email as customer_email,
                u.phone as customer_phone
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `, [id]);

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        const order = orders[0];

        // Ensure customer can only view their own order (admins can view any)
        if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
        }

        const [items] = await db.query(`
            SELECT 
                oi.*,
                p.name as product_name,
                p.sku,
                p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [id]);

        order.items = items;

        return res.json({ success: true, order });
    } catch (err) {
        console.error('Get order by ID error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve order details.' });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    getOrderById
};
