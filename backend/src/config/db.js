const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let dbType = 'unknown'; // 'mysql' or 'sqlite'
let mysqlPool = null;
let sqliteDb = null;

// Helper to run SQLite queries with Promise interface matching mysql2 ([rows, meta])
const sqliteQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        const trimmed = sql.trim();
        const isSelect = /^SELECT/i.test(trimmed) || /^PRAGMA/i.test(trimmed);
        
        if (isSelect) {
            sqliteDb.all(sql, params, (err, rows) => {
                if (err) return reject(err);
                resolve([rows, null]);
            });
        } else {
            sqliteDb.run(sql, params, function (err) {
                if (err) return reject(err);
                resolve([{ insertId: this.lastID, affectedRows: this.changes }, null]);
            });
        }
    });
};

const query = async (sql, params = []) => {
    if (dbType === 'mysql') {
        return await mysqlPool.query(sql, params);
    } else if (dbType === 'sqlite') {
        // Replace MySQL specific functions if necessary for SQLite compatibility
        let adaptedSql = sql
            .replace(/NOW\(\)/gi, "datetime('now')")
            .replace(/CURDATE\(\)/gi, "date('now')")
            .replace(/DATE_SUB\(([^,]+),\s*INTERVAL\s*(\d+)\s*DAY\)/gi, "datetime($1, '-$2 days')")
            .replace(/DATE_ADD\(([^,]+),\s*INTERVAL\s*(\d+)\s*DAY\)/gi, "date($1, '+$2 days')");
        return await sqliteQuery(adaptedSql, params);
    } else {
        throw new Error('Database is not initialized yet');
    }
};

const initSQLite = async () => {
    const dataDir = path.join(__dirname, '..', '..', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'inventory_ecommerce.sqlite');

    return new Promise((resolve, reject) => {
        sqliteDb = new sqlite3.Database(dbPath, async (err) => {
            if (err) {
                console.error('[Database] Failed to open SQLite database:', err);
                return reject(err);
            }
            dbType = 'sqlite';
            console.log(`[Database] SQLite connected at ${dbPath}`);
            await createTablesAndSeed();
            resolve();
        });
    });
};

