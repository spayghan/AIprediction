// const db = require('../config/db');

// let sendOutOfStockAlert;
// try {
//     const emailService = require('../services/emailService');
//     sendOutOfStockAlert = emailService.sendOutOfStockAlert;
// } catch (err) {
//     sendOutOfStockAlert = async () => {};
// }

// const createOrder = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const { items, shippingAddress, paymentMethod, notes } = req.body;

//         if (!items || !Array.isArray(items) || items.length === 0) {
//             return res.status(400).json({ success: false, message: 'Cart items cannot be empty.' });
//         }

//         if (!shippingAddress) {
//             return res.status(400).json({ success: false, message: 'Shipping address is required.' });
//         }

//         let totalAmount = 0;
//         const productDataList = [];

//         // Validate stock
//         for (const item of items) {
//             const [prods] = await db.query('SELECT * FROM products WHERE id = ?', [item.productId]);
//             if (!prods || prods.length === 0) {
//                 return res.status(404).json({ success: false, message: `Product ID ${item.productId} not found.` });
//             }
//             const product = prods[0];
//             const qty = Number(item.quantity);

//             if (qty <= 0) {
//                 return res.status(400).json({ success: false, message: `Invalid quantity for ${product.name}.` });
//             }

//             if (Number(product.stock_quantity) < qty) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Insufficient inventory for "${product.name}". Available: ${product.stock_quantity}, Requested: ${qty}.`
//                 });
//             }

//             const subtotal = Number(product.price) * qty;
//             totalAmount += subtotal;

//             productDataList.push({
//                 product,
//                 quantity: qty,
//                 unitPrice: Number(product.price),
//                 subtotal
//             });
//         }

//         const randomCode = Math.floor(1000 + Math.random() * 9000);
//         const orderNumber = `ORD-${new Date().getFullYear()}-${randomCode}`;

//         let orderId;

//         if (db.getDbType() === 'mysql') {
//             // ✅ USE STORED PROCEDURE: sp_create_order
//             const [procResult] = await db.query(
//                 'CALL sp_create_order(?, ?, ?, ?, ?, ?)',
//                 [userId, orderNumber, totalAmount.toFixed(2), shippingAddress, paymentMethod || 'Credit Card', notes || '']
//             );
//             orderId = procResult[0][0].order_id;
//         } else {
//             const [insertRes] = await db.query(`
//                 INSERT INTO orders (order_number, user_id, total_amount, status, shipping_address, payment_method, payment_status, notes)
//                 VALUES (?, ?, ?, 'pending', ?, ?, 'paid', ?)
//             `, [orderNumber, userId, totalAmount.toFixed(2), shippingAddress, paymentMethod || 'Credit Card', notes || null]);
//             orderId = insertRes.insertId;
//         }

//         // Insert Order Items
//         for (const entry of productDataList) {
//             await db.query(`
//                 INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
//                 VALUES (?, ?, ?, ?, ?)
//             `, [orderId, entry.product.id, entry.quantity, entry.unitPrice.toFixed(2), entry.subtotal.toFixed(2)]);

//             // NOTE: In MySQL, the TRIGGER 'trg_after_order_item_insert' has ALREADY decremented stock
//             // and written the inventory log automatically!

//             // Check if stock reached 0 for email notification
//             const [updatedProd] = await db.query('SELECT stock_quantity FROM products WHERE id = ?', [entry.product.id]);
//             const newStock = updatedProd && updatedProd.length > 0 ? Number(updatedProd[0].stock_quantity) : 0;

//             if (newStock === 0 && typeof sendOutOfStockAlert === 'function') {
//                 sendOutOfStockAlert({
//                     product: entry.product,
//                     triggerReason: `Customer order #${orderNumber} fulfillment`
//                 }).catch(e => console.error('[Email Alert Error]:', e.message));
//             }
//         }

//         return res.status(201).json({
//             success: true,
//             message: 'Order placed successfully!',
//             orderId,
//             orderNumber,
//             totalAmount: Number(totalAmount.toFixed(2))
//         });
//     } catch (err) {
//         console.error('Create order error:', err);
//         return res.status(500).json({ success: false, message: 'Server error processing order checkout.' });
//     }
// };

