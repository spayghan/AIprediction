# Database Directory - Inventory & Order Management System

This directory contains the database design, schema, and seed datasets for the **E-Commerce Inventory & Order Management System** with **AI/DS Inventory Analytics**.

## Schema Files
- `schema.sql`: Contains the complete relational schema with 8 normalized tables:
  1. `users`: Authentication for Customers and Admin
  2. `categories`: E-commerce catalog categorization
  3. `suppliers`: Supply chain partners with lead times and reliability ratings
  4. `products`: Inventory items with SKU, unit price, cost, current stock, safety stock, and dynamic reorder points
  5. `orders`: Customer e-commerce orders with shipping and payment status
  6. `order_items`: Detailed line items per order
  7. `inventory_logs`: Historical audit trail for inventory mutations (essential for AI/DS demand forecasting)
  8. `purchase_orders`: B2B procurement replenishment orders
- `seeds.sql`: Comprehensive seed dataset with realistic consumer electronics, stock levels, suppliers, and historical orders.
- `setup_mysql.bat`: One-click setup batch file for Windows.

## Quick MySQL Setup
Open terminal in this directory and execute:
```bash
mysql -u root -p < schema.sql
mysql -u root -p < seeds.sql
```
Or simply double-click `setup_mysql.bat`.

## Credentials Seeded:
- **Admin**:
  - Email: `admin@ecommerce.com`
  - Password: `admin123`
- **Customer**:
  - Email: `customer@ecommerce.com`
  - Password: `customer123`
