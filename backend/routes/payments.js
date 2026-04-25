// routes/payments.js
// GET  /api/payments    → list all payments
// POST /api/payments    → record a payment against an invoice

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all payments with invoice and customer info
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT p.payment_id, p.amount, p.method, p.date,
                    i.invoice_id, i.total_amount,
                    c.name AS customer_name
             FROM PAYMENT p
             JOIN INVOICE     i  ON p.invoice_id  = i.invoice_id
             JOIN SALES_ORDER so ON i.sales_id     = so.sales_id
             JOIN CUSTOMER    c  ON so.customer_id = c.customer_id
             ORDER BY p.payment_id DESC`
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST record payment
// Body: { invoice_id, amount, method, date }
router.post('/', async (req, res) => {
    const { invoice_id, amount, method, date } = req.body;
    if (!invoice_id || !amount || !date) {
        return res.status(400).json({ error: 'invoice_id, amount, and date are required.' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO PAYMENT (invoice_id, amount, method, date) VALUES (?,?,?,?)',
            [invoice_id, amount, method || 'Cash', date]
        );
        res.status(201).json({ message: 'Payment recorded.', payment_id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
