// routes/customers.js - CRUD for Customers
const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM CUSTOMER ORDER BY customer_id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM CUSTOMER WHERE customer_id=?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Customer not found.' });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
    const { name, contact } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });
    try {
        const [result] = await db.query('INSERT INTO CUSTOMER (name, contact) VALUES (?,?)', [name, contact || '']);
        res.status(201).json({ message: 'Customer created.', customer_id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
    const { name, contact } = req.body;
    try {
        await db.query('UPDATE CUSTOMER SET name=?, contact=? WHERE customer_id=?', [name, contact, req.params.id]);
        res.json({ message: 'Customer updated.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM CUSTOMER WHERE customer_id=?', [req.params.id]);
        res.json({ message: 'Customer deleted.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
