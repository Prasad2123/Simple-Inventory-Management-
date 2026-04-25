// routes/invoices.js
// GET  /api/invoices        → list all invoices
// POST /api/invoices        → generate invoice from a sales order

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all invoices with customer info via JOIN
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT i.invoice_id, i.total_amount, i.date,
                    so.sales_id, c.name AS customer_name
             FROM INVOICE i
             JOIN SALES_ORDER so ON i.sales_id = so.sales_id
             JOIN CUSTOMER    c  ON so.customer_id = c.customer_id
             ORDER BY i.invoice_id DESC`
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET single invoice with line items
router.get('/:id', async (req, res) => {
    try {
        const [inv] = await db.query(
            `SELECT i.*, c.name AS customer_name, c.contact
             FROM INVOICE i
             JOIN SALES_ORDER so ON i.sales_id = so.sales_id
             JOIN CUSTOMER c     ON so.customer_id = c.customer_id
             WHERE i.invoice_id = ?`, [req.params.id]
        );
        if (inv.length === 0) return res.status(404).json({ error: 'Invoice not found.' });

        const [items] = await db.query(
            `SELECT soi.*, p.name AS product_name
             FROM SALES_ORDER_ITEM soi
             JOIN PRODUCT p ON soi.product_id = p.product_id
             WHERE soi.sales_id = ?`, [inv[0].sales_id]
        );

        res.json({ ...inv[0], items });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST generate invoice
// Body: { sales_id, date }
// Auto-calculates total from SALES_ORDER_ITEM
router.post('/', async (req, res) => {
    const { sales_id, date } = req.body;
    if (!sales_id || !date) return res.status(400).json({ error: 'sales_id and date are required.' });

    try {
        // Check if invoice already exists for this sales order
        const [existing] = await db.query('SELECT invoice_id FROM INVOICE WHERE sales_id=?', [sales_id]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Invoice already generated for this sales order.' });
        }

        // Calculate total from order items
        const [totals] = await db.query(
            'SELECT SUM(quantity * price) AS total FROM SALES_ORDER_ITEM WHERE sales_id=?', [sales_id]
        );
        const total = totals[0].total || 0;

        const [result] = await db.query(
            'INSERT INTO INVOICE (sales_id, total_amount, date) VALUES (?,?,?)',
            [sales_id, total, date]
        );
        res.status(201).json({ message: 'Invoice generated.', invoice_id: result.insertId, total_amount: total });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
