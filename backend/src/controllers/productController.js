const db = require('../config/db');

const getAllProducts = async (req, res) => {
    try {
        const { search, category, stockStatus, sortBy } = req.query;
        let queryStr = `
            SELECT 
                p.*,
                c.name as category_name,
                s.name as supplier_name,
                s.lead_time_days
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            queryStr += ` AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        if (category) {
            queryStr += ` AND p.category_id = ?`;
            params.push(category);
        }

        if (stockStatus === 'in_stock') {
            queryStr += ` AND p.stock_quantity > p.safety_stock_level`;
        } else if (stockStatus === 'low_stock') {
            queryStr += ` AND p.stock_quantity <= p.reorder_point AND p.stock_quantity > 0`;
        } else if (stockStatus === 'out_of_stock') {
            queryStr += ` AND p.stock_quantity = 0`;
        }

        if (sortBy === 'price_asc') {
            queryStr += ` ORDER BY p.price ASC`;
        } else if (sortBy === 'price_desc') {
            queryStr += ` ORDER BY p.price DESC`;
        } else if (sortBy === 'stock_asc') {
            queryStr += ` ORDER BY p.stock_quantity ASC`;
        } else {
            queryStr += ` ORDER BY p.id DESC`;
        }

        const [products] = await db.query(queryStr, params);
        return res.json({ success: true, count: products.length, products });
    } catch (err) {
        console.error('Fetch products error:', err);
        return res.status(500).json({ success: false, message: 'Failed to load products.' });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
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
            WHERE p.id = ?
        `, [id]);

        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        return res.json({ success: true, product: products[0] });
    } catch (err) {
        console.error('Fetch product by ID error:', err);
        return res.status(500).json({ success: false, message: 'Failed to load product details.' });
    }
};

const createProduct = async (req, res) => {
    try {
        const {
            sku,
            name,
            description,
            price,
            cost_price,
            category_id,
            supplier_id,
            image_url,
            stock_quantity,
            safety_stock_level,
            reorder_point,
            max_stock_capacity
        } = req.body;

        if (!sku || !name || price === undefined) {
            return res.status(400).json({ success: false, message: 'SKU, name, and retail price are required.' });
        }

        // Check if SKU exists
        const [existing] = await db.query('SELECT id FROM products WHERE sku = ?', [sku]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'A product with this SKU already exists.' });
        }

        const initialStock = Number(stock_quantity) || 0;
        const [result] = await db.query(`
            INSERT INTO products (
                sku, name, description, price, cost_price, category_id, supplier_id,
                image_url, stock_quantity, safety_stock_level, reorder_point, max_stock_capacity
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            sku,
            name,
            description || '',
            Number(price),
            Number(cost_price) || (Number(price) * 0.6),
            category_id || null,
            supplier_id || null,
            image_url || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80',
            initialStock,
            Number(safety_stock_level) || 15,
            Number(reorder_point) || 25,
            Number(max_stock_capacity) || 200
        ]);

        const productId = result.insertId;

        // Log initial stock creation in inventory logs
        if (initialStock > 0) {
            await db.query(`
                INSERT INTO inventory_logs (product_id, change_type, quantity_changed, previous_stock, new_stock, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [productId, 'manual_restock', initialStock, 0, initialStock, 'Initial catalog product intake']);
        }

        return res.status(201).json({
            success: true,
            message: 'Product created and integrated into inventory.',
            productId
        });
    } catch (err) {
        console.error('Create product error:', err);
        return res.status(500).json({ success: false, message: 'Failed to create product.' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            sku,
            name,
            description,
            price,
            cost_price,
            category_id,
            supplier_id,
            image_url,
            safety_stock_level,
            reorder_point,
            max_stock_capacity
        } = req.body;

        const [product] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        if (product.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        await db.query(`
            UPDATE products 
            SET sku = ?, name = ?, description = ?, price = ?, cost_price = ?,
                category_id = ?, supplier_id = ?, image_url = ?,
                safety_stock_level = ?, reorder_point = ?, max_stock_capacity = ?
            WHERE id = ?
        `, [
            sku || product[0].sku,
            name || product[0].name,
            description !== undefined ? description : product[0].description,
            price !== undefined ? Number(price) : product[0].price,
            cost_price !== undefined ? Number(cost_price) : product[0].cost_price,
            category_id || product[0].category_id,
            supplier_id || product[0].supplier_id,
            image_url || product[0].image_url,
            safety_stock_level !== undefined ? Number(safety_stock_level) : product[0].safety_stock_level,
            reorder_point !== undefined ? Number(reorder_point) : product[0].reorder_point,
            max_stock_capacity !== undefined ? Number(max_stock_capacity) : product[0].max_stock_capacity,
            id
        ]);

        return res.json({ success: true, message: 'Product updated successfully.' });
    } catch (err) {
        console.error('Update product error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update product.' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        return res.json({ success: true, message: 'Product removed from catalog.' });
    } catch (err) {
        console.error('Delete product error:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete product.' });
    }
};

const getCategories = async (req, res) => {
    try {
        const [categories] = await db.query(`
            SELECT c.*, COUNT(p.id) as product_count 
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            GROUP BY c.id
        `);
        return res.json({ success: true, categories });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories
};
