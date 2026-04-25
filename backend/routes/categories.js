// routes/categories.js - CRUD for Categories
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM CATEGORY ORDER BY category_id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST create
router.post('/', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });
    try {
        const [result] = await db.query('INSERT INTO CATEGORY (name) VALUES (?)', [name]);
        res.status(201).json({ message: 'Category created.', category_id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT update
router.put('/:id', async (req, res) => {
    const { name } = req.body;
    try {
        await db.query('UPDATE CATEGORY SET name=? WHERE category_id=?', [name, req.params.id]);
        res.json({ message: 'Category updated.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM CATEGORY WHERE category_id=?', [req.params.id]);
        res.json({ message: 'Category deleted.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