const createTablesAndSeed = async () => {
    const isSqlite = dbType === 'sqlite';
    const autoInc = isSqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY';

    // 1. Users Table
    await query(`
        CREATE TABLE IF NOT EXISTS users (
            id ${autoInc},
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'customer',
            phone VARCHAR(50),
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 2. Categories
    await query(`
        CREATE TABLE IF NOT EXISTS categories (
            id ${autoInc},
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 3. Suppliers
    await query(`
        CREATE TABLE IF NOT EXISTS suppliers (
            id ${autoInc},
            name VARCHAR(255) NOT NULL,
            contact_email VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            lead_time_days INT DEFAULT 5,
            reliability_score DECIMAL(3,2) DEFAULT 4.50,
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 4. Products
    await query(`
        CREATE TABLE IF NOT EXISTS products (
            id ${autoInc},
            sku VARCHAR(100) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            cost_price DECIMAL(10,2) NOT NULL,
            category_id INT,
            supplier_id INT,
            image_url TEXT,
            stock_quantity INT NOT NULL DEFAULT 0,
            safety_stock_level INT NOT NULL DEFAULT 15,
            reorder_point INT NOT NULL DEFAULT 25,
            max_stock_capacity INT NOT NULL DEFAULT 250,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 5. Orders
    await query(`
        CREATE TABLE IF NOT EXISTS orders (
            id ${autoInc},
            order_number VARCHAR(50) NOT NULL UNIQUE,
            user_id INT NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'pending',
            shipping_address TEXT NOT NULL,
            payment_method VARCHAR(50) NOT NULL DEFAULT 'Credit Card',
            payment_status VARCHAR(50) NOT NULL DEFAULT 'paid',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 6. Order Items
    await query(`
        CREATE TABLE IF NOT EXISTS order_items (
            id ${autoInc},
            order_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL,
            unit_price DECIMAL(10,2) NOT NULL,
            subtotal DECIMAL(10,2) NOT NULL
        )
    `);

    // 7. Inventory Logs
    await query(`
        CREATE TABLE IF NOT EXISTS inventory_logs (
            id ${autoInc},
            product_id INT NOT NULL,
            change_type VARCHAR(50) NOT NULL,
            quantity_changed INT NOT NULL,
            previous_stock INT NOT NULL,
            new_stock INT NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 8. Purchase Orders
    await query(`
        CREATE TABLE IF NOT EXISTS purchase_orders (
            id ${autoInc},
            po_number VARCHAR(50) NOT NULL UNIQUE,
            supplier_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'ordered',
            expected_delivery_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Check if seeding is needed
    const [existingUsers] = await query('SELECT count(*) as count FROM users');
    const userCount = existingUsers[0].count;

    if (userCount === 0) {
        console.log('[Database] Empty database detected. Seeding initial e-commerce data...');
        const adminHash = await bcrypt.hash('admin123', 10);
        const customerHash = await bcrypt.hash('customer123', 10);

        // Seed Users
        await query(
            'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
            ['E-Commerce Admin', 'admin@ecommerce.com', adminHash, 'admin', '+1-555-0199', 'Enterprise Logistics Hub, Warehouse 4B, Chicago, IL']
        );
        await query(
            'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
            ['Alex Customer', 'customer@ecommerce.com', customerHash, 'customer', '+1-555-0144', '742 Evergreen Terrace, Springfield, OR 97477']
        );
        await query(
            'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
            ['Sarah Connor', 'sarah@ecommerce.com', customerHash, 'customer', '+1-555-0182', '1204 Sunburst Way, Austin, TX 78701']
        );

        // Seed Categories
        const categories = [
            ['Audio & Sound', 'High-fidelity headphones, earbuds, studio monitors, and portable speakers'],
            ['Computing & Tech', 'Laptops, ultra-wide monitors, mechanical keyboards, and precision mice'],
            ['Wearables & IoT', 'Smartwatches, fitness bands, and connected health trackers'],
            ['Smart Home', 'Smart ambient lighting, wireless security cameras, and voice hubs'],
            ['Photography & Video', 'Mirrorless 4K cameras, stabilizers, and studio lighting equipment']
        ];
        for (const cat of categories) {
            await query('INSERT INTO categories (name, description) VALUES (?, ?)', cat);
        }

        // Seed Suppliers
        const suppliers = [
            ['Apex Silicon Global', 'procurement@apexsilicon.com', '+1-800-555-9011', 4, 4.85, '100 Innovation Way, San Jose, CA'],
            ['SonicWave Acoustics Ltd', 'orders@sonicwave.com', '+1-800-555-8822', 6, 4.60, '45 Audio Park, Boston, MA'],
            ['Nordic Ergonomics Corp', 'b2b@nordic-ergo.com', '+1-800-555-7733', 5, 4.90, '82 Design Boulevard, Seattle, WA'],
            ['Lumina Smart Systems', 'sales@luminasmart.io', '+1-800-555-4499', 3, 4.75, '310 Tech Loop, Austin, TX']
        ];
        for (const sup of suppliers) {
            await query('INSERT INTO suppliers (name, contact_email, phone, lead_time_days, reliability_score, address) VALUES (?, ?, ?, ?, ?, ?)', sup);
        }

        // Seed Products
        const products = [
            ['SKU-AUD-01', 'AeroPulse ANC Pro Headphones', 'Wireless active noise-cancelling over-ear headphones with 40h battery life and spatial audio.', 249.99, 130.00, 1, 2, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 8, 15, 25, 150],
            ['SKU-AUD-02', 'TrueSonic Wireless Studio Buds', 'True wireless stereo earbuds with low-latency Bluetooth 5.3 and IPX7 water resistance.', 129.50, 65.00, 1, 2, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80', 42, 20, 30, 200],
            ['SKU-CMP-01', 'UltraWide 34-Inch Curved Display', '34-inch 144Hz WQHD 1ms curved gaming & productivity monitor with USB-C 90W power delivery.', 599.00, 340.00, 2, 1, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80', 5, 10, 18, 80],
            ['SKU-CMP-02', 'NovaMechanical Wireless Keyboard', 'Hot-swappable tactile mechanical keyboard with RGB backlighting and aircraft aluminum chassis.', 119.00, 52.00, 2, 3, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', 18, 15, 22, 120],
            ['SKU-CMP-03', 'ApexErgo Precision Wireless Mouse', 'Ergonomic hyper-fast scroll wheel mouse with 8K DPI sensor and multi-device bluetooth pairing.', 79.99, 38.00, 2, 3, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80', 64, 20, 25, 180],
            ['SKU-WRB-01', 'PulseFit Horizon Smartwatch 5', 'Sapphire glass smartwatch with continuous ECG, SpO2, GPS tracking, and titanium bezel.', 299.95, 160.00, 3, 1, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 12, 15, 25, 150],
            ['SKU-WRB-02', 'VibeBand Active Fitness Tracker', 'Slim fitness tracker with sleep stage analysis, heart rate alerts, and 14-day standby.', 49.99, 21.00, 3, 1, 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80', 85, 25, 35, 250],
            ['SKU-SMH-01', 'AuraBeam Smart Ambient Light Bar', 'Wi-Fi & Matter enabled gradient ambient illumination bar syncing with screen & voice assistants.', 89.00, 42.00, 4, 4, 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80', 6, 12, 20, 100],
            ['SKU-SMH-02', 'GuardEye 2K Wireless Security Cam', 'Solar-powered weatherproof outdoor smart camera with AI human detection and color night vision.', 149.00, 75.00, 4, 4, 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=800&q=80', 28, 15, 25, 120],
            ['SKU-CAM-01', 'LumixPro 4K Mirrorless Cinema Rig', 'Compact full-frame mirrorless digital camera with 10-bit 4K 60fps and dual native ISO.', 1399.00, 890.00, 5, 1, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 4, 6, 10, 40],
            ['SKU-AUD-03', 'BassForge 360 Portable Speaker', 'Rugged waterproof Bluetooth speaker with 360-degree sound, punchy bass, and power bank feature.', 99.95, 48.00, 1, 2, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80', 38, 15, 25, 160],
            ['SKU-CMP-04', 'ThunderDock 12-in-1 Dual 4K Hub', 'Thunderbolt 4 docking station with 100W PD charging, dual HDMI, and 2.5Gbps Ethernet.', 189.00, 95.00, 2, 1, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80', 14, 15, 20, 110]
        ];

        for (const prod of products) {
            await query(`
                INSERT INTO products (sku, name, description, price, cost_price, category_id, supplier_id, image_url, stock_quantity, safety_stock_level, reorder_point, max_stock_capacity)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, prod);
        }

        // Seed Orders
        const orders = [
            ['ORD-2026-1001', 2, 379.49, 'delivered', '742 Evergreen Terrace, Springfield, OR 97477', 'Credit Card', 'paid'],
            ['ORD-2026-1002', 3, 599.00, 'delivered', '1204 Sunburst Way, Austin, TX 78701', 'PayPal', 'paid'],
            ['ORD-2026-1003', 2, 198.99, 'delivered', '742 Evergreen Terrace, Springfield, OR 97477', 'Credit Card', 'paid'],
            ['ORD-2026-1004', 3, 448.95, 'shipped', '1204 Sunburst Way, Austin, TX 78701', 'Apple Pay', 'paid'],
            ['ORD-2026-1005', 2, 119.00, 'processing', '742 Evergreen Terrace, Springfield, OR 97477', 'Credit Card', 'paid'],
            ['ORD-2026-1006', 3, 249.99, 'pending', '1204 Sunburst Way, Austin, TX 78701', 'Credit Card', 'paid']
        ];
        for (const ord of orders) {
            await query(`
                INSERT INTO orders (order_number, user_id, total_amount, status, shipping_address, payment_method, payment_status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, ord);
        }

        // Seed Order Items
        const orderItems = [
            [1, 1, 1, 249.99, 249.99],
            [1, 2, 1, 129.50, 129.50],
            [2, 3, 1, 599.00, 599.00],
            [3, 4, 1, 119.00, 119.00],
            [3, 5, 1, 79.99, 79.99],
            [4, 6, 1, 299.95, 299.95],
            [4, 9, 1, 149.00, 149.00],
            [5, 4, 1, 119.00, 119.00],
            [6, 1, 1, 249.99, 249.99]
        ];
        for (const item of orderItems) {
            await query(`
                INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
                VALUES (?, ?, ?, ?, ?)
            `, item);
        }

        // Seed Inventory Logs
        const logs = [
            [1, 'order_deduction', -1, 9, 8, 'Order #ORD-2026-1006 fulfillment'],
            [3, 'order_deduction', -1, 6, 5, 'Order #ORD-2026-1002 fulfillment'],
            [4, 'manual_restock', 20, 0, 20, 'Initial supplier batch arrival'],
            [4, 'order_deduction', -2, 20, 18, 'Orders #ORD-2026-1003 & 1005'],
            [6, 'order_deduction', -1, 13, 12, 'Order #ORD-2026-1004 fulfillment']
        ];
        for (const log of logs) {
            await query(`
                INSERT INTO inventory_logs (product_id, change_type, quantity_changed, previous_stock, new_stock, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            `, log);
        }

        // Seed Purchase Orders
        const pos = [
            ['PO-2026-801', 2, 1, 50, 'ordered'],
            ['PO-2026-802', 1, 3, 25, 'in_transit'],
            ['PO-2026-803', 4, 8, 30, 'ordered']
        ];
        for (const po of pos) {
            await query(`
                INSERT INTO purchase_orders (po_number, supplier_id, product_id, quantity, status)
                VALUES (?, ?, ?, ?, ?)
            `, po);
        }

        console.log('[Database] Seed data successfully populated!');
    }
};

const initDB = async () => {
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
    console.log(`[Database] Attempting MySQL connection to ${DB_HOST || 'localhost'}:${DB_PORT || 3306}...`);

    try {
        // Try connecting to MySQL server directly
        const rawConnection = await mysql.createConnection({
            host: DB_HOST || 'localhost',
            port: Number(DB_PORT) || 3306,
            user: DB_USER || 'root',
            password: DB_PASSWORD || '',
            connectTimeout: 2000
        });

        // Ensure database exists
        await rawConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME || 'inventory_ecommerce_db'}\`;`);
        await rawConnection.end();

        // Create connection pool
        mysqlPool = mysql.createPool({
            host: DB_HOST || 'localhost',
            port: Number(DB_PORT) || 3306,
            user: DB_USER || 'root',
            password: DB_PASSWORD || '',
            database: DB_NAME || 'inventory_ecommerce_db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Test connection
        await mysqlPool.query('SELECT 1');
        dbType = 'mysql';
        console.log(`[Database] Successfully connected to MySQL database: ${DB_NAME || 'inventory_ecommerce_db'}`);
        await createTablesAndSeed();
    } catch (err) {
        console.warn(`[Database] MySQL connection failed (${err.code || err.message}).`);
        console.log('[Database] Initiating SQLite database so the application runs without interruption...');
        await initSQLite();
    }
};

const getDbType = () => dbType;

module.exports = {
    initDB,
    query,
    getDbType
};
