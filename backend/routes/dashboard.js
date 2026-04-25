// routes/dashboard.js - Summary counts for the dashboard
// GET /api/dashboard

const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
    try {
        // Run all count queries in parallel for speed
        const [
            [products],
            [categories],
            [suppliers],
            [customers],
            [purchaseOrders],
            [salesOrders],
            [invoices],
            [payments]
        ] = await Promise.all([
            db.query('SELECT COUNT(*) AS count FROM PRODUCT'),
            db.query('SELECT COUNT(*) AS count FROM CATEGORY'),
            db.query('SELECT COUNT(*) AS count FROM SUPPLIER'),
            db.query('SELECT COUNT(*) AS count FROM CUSTOMER'),
            db.query('SELECT COUNT(*) AS count FROM PURCHASE_ORDER'),
            db.query('SELECT COUNT(*) AS count FROM SALES_ORDER'),
            db.query('SELECT COUNT(*) AS count FROM INVOICE'),
            db.query('SELECT COALESCE(SUM(amount), 0) AS total FROM PAYMENT')
        ]);

        res.json({
            products:       products[0].count,
            categories:     categories[0].count,
            suppliers:      suppliers[0].count,
            customers:      customers[0].count,
            purchaseOrders: purchaseOrders[0].count,
            salesOrders:    salesOrders[0].count,
            invoices:       invoices[0].count,
            totalPayments:  payments[0].total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
