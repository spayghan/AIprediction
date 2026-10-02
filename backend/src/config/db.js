// const mysql = require('mysql2/promise');
// const sqlite3 = require('sqlite3').verbose();
// const path = require('path');
// const fs = require('fs');
// const bcrypt = require('bcryptjs');
// require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
// require('dotenv').config();

// let dbType = 'unknown'; // 'mysql' or 'sqlite'
// let mysqlPool = null;
// let sqliteDb = null;

// const query = async (sql, params = []) => {
//     if (dbType === 'mysql') {
//         return await mysqlPool.query(sql, params);
//     } else if (dbType === 'sqlite') {
//         return new Promise((resolve, reject) => {
//             const trimmed = sql.trim();
//             const isSelect = /^SELECT/i.test(trimmed) || /^PRAGMA/i.test(trimmed);

//             let adaptedSql = sql
//                 .replace(/NOW\(\)/gi, "datetime('now')")
//                 .replace(/CURDATE\(\)/gi, "date('now')")
//                 .replace(/DATE_SUB\(([^,]+),\s*INTERVAL\s*(\d+)\s*DAY\)/gi, "datetime($1, '-$2 days')")
//                 .replace(/DATE_ADD\(([^,]+),\s*INTERVAL\s*(\d+)\s*DAY\)/gi, "date($1, '+$2 days')");

//             if (isSelect) {
//                 sqliteDb.all(adaptedSql, params, (err, rows) => {
//                     if (err) return reject(err);
//                     resolve([rows, null]);
//                 });
//             } else {
//                 sqliteDb.run(adaptedSql, params, function (err) {
//                     if (err) return reject(err);
//                     resolve([{ insertId: this.lastID, affectedRows: this.changes }, null]);
//                 });
//             }
//         });
//     } else {
//         throw new Error('Database is not initialized yet');
//     }
// };

// const initDB = async () => {
//     const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
//     const host = DB_HOST || 'localhost';
//     const port = Number(DB_PORT) || 3306;
//     const user = DB_USER || 'root';
//     const password = DB_PASSWORD !== undefined ? DB_PASSWORD : '';
//     const database = DB_NAME || 'inventory_ecommerce_db';

//     console.log(`[Database] Connecting to MySQL Workbench (${user}@${host}:${port})...`);

//     try {
//         const rawConnection = await mysql.createConnection({
//             host,
//             port,
//             user,
//             password,
//             connectTimeout: 4000
//         });

//         await rawConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
//         await rawConnection.end();

//         // Establish Pool with stored procedure & multipleStatements capability
//         mysqlPool = mysql.createPool({
//             host,
//             port,
//             user,
//             password,
//             database,
//             waitForConnections: true,
//             connectionLimit: 15,
//             queueLimit: 0,
//             multipleStatements: true
//         });

//         await mysqlPool.query('SELECT 1');
//         dbType = 'mysql';

//         console.log(`====================================================`);
//         console.log(`  🟢 MySQL WORKBENCH 8 CONNECTED (PROCEDURES & TRIGGERS READY) `);
//         console.log(`  Database : ${database}                            `);
//         console.log(`====================================================`);
//     } catch (err) {
//         console.error(`❌ [MySQL Error]: ${err.code || err.message}`);
//         console.log(`[Database] Falling back to SQLite temporary database...\n`);

//         const dataDir = path.join(__dirname, '..', '..', 'data');
//         if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
//         const dbPath = path.join(dataDir, 'inventory_ecommerce.sqlite');

//         await new Promise((resolve, reject) => {
//             sqliteDb = new sqlite3.Database(dbPath, (sqErr) => {
//                 if (sqErr) return reject(sqErr);
//                 dbType = 'sqlite';
//                 resolve();
//             });
//         });
//     }
// };

// const getDbType = () => dbType;

// module.exports = {
//     initDB,
//     query,
//     getDbType
// };

const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config();

let dbType = 'unknown'; // 'mysql' or 'sqlite'
let mysqlPool = null;
let sqliteDb = null;

const query = async (sql, params = []) => {
    if (dbType === 'mysql') {
        return await mysqlPool.query(sql, params);
    } else if (dbType === 'sqlite') {
        return new Promise((resolve, reject) => {
            const trimmed = sql.trim();
            const isSelect = /^SELECT/i.test(trimmed) || /^PRAGMA/i.test(trimmed);

            let adaptedSql = sql
                .replace(/NOW\(\)/gi, "datetime('now')")
                .replace(/CURDATE\(\)/gi, "date('now')")
                .replace(/DATE_SUB\(([^,]+),\s*INTERVAL\s*(\d+)\s*DAY\)/gi, "datetime($1, '-$2 days')")
                .replace(/DATE_ADD\(([^,]+),\s*INTERVAL\s*(\d+)\s*DAY\)/gi, "date($1, '+$2 days')");

            if (isSelect) {
                sqliteDb.all(adaptedSql, params, (err, rows) => {
                    if (err) return reject(err);
                    resolve([rows, null]);
                });
            } else {
                sqliteDb.run(adaptedSql, params, function (err) {
                    if (err) return reject(err);
                    resolve([{ insertId: this.lastID, affectedRows: this.changes }, null]);
                });
            }
        });
    } else {
        throw new Error('Database is not initialized yet');
    }
};

const createTablesAndSeed = async () => {
    const isSqlite = dbType === 'sqlite';
    const autoInc = isSqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY';

    // 1. Users
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

    // 9. Demand Forecast (AI Storage)
    await query(`
        CREATE TABLE IF NOT EXISTS demand_forecast (
            id ${autoInc},
            product_id INT NOT NULL,
            forecast_date DATE NOT NULL,
            predicted_quantity INT NOT NULL DEFAULT 0,
            confidence_score DECIMAL(5,2) DEFAULT 85.00,
            horizon_days INT NOT NULL DEFAULT 30,
            model_version VARCHAR(50) NOT NULL DEFAULT 'v1.0.0',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (product_id, forecast_date)
        )
    `);

    // Check if initial seeding is required
    const [existingUsers] = await query('SELECT count(*) as count FROM users');
    const userCount = existingUsers[0].count;

    if (userCount === 0) {
        console.log(`[Database] Seeding initial data into ${dbType.toUpperCase()}...`);
        const adminHash = await bcrypt.hash('admin123', 10);
        const customerHash = await bcrypt.hash('customer123', 10);

        await query(
            'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
            ['E-Commerce Admin', 'admin@ecommerce.com', adminHash, 'admin', '+91-98765-43210', 'Warehouse Logistics Hub, Mumbai, India']
        );
        await query(
            'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
            ['Alex Customer', 'customer@ecommerce.com', customerHash, 'customer', '+91-98111-22334', '742 Evergreen Terrace, Springfield']
        );

        const categories = [
            ['Audio & Sound', 'High-fidelity headphones, earbuds, and speakers'],
            ['Computing & Tech', 'Laptops, monitors, and mechanical keyboards'],
            ['Wearables & IoT', 'Smartwatches, fitness bands, and trackers'],
            ['Smart Home', 'Ambient smart lighting and IoT security'],
            ['Photography & Video', 'Mirrorless 4K cameras and rig equipment']
        ];
        for (const cat of categories) {
            await query('INSERT INTO categories (name, description) VALUES (?, ?)', cat);
        }

        const suppliers = [
            ['Apex Silicon Global', 'procurement@apexsilicon.com', '+91-800-555-9011', 4, 4.85, '100 Innovation Way, Bangalore'],
            ['SonicWave Acoustics Ltd', 'orders@sonicwave.com', '+91-800-555-8822', 6, 4.60, '45 Audio Park, Pune'],
            ['Nordic Ergonomics Corp', 'b2b@nordic-ergo.com', '+91-800-555-7733', 5, 4.90, '82 Design Boulevard, Hyderabad'],
            ['Lumina Smart Systems', 'sales@luminasmart.io', '+91-800-555-4499', 3, 4.75, '310 Tech Loop, Delhi NCR']
        ];
        for (const sup of suppliers) {
            await query('INSERT INTO suppliers (name, contact_email, phone, lead_time_days, reliability_score, address) VALUES (?, ?, ?, ?, ?, ?)', sup);
        }

        const products = [
            ['SKU-AUD-01', 'AeroPulse ANC Pro Headphones', 'Wireless active noise-cancelling over-ear headphones with 40h battery life.', 19999.00, 11500.00, 1, 2, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 8, 15, 25, 150],
            ['SKU-AUD-02', 'TrueSonic Wireless Studio Buds', 'True wireless stereo earbuds with low-latency Bluetooth 5.3 and IPX7.', 9999.00, 5200.00, 1, 2, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80', 42, 20, 30, 200],
            ['SKU-CMP-01', 'UltraWide 34-Inch Curved Display', '34-inch 144Hz WQHD 1ms curved productivity monitor with 90W USB-C.', 49990.00, 31000.00, 2, 1, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80', 5, 10, 18, 80],
            ['SKU-CMP-02', 'NovaMechanical Wireless Keyboard', 'Hot-swappable tactile mechanical keyboard with RGB backlighting.', 8999.00, 4200.00, 2, 3, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', 18, 15, 22, 120],
            ['SKU-CMP-03', 'ApexErgo Precision Wireless Mouse', 'Ergonomic hyper-fast scroll wheel mouse with 8K DPI sensor.', 5999.00, 2900.00, 2, 3, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80', 64, 20, 25, 180],
            ['SKU-WRB-01', 'PulseFit Horizon Smartwatch 5', 'Sapphire glass smartwatch with continuous ECG, SpO2, and titanium bezel.', 24990.00, 14000.00, 3, 1, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 12, 15, 25, 150],
            ['SKU-WRB-02', 'VibeBand Active Fitness Tracker', 'Slim fitness tracker with sleep stage analysis and 14-day standby.', 3999.00, 1800.00, 3, 1, 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80', 85, 25, 35, 250],
            ['SKU-SMH-01', 'AuraBeam Smart Ambient Light Bar', 'Wi-Fi & Matter enabled gradient ambient illumination bar syncing with PC.', 6999.00, 3400.00, 4, 4, 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80', 6, 12, 20, 100],
            ['SKU-SMH-02', 'GuardEye 2K Wireless Security Cam', 'Solar-powered weatherproof outdoor smart camera with AI human detection.', 11999.00, 6200.00, 4, 4, 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=800&q=80', 28, 15, 25, 120],
            ['SKU-CAM-01', 'LumixPro 4K Mirrorless Cinema Rig', 'Compact full-frame mirrorless digital camera with 10-bit 4K 60fps.', 114990.00, 78000.00, 5, 1, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 4, 6, 10, 40]
        ];

        for (const prod of products) {
            await query(`
                INSERT INTO products (sku, name, description, price, cost_price, category_id, supplier_id, image_url, stock_quantity, safety_stock_level, reorder_point, max_stock_capacity)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, prod);
        }

        const orders = [
            ['ORD-2026-1001', 2, 29998.00, 'delivered', '742 Evergreen Terrace, Springfield', 'Credit Card', 'paid'],
            ['ORD-2026-1002', 2, 49990.00, 'delivered', '742 Evergreen Terrace, Springfield', 'UPI / Card', 'paid'],
            ['ORD-2026-1003', 2, 14998.00, 'shipped', '742 Evergreen Terrace, Springfield', 'Net Banking', 'paid'],
            ['ORD-2026-1004', 2, 8999.00, 'processing', '742 Evergreen Terrace, Springfield', 'Credit Card', 'paid'],
            ['ORD-2026-1005', 2, 24990.00, 'pending', '742 Evergreen Terrace, Springfield', 'Credit Card', 'paid']
        ];
        for (const ord of orders) {
            await query(`
                INSERT INTO orders (order_number, user_id, total_amount, status, shipping_address, payment_method, payment_status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, ord);
        }

        const orderItems = [
            [1, 1, 1, 19999.00, 19999.00],
            [1, 2, 1, 9999.00, 9999.00],
            [2, 3, 1, 49990.00, 49990.00],
            [3, 4, 1, 8999.00, 8999.00],
            [3, 5, 1, 5999.00, 5999.00],
            [4, 4, 1, 8999.00, 8999.00],
            [5, 6, 1, 24990.00, 24990.00]
        ];
        for (const item of orderItems) {
            await query(`
                INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
                VALUES (?, ?, ?, ?, ?)
            `, item);
        }

        console.log(`[Database] Initial datasets populated in ${dbType.toUpperCase()}!`);
    }
};

const initDB = async () => {
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
    const host = DB_HOST || 'localhost';
    const port = Number(DB_PORT) || 3306;
    const user = DB_USER || 'root';
    const password = DB_PASSWORD !== undefined ? DB_PASSWORD : '';
    const database = DB_NAME || 'inventory_ecommerce_db';

    console.log(`[Database] Connecting to MySQL Workbench (${user}@${host}:${port})...`);

    try {
        const rawConnection = await mysql.createConnection({
            host,
            port,
            user,
            password,
            connectTimeout: 4000
        });

        await rawConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await rawConnection.end();

        mysqlPool = mysql.createPool({
            host,
            port,
            user,
            password,
            database,
            waitForConnections: true,
            connectionLimit: 15,
            queueLimit: 0,
            multipleStatements: true
        });

        await mysqlPool.query('SELECT 1');
        dbType = 'mysql';

        console.log(`====================================================`);
        console.log(`  🟢 MySQL WORKBENCH 8 CONNECTED SUCCESSFULLY!      `);
        console.log(`  Database : ${database}                            `);
        console.log(`====================================================`);

        // Ensure tables exist and initial records are seeded on MySQL
        await createTablesAndSeed();
    } catch (err) {
        console.error(`❌ [MySQL Error]: ${err.code || err.message}`);
        console.log(`[Database] Falling back to SQLite temporary database...\n`);

        const dataDir = path.join(__dirname, '..', '..', 'data');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        const dbPath = path.join(dataDir, 'inventory_ecommerce.sqlite');

        await new Promise((resolve, reject) => {
            sqliteDb = new sqlite3.Database(dbPath, async (sqErr) => {
                if (sqErr) return reject(sqErr);
                dbType = 'sqlite';
                await createTablesAndSeed();
                resolve();
            });
        });
    }
};

const getDbType = () => dbType;

module.exports = {
    initDB,
    query,
    getDbType
};