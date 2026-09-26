const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDB, getDbType } = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const supplierRoutes = require('./src/routes/supplierRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // Allow frontend dev server and direct calls
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Health Check & Database Diagnostic Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        system: 'E-Commerce Inventory & Order Management System',
        corporateDomain: 'E-Commerce',
        aiDsIntegration: 'Inventory Analytics (Forecasting, ROP, Stockout Risk, ABC Pareto)',
        databaseEngine: getDbType() === 'mysql' ? 'MySQL 8.0 (Active & Connected)' : 'Embedded Relational Database (Fallback Mode)',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/analytics', analyticsRoutes);

// Fallback 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled server exception:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Boot Server
const startServer = async () => {
    try {
        await initDB();
        app.listen(PORT, () => {
            console.log(`====================================================`);
            console.log(`  E-COMMERCE INVENTORY & ORDER MANAGEMENT BACKEND   `);
            console.log(`  Server running on: http://localhost:${PORT}        `);
            console.log(`  Database Engine  : ${getDbType().toUpperCase()}   `);
            console.log(`====================================================`);
        });
    } catch (err) {
        console.error('Fatal initialization error:', err);
        process.exit(1);
    }
};

startServer();