// const getAllOrders = async (req, res) => {
//     try {
//         const { status, search } = req.query;
//         let queryStr = `
//             SELECT 
//                 o.*,
//                 u.name as customer_name,
//                 u.email as customer_email,
//                 u.phone as customer_phone
//             FROM orders o
//             JOIN users u ON o.user_id = u.id
//             WHERE 1=1
//         `;
//         const params = [];

//         if (status && status !== 'undefined' && status.trim() !== '') {
//             queryStr += ` AND o.status = ?`;
//             params.push(status.trim());
//         }

//         if (search && search !== 'undefined' && search.trim() !== '') {
//             queryStr += ` AND (o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ?)`;
//             const searchPattern = `%${search.trim()}%`;
//             params.push(searchPattern, searchPattern, searchPattern);
//         }

//         queryStr += ` ORDER BY o.id DESC`;

//         const [orders] = await db.query(queryStr, params);

//         for (const order of orders) {
//             const [items] = await db.query(`
//                 SELECT 
//                     oi.*,
//                     p.name as product_name,
//                     p.sku,
//                     p.image_url
//                 FROM order_items oi
//                 JOIN products p ON oi.product_id = p.id
//                 WHERE oi.order_id = ?
//             `, [order.id]);
//             order.items = items;
//         }

//         return res.json({ success: true, count: orders.length, orders });
//     } catch (err) {
//         console.error('Fetch all orders error:', err);
//         return res.status(500).json({ success: false, message: 'Failed to retrieve order registry.' });
//     }
// };

// const updateOrderStatus = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { status } = req.body;

//         const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
//         if (!validStatuses.includes(status)) {
//             return res.status(400).json({ success: false, message: 'Invalid order status value.' });
//         }

//         if (status === 'cancelled') {
//             if (db.getDbType() === 'mysql') {
//                 // ✅ USE STORED PROCEDURE: sp_cancel_order (Automatically restocks line items)
//                 await db.query('CALL sp_cancel_order(?)', [id]);
//             } else {
//                 await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
//             }
//         } else {
//             await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
//         }

//         return res.json({ success: true, message: `Order status updated to "${status}".` });
//     } catch (err) {
//         console.error('Update order status error:', err);
//         return res.status(500).json({ success: false, message: 'Failed to update order status.' });
//     }
// };

// const getMyOrders = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const [orders] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [userId]);

//         for (const order of orders) {
//             const [items] = await db.query(`
//                 SELECT oi.*, p.name as product_name, p.sku, p.image_url
//                 FROM order_items oi
//                 JOIN products p ON oi.product_id = p.id
//                 WHERE oi.order_id = ?
//             `, [order.id]);
//             order.items = items;
//         }

//         return res.json({ success: true, count: orders.length, orders });
//     } catch (err) {
//         return res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
//     }
// };

// const getOrderById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
//         if (!orders || orders.length === 0) return res.status(404).json({ success: false, message: 'Order not found.' });
//         return res.json({ success: true, order: orders[0] });
//     } catch (err) {
//         return res.status(500).json({ success: false, message: 'Failed to retrieve order details.' });
//     }
// };

// module.exports = {
//     createOrder,
//     getMyOrders,
//     getAllOrders,
//     updateOrderStatus,
//     getOrderById
// };

const db = require('../config/db');

