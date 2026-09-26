const db = require('../config/db');

const getAllSuppliers = async (req, res) => {
    try {
        const [suppliers] = await db.query(`
            SELECT s.*, COUNT(p.id) as supplied_products_count
            FROM suppliers s
            LEFT JOIN products p ON s.id = p.supplier_id
            GROUP BY s.id
            ORDER BY s.id ASC
        `);
        return res.json({ success: true, count: suppliers.length, suppliers });
    } catch (err) {
        console.error('Fetch suppliers error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve suppliers.' });
    }
};

const createSupplier = async (req, res) => {
    try {
        const { name, contact_email, phone, lead_time_days, reliability_score, address } = req.body;
        if (!name || !contact_email) {
            return res.status(400).json({ success: false, message: 'Supplier name and contact email are required.' });
        }

        const [result] = await db.query(`
            INSERT INTO suppliers (name, contact_email, phone, lead_time_days, reliability_score, address)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            name,
            contact_email,
            phone || null,
            Number(lead_time_days) || 5,
            Number(reliability_score) || 4.5,
            address || null
        ]);

        return res.status(201).json({ success: true, message: 'Supplier registered.', supplierId: result.insertId });
    } catch (err) {
        console.error('Create supplier error:', err);
        return res.status(500).json({ success: false, message: 'Failed to register supplier.' });
    }
};

const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contact_email, phone, lead_time_days, reliability_score, address } = req.body;

        await db.query(`
            UPDATE suppliers
            SET name = ?, contact_email = ?, phone = ?, lead_time_days = ?, reliability_score = ?, address = ?
            WHERE id = ?
        `, [name, contact_email, phone, Number(lead_time_days), Number(reliability_score), address, id]);

        return res.json({ success: true, message: 'Supplier details updated.' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update supplier.' });
    }
};

module.exports = {
    getAllSuppliers,
    createSupplier,
    updateSupplier
};
