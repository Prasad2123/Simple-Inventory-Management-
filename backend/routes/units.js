// routes/units.js - CRUD for Units
const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM UNIT ORDER BY unit_id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });
    try {
        const [result] = await db.query('INSERT INTO UNIT (name) VALUES (?)', [name]);
        res.status(201).json({ message: 'Unit created.', unit_id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
    const { name } = req.body;
    try {
        await db.query('UPDATE UNIT SET name=? WHERE unit_id=?', [name, req.params.id]);
        res.json({ message: 'Unit updated.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM UNIT WHERE unit_id=?', [req.params.id]);
        res.json({ message: 'Unit deleted.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
