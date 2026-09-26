const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'inventory_ecommerce_super_secure_jwt_token_2026';

const register = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
        }

        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, 'customer', phone || null, address || null]
        );

        const userId = result.insertId;
        const user = { id: userId, name, email, role: 'customer' };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

        return res.status(201).json({
            success: true,
            message: 'Customer account registered successfully.',
            token,
            user
        });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, requestedRole } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
        }

        // If user logged in from Admin portal, check role
        if (requestedRole === 'admin' && user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: This account does not possess administrator privileges.'
            });
        }

        const tokenPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

        return res.json({
            success: true,
            message: `Welcome back, ${user.name}!`,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};

const getMe = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        return res.json({ success: true, user: users[0], dbType: db.getDbType() });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error fetching user profile.' });
    }
};

module.exports = {
    register,
    login,
    getMe
};
