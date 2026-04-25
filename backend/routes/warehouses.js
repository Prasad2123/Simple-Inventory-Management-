// routes/warehouses.js - CRUD for Warehouses
const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM WAREHOUSE ORDER BY warehouse_id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
    const { name, location } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });
    try {
        const [result] = await db.query('INSERT INTO WAREHOUSE (name, location) VALUES (?,?)', [name, location || '']);
        res.status(201).json({ message: 'Warehouse created.', warehouse_id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
    const { name, location } = req.body;
    try {
        await db.query('UPDATE WAREHOUSE SET name=?, location=? WHERE warehouse_id=?', [name, location, req.params.id]);
        res.json({ message: 'Warehouse updated.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM WAREHOUSE WHERE warehouse_id=?', [req.params.id]);
        res.json({ message: 'Warehouse deleted.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
