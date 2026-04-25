// routes/products.js - Full CRUD for Products
// GET    /api/products         → list all
// GET    /api/products/:id     → get one
// POST   /api/products         → create
// PUT    /api/products/:id     → update
// DELETE /api/products/:id     → delete

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all products (with category, brand, unit names via JOIN)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT p.product_id, p.name, p.description, p.price,
                    c.name AS category, b.name AS brand, u.name AS unit,
                    p.category_id, p.brand_id, p.unit_id
             FROM PRODUCT p
             LEFT JOIN CATEGORY c ON p.category_id = c.category_id
             LEFT JOIN BRAND    b ON p.brand_id    = b.brand_id
             LEFT JOIN UNIT     u ON p.unit_id     = u.unit_id
             ORDER BY p.product_id DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM PRODUCT WHERE product_id = ?', [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Product not found.' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create new product
router.post('/', async (req, res) => {
    const { name, description, price, category_id, brand_id, unit_id } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'Name and price are required.' });
    try {
        const [result] = await db.query(
            'INSERT INTO PRODUCT (name, description, price, category_id, brand_id, unit_id) VALUES (?,?,?,?,?,?)',
            [name, description || '', price, category_id || null, brand_id || null, unit_id || null]
        );
        res.status(201).json({ message: 'Product created.', product_id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update product
router.put('/:id', async (req, res) => {
    const { name, description, price, category_id, brand_id, unit_id } = req.body;
    try {
        await db.query(
            'UPDATE PRODUCT SET name=?, description=?, price=?, category_id=?, brand_id=?, unit_id=? WHERE product_id=?',
            [name, description, price, category_id || null, brand_id || null, unit_id || null, req.params.id]
        );
        res.json({ message: 'Product updated.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE product
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM PRODUCT WHERE product_id = ?', [req.params.id]);
        res.json({ message: 'Product deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
