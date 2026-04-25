-- ============================================================
-- INVENTORY MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Run this file in MySQL Workbench or MySQL CLI:
--   mysql -u root -p < database.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

-- --------------------------------------------------------
-- ROLE table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS ROLE (
    role_id   INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- --------------------------------------------------------
-- USER table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS USER (
    user_id  INT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    username VARCHAR(50)  NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,   -- plain text for simplicity
    role_id  INT,
    FOREIGN KEY (role_id) REFERENCES ROLE(role_id)
);

-- --------------------------------------------------------
-- CATEGORY table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS CATEGORY (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE
);

-- --------------------------------------------------------
-- BRAND table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS BRAND (
    brand_id INT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(100) NOT NULL UNIQUE
);

-- --------------------------------------------------------
-- UNIT table  (e.g. Kg, Litre, Piece)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS UNIT (
    unit_id INT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(50) NOT NULL UNIQUE
);

-- --------------------------------------------------------
-- PRODUCT table  (belongs to Category, Brand, Unit)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS PRODUCT (
    product_id  INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    price       DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    category_id INT,
    brand_id    INT,
    unit_id     INT,
    FOREIGN KEY (category_id) REFERENCES CATEGORY(category_id),
    FOREIGN KEY (brand_id)    REFERENCES BRAND(brand_id),
    FOREIGN KEY (unit_id)     REFERENCES UNIT(unit_id)
);

-- --------------------------------------------------------
-- SUPPLIER table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS SUPPLIER (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    contact     VARCHAR(100)
);

-- --------------------------------------------------------
-- CUSTOMER table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS CUSTOMER (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    contact     VARCHAR(100)
);

-- --------------------------------------------------------
-- WAREHOUSE table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS WAREHOUSE (
    warehouse_id INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(150) NOT NULL,
    location     VARCHAR(200)
);

-- --------------------------------------------------------
-- WAREHOUSE_PRODUCT  (junction: which products are in which warehouse)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS WAREHOUSE_PRODUCT (
    warehouse_id INT NOT NULL,
    product_id   INT NOT NULL,
    quantity     INT NOT NULL DEFAULT 0,
    PRIMARY KEY (warehouse_id, product_id),
    FOREIGN KEY (warehouse_id) REFERENCES WAREHOUSE(warehouse_id),
    FOREIGN KEY (product_id)   REFERENCES PRODUCT(product_id)
);

-- --------------------------------------------------------
-- PURCHASE_ORDER table  (Supplier supplies Purchase Orders)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS PURCHASE_ORDER (
    purchase_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT,
    date        DATE         NOT NULL,
    status      VARCHAR(50)  NOT NULL DEFAULT 'Pending',   -- Pending / Received
    FOREIGN KEY (supplier_id) REFERENCES SUPPLIER(supplier_id)
);

-- --------------------------------------------------------
-- PURCHASE_ORDER_ITEM  (order includes products)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS PURCHASE_ORDER_ITEM (
    item_id     INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    product_id  INT NOT NULL,
    quantity    INT            NOT NULL DEFAULT 1,
    price       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (purchase_id) REFERENCES PURCHASE_ORDER(purchase_id),
    FOREIGN KEY (product_id)  REFERENCES PRODUCT(product_id)
);

-- --------------------------------------------------------
-- SALES_ORDER table  (Customer places Sales Orders)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS SALES_ORDER (
    sales_id    INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    date        DATE         NOT NULL,
    status      VARCHAR(50)  NOT NULL DEFAULT 'Pending',   -- Pending / Shipped / Delivered
    FOREIGN KEY (customer_id) REFERENCES CUSTOMER(customer_id)
);

-- --------------------------------------------------------
-- SALES_ORDER_ITEM  (order includes products)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS SALES_ORDER_ITEM (
    item_id    INT AUTO_INCREMENT PRIMARY KEY,
    sales_id   INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT            NOT NULL DEFAULT 1,
    price      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (sales_id)   REFERENCES SALES_ORDER(sales_id),
    FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id)
);

-- --------------------------------------------------------
-- INVOICE table  (generated from Sales Order)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS INVOICE (
    invoice_id   INT AUTO_INCREMENT PRIMARY KEY,
    sales_id     INT UNIQUE,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    date         DATE          NOT NULL,
    FOREIGN KEY (sales_id) REFERENCES SALES_ORDER(sales_id)
);

-- --------------------------------------------------------
-- PAYMENT table  (linked to Invoice)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS PAYMENT (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT,
    amount     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    method     VARCHAR(50)   NOT NULL DEFAULT 'Cash',   -- Cash / Card / Online
    date       DATE          NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES INVOICE(invoice_id)
);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Roles
INSERT INTO ROLE (role_name) VALUES ('Admin'), ('Manager'), ('Staff');

-- Users  (password = plain text for demo)
INSERT INTO USER (name, username, password, role_id) VALUES
('Alice Admin',   'admin',   'admin123',   1),
('Bob Manager',   'manager', 'manager123', 2),
('Carol Staff',   'staff',   'staff123',   3);

-- Categories
INSERT INTO CATEGORY (name) VALUES
('Electronics'), ('Clothing'), ('Food & Beverages'), ('Office Supplies'), ('Tools');

-- Brands
INSERT INTO BRAND (name) VALUES
('Samsung'), ('Nike'), ('Nestle'), ('3M'), ('Bosch');

-- Units
INSERT INTO UNIT (name) VALUES
('Piece'), ('Kilogram'), ('Litre'), ('Box'), ('Pair');

-- Products
INSERT INTO PRODUCT (name, description, price, category_id, brand_id, unit_id) VALUES
('Smartphone X1',     'Android smartphone 128GB',  15000.00, 1, 1, 1),
('Running Shoes Pro', 'Lightweight running shoes',  3500.00, 2, 2, 5),
('Instant Coffee 1kg','Premium instant coffee',     800.00,  3, 3, 2),
('Sticky Notes Pack', '100 sheets per pack',        120.00,  4, 4, 4),
('Cordless Drill',    '18V cordless drill set',    4500.00,  5, 5, 1);

-- Suppliers
INSERT INTO SUPPLIER (name, contact) VALUES
('TechWholesale Ltd',    '9876543210'),
('FashionDist Co.',      '9123456780'),
('FoodSupply Inc.',      '9001234567'),
('OfficeGoods Traders',  '9812345678'),
('ToolsHub Depot',       '9087654321');

-- Customers
INSERT INTO CUSTOMER (name, contact) VALUES
('Ravi Kumar',   '9988776655'),
('Priya Sharma', '9977665544'),
('Amit Singh',   '9966554433'),
('Neha Gupta',   '9955443322'),
('Suresh Patel', '9944332211');

-- Warehouses
INSERT INTO WAREHOUSE (name, location) VALUES
('Main Warehouse',   'Mumbai, Maharashtra'),
('South Depot',      'Chennai, Tamil Nadu'),
('North Store',      'Delhi, NCR');

-- Warehouse stock
INSERT INTO WAREHOUSE_PRODUCT (warehouse_id, product_id, quantity) VALUES
(1, 1, 50), (1, 2, 30), (1, 3, 100),
(2, 4, 200),(2, 5, 40),
(3, 1, 20), (3, 3, 60);

-- Purchase Orders
INSERT INTO PURCHASE_ORDER (supplier_id, date, status) VALUES
(1, '2026-04-01', 'Received'),
(2, '2026-04-05', 'Pending'),
(3, '2026-04-10', 'Received');

-- Purchase Order Items
INSERT INTO PURCHASE_ORDER_ITEM (purchase_id, product_id, quantity, price) VALUES
(1, 1, 10, 14000.00),
(1, 5, 5,  4000.00),
(2, 2, 20, 3000.00),
(3, 3, 50,  750.00);

-- Sales Orders
INSERT INTO SALES_ORDER (customer_id, date, status) VALUES
(1, '2026-04-12', 'Delivered'),
(2, '2026-04-14', 'Shipped'),
(3, '2026-04-18', 'Pending');

-- Sales Order Items
INSERT INTO SALES_ORDER_ITEM (sales_id, product_id, quantity, price) VALUES
(1, 1, 2, 15000.00),
(1, 4, 5,   120.00),
(2, 2, 1,  3500.00),
(3, 3, 3,   800.00);

-- Invoices  (generated from Sales Orders)
INSERT INTO INVOICE (sales_id, total_amount, date) VALUES
(1, 30600.00, '2026-04-12'),
(2,  3500.00, '2026-04-14');

-- Payments
INSERT INTO PAYMENT (invoice_id, amount, method, date) VALUES
(1, 30600.00, 'Online', '2026-04-13'),
(2,  3500.00, 'Cash',   '2026-04-15');
