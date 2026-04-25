// routes/suppliers.js - CRUD for Suppliers
const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM SUPPLIER ORDER BY supplier_id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM SUPPLIER WHERE supplier_id=?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Supplier not found.' });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
    const { name, contact } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });
    try {
        const [result] = await db.query('INSERT INTO SUPPLIER (name, contact) VALUES (?,?)', [name, contact || '']);
        res.status(201).json({ message: 'Supplier created.', supplier_id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
    const { name, contact } = req.body;
    try {
        await db.query('UPDATE SUPPLIER SET name=?, contact=? WHERE supplier_id=?', [name, contact, req.params.id]);
        res.json({ message: 'Supplier updated.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM SUPPLIER WHERE supplier_id=?', [req.params.id]);
        res.json({ message: 'Supplier deleted.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