let sendOutOfStockAlert;
try {
    const emailService = require('../services/emailService');
    sendOutOfStockAlert = emailService.sendOutOfStockAlert;
} catch (err) {
    sendOutOfStockAlert = async () => {};
}

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

        let totalAmount = 0;
        const productDataList = [];

        for (const item of items) {
            const [prods] = await db.query('SELECT * FROM products WHERE id = ?', [item.productId]);
            if (!prods || prods.length === 0) {
                return res.status(404).json({ success: false, message: `Product ID ${item.productId} not found.` });
            }
            const product = prods[0];
            const qty = Number(item.quantity);

            if (qty <= 0) {
                return res.status(400).json({ success: false, message: `Invalid quantity for ${product.name}.` });
            }

            if (Number(product.stock_quantity) < qty) {
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

        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `ORD-${new Date().getFullYear()}-${randomCode}`;

        let orderId;
        const isMySQL = db.getDbType() === 'mysql';

        if (isMySQL) {
            const [procResult] = await db.query(
                'CALL sp_create_order(?, ?, ?, ?, ?, ?)',
                [userId, orderNumber, totalAmount.toFixed(2), shippingAddress, paymentMethod || 'Credit Card', notes || '']
            );
            orderId = procResult[0][0].order_id;
        } else {
            const [insertRes] = await db.query(`
                INSERT INTO orders (order_number, user_id, total_amount, status, shipping_address, payment_method, payment_status, notes)
                VALUES (?, ?, ?, 'pending', ?, ?, 'paid', ?)
            `, [orderNumber, userId, totalAmount.toFixed(2), shippingAddress, paymentMethod || 'Credit Card', notes || null]);
            orderId = insertRes.insertId;
        }

        for (const entry of productDataList) {
            await db.query(`
                INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
                VALUES (?, ?, ?, ?, ?)
            `, [orderId, entry.product.id, entry.quantity, entry.unitPrice.toFixed(2), entry.subtotal.toFixed(2)]);

            let newStock = 0;

            if (isMySQL) {
                // In MySQL, trg_after_order_item_insert already mutated stock & logs!
                const [updatedProd] = await db.query('SELECT stock_quantity FROM products WHERE id = ?', [entry.product.id]);
                newStock = updatedProd && updatedProd.length > 0 ? Number(updatedProd[0].stock_quantity) : 0;
            } else {
                // Fallback for SQLite
                const currentStock = Number(entry.product.stock_quantity);
                newStock = Math.max(0, currentStock - entry.quantity);
                await db.query(`UPDATE products SET stock_quantity = ? WHERE id = ?`, [newStock, entry.product.id]);
                await db.query(`
                    INSERT INTO inventory_logs (product_id, change_type, quantity_changed, previous_stock, new_stock, notes)
                    VALUES (?, 'order_deduction', ?, ?, ?, ?)
                `, [entry.product.id, -entry.quantity, currentStock, newStock, `Customer Order #${orderNumber}`]);
            }

            if (newStock === 0 && typeof sendOutOfStockAlert === 'function') {
                sendOutOfStockAlert({
                    product: entry.product,
                    triggerReason: `Customer order #${orderNumber} fulfillment`
                }).catch(e => console.error('[Email Alert Error]:', e.message));
            }
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

        if (status && status !== 'undefined' && status.trim() !== '') {
            queryStr += ` AND o.status = ?`;
            params.push(status.trim());
        }

        if (search && search !== 'undefined' && search.trim() !== '') {
            queryStr += ` AND (o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ?)`;
            const searchPattern = `%${search.trim()}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        queryStr += ` ORDER BY o.id DESC`;

        const [orders] = await db.query(queryStr, params);

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

        if (status === 'cancelled') {
            if (db.getDbType() === 'mysql') {
                await db.query('CALL sp_cancel_order(?)', [id]);
            } else {
                const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
                for (const it of items) {
                    const [prods] = await db.query('SELECT stock_quantity FROM products WHERE id = ?', [it.product_id]);
                    if (prods.length > 0) {
                        const cur = Number(prods[0].stock_quantity);
                        const rest = cur + Number(it.quantity);
                        await db.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [rest, it.product_id]);
                        await db.query(`
                            INSERT INTO inventory_logs (product_id, change_type, quantity_changed, previous_stock, new_stock, notes)
                            VALUES (?, 'return_addition', ?, ?, ?, ?)
                        `, [it.product_id, it.quantity, cur, rest, `Restock from cancelled order #${id}`]);
                    }
                }
                await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
            }
        } else {
            await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        }

        return res.json({ success: true, message: `Order status updated to "${status}".` });
    } catch (err) {
        console.error('Update order status error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update order status.' });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const [orders] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [userId]);

        for (const order of orders) {
            const [items] = await db.query(`
                SELECT oi.*, p.name as product_name, p.sku, p.image_url
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [order.id]);
            order.items = items;
        }

        return res.json({ success: true, count: orders.length, orders });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const [orders] = await db.query(`
            SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `, [id]);

        if (!orders || orders.length === 0) return res.status(404).json({ success: false, message: 'Order not found.' });

        const [items] = await db.query(`
            SELECT oi.*, p.name as product_name, p.sku, p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [id]);

        orders[0].items = items;
        return res.json({ success: true, order: orders[0] });
    } catch (err) {
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