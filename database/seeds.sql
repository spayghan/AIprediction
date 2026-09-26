-- ======================================================
-- E-Commerce Inventory & Order Management System Seed Data
-- ======================================================

USE inventory_ecommerce_db;

-- Clear previous data in order
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE inventory_logs;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE products;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users (Admin and Customers)
-- Default password for both is 'admin123' / 'customer123' (bcrypt hashed: $2b$10$epR33/k4.Q6J1fF0nB1CDeV8i46m3Qn1K9Oln3PzL7iX89wMhG3iG or seeded via backend setup)
INSERT INTO users (id, name, email, password, role, phone, address) VALUES
(1, 'E-Commerce Admin', 'admin@ecommerce.com', '$2b$10$epR33/k4.Q6J1fF0nB1CDeV8i46m3Qn1K9Oln3PzL7iX89wMhG3iG', 'admin', '+1-555-0199', 'Enterprise Logistics Hub, Warehouse 4B, Chicago, IL'),
(2, 'Alex Customer', 'customer@ecommerce.com', '$2b$10$epR33/k4.Q6J1fF0nB1CDeV8i46m3Qn1K9Oln3PzL7iX89wMhG3iG', 'customer', '+1-555-0144', '742 Evergreen Terrace, Springfield, OR 97477'),
(3, 'Sarah Connor', 'sarah@ecommerce.com', '$2b$10$epR33/k4.Q6J1fF0nB1CDeV8i46m3Qn1K9Oln3PzL7iX89wMhG3iG', 'customer', '+1-555-0182', '1204 Sunburst Way, Austin, TX 78701');

-- 2. Categories
INSERT INTO categories (id, name, description) VALUES
(1, 'Audio & Sound', 'High-fidelity headphones, earbuds, studio monitors, and portable speakers'),
(2, 'Computing & Tech', 'Laptops, ultra-wide monitors, mechanical keyboards, and precision mice'),
(3, 'Wearables & IoT', 'Smartwatches, fitness bands, and connected health trackers'),
(4, 'Smart Home', 'Smart ambient lighting, wireless security cameras, and voice hubs'),
(5, 'Photography & Video', 'Mirrorless 4K cameras, stabilizers, and studio lighting equipment');

-- 3. Suppliers
INSERT INTO suppliers (id, name, contact_email, phone, lead_time_days, reliability_score, address) VALUES
(1, 'Apex Silicon Global', 'procurement@apexsilicon.com', '+1-800-555-9011', 4, 4.85, '100 Innovation Way, San Jose, CA'),
(2, 'SonicWave Acoustics Ltd', 'orders@sonicwave.com', '+1-800-555-8822', 6, 4.60, '45 Audio Park, Boston, MA'),
(3, 'Nordic Ergonomics Corp', 'b2b@nordic-ergo.com', '+1-800-555-7733', 5, 4.90, '82 Design Boulevard, Seattle, WA'),
(4, 'Lumina Smart Systems', 'sales@luminasmart.io', '+1-800-555-4499', 3, 4.75, '310 Tech Loop, Austin, TX');

-- 4. Products & Stock (Varied stocks: low stock, critical, healthy)
INSERT INTO products (id, sku, name, description, price, cost_price, category_id, supplier_id, image_url, stock_quantity, safety_stock_level, reorder_point, max_stock_capacity) VALUES
(1, 'SKU-AUD-01', 'AeroPulse ANC Pro Headphones', 'Wireless active noise-cancelling over-ear headphones with 40h battery life and spatial audio.', 249.99, 130.00, 1, 2, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 8, 15, 25, 150),
(2, 'SKU-AUD-02', 'TrueSonic Wireless Studio Buds', 'True wireless stereo earbuds with low-latency Bluetooth 5.3 and IPX7 water resistance.', 129.50, 65.00, 1, 2, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80', 42, 20, 30, 200),
(3, 'SKU-CMP-01', 'UltraWide 34-Inch Curved Display', '34-inch 144Hz WQHD 1ms curved gaming & productivity monitor with USB-C 90W power delivery.', 599.00, 340.00, 2, 1, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80', 5, 10, 18, 80),
(4, 'SKU-CMP-02', 'NovaMechanical Wireless Keyboard', 'Hot-swappable tactile mechanical keyboard with RGB backlighting and aircraft aluminum chassis.', 119.00, 52.00, 2, 3, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', 18, 15, 22, 120),
(5, 'SKU-CMP-03', 'ApexErgo Precision Wireless Mouse', 'Ergonomic hyper-fast scroll wheel mouse with 8K DPI sensor and multi-device bluetooth pairing.', 79.99, 38.00, 2, 3, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80', 64, 20, 25, 180),
(6, 'SKU-WRB-01', 'PulseFit Horizon Smartwatch 5', 'Sapphire glass smartwatch with continuous ECG, SpO2, GPS tracking, and titanium bezel.', 299.95, 160.00, 3, 1, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 12, 15, 25, 150),
(7, 'SKU-WRB-02', 'VibeBand Active Fitness Tracker', 'Slim fitness tracker with sleep stage analysis, heart rate alerts, and 14-day standby.', 49.99, 21.00, 3, 1, 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80', 85, 25, 35, 250),
(8, 'SKU-SMH-01', 'AuraBeam Smart Ambient Light Bar', 'Wi-Fi & Matter enabled gradient ambient illumination bar syncing with screen & voice assistants.', 89.00, 42.00, 4, 4, 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80', 6, 12, 20, 100),
(9, 'SKU-SMH-02', 'GuardEye 2K Wireless Security Cam', 'Solar-powered weatherproof outdoor smart camera with AI human detection and color night vision.', 149.00, 75.00, 4, 4, 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=800&q=80', 28, 15, 25, 120),
(10, 'SKU-CAM-01', 'LumixPro 4K Mirrorless Cinema Rig', 'Compact full-frame mirrorless digital camera with 10-bit 4K 60fps and dual native ISO.', 1399.00, 890.00, 5, 1, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 4, 6, 10, 40),
(11, 'SKU-AUD-03', 'BassForge 360 Portable Speaker', 'Rugged waterproof Bluetooth speaker with 360-degree sound, punchy bass, and power bank feature.', 99.95, 48.00, 1, 2, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80', 38, 15, 25, 160),
(12, 'SKU-CMP-04', 'ThunderDock 12-in-1 Dual 4K Hub', 'Thunderbolt 4 docking station with 100W PD charging, dual HDMI, and 2.5Gbps Ethernet.', 189.00, 95.00, 2, 1, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80', 14, 15, 20, 110);

-- 5. Orders History (Simulating past days and weeks for DS analytics)
INSERT INTO orders (id, order_number, user_id, total_amount, status, shipping_address, payment_method, payment_status, created_at) VALUES
(1, 'ORD-2026-1001', 2, 379.49, 'delivered', '742 Evergreen Terrace, Springfield, OR 97477', 'Credit Card', 'paid', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(2, 'ORD-2026-1002', 3, 599.00, 'delivered', '1204 Sunburst Way, Austin, TX 78701', 'PayPal', 'paid', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(3, 'ORD-2026-1003', 2, 198.99, 'delivered', '742 Evergreen Terrace, Springfield, OR 97477', 'Credit Card', 'paid', DATE_SUB(NOW(), INTERVAL 11 DAY)),
(4, 'ORD-2026-1004', 3, 448.95, 'shipped', '1204 Sunburst Way, Austin, TX 78701', 'Apple Pay', 'paid', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(5, 'ORD-2026-1005', 2, 119.00, 'processing', '742 Evergreen Terrace, Springfield, OR 97477', 'Credit Card', 'paid', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(6, 'ORD-2026-1006', 3, 249.99, 'pending', '1204 Sunburst Way, Austin, TX 78701', 'Credit Card', 'paid', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 6. Order Items
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 1, 1, 1, 249.99, 249.99),
(2, 1, 2, 1, 129.50, 129.50),
(3, 2, 3, 1, 599.00, 599.00),
(4, 3, 4, 1, 119.00, 119.00),
(5, 3, 5, 1, 79.99, 79.99),
(6, 4, 6, 1, 299.95, 299.95),
(7, 4, 9, 1, 149.00, 149.00),
(8, 5, 4, 1, 119.00, 119.00),
(9, 6, 1, 1, 249.99, 249.99);

-- 7. Inventory Logs
INSERT INTO inventory_logs (product_id, change_type, quantity_changed, previous_stock, new_stock, notes, created_at) VALUES
(1, 'order_deduction', -1, 9, 8, 'Order #ORD-2026-1006 fulfillment', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'order_deduction', -1, 6, 5, 'Order #ORD-2026-1002 fulfillment', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(4, 'manual_restock', 20, 0, 20, 'Initial supplier batch arrival', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(4, 'order_deduction', -2, 20, 18, 'Orders #ORD-2026-1003 & 1005', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(6, 'order_deduction', -1, 13, 12, 'Order #ORD-2026-1004 fulfillment', DATE_SUB(NOW(), INTERVAL 7 DAY));

-- 8. Purchase Orders
INSERT INTO purchase_orders (po_number, supplier_id, product_id, quantity, status, expected_delivery_date) VALUES
('PO-2026-801', 2, 1, 50, 'ordered', DATE_ADD(CURDATE(), INTERVAL 4 DAY)),
('PO-2026-802', 1, 3, 25, 'in_transit', DATE_ADD(CURDATE(), INTERVAL 2 DAY)),
('PO-2026-803', 4, 8, 30, 'ordered', DATE_ADD(CURDATE(), INTERVAL 3 DAY));
