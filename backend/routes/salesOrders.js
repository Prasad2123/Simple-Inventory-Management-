// routes/salesOrders.js
// GET  /api/sales-orders    → list all
// POST /api/sales-orders    → create with items

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all sales orders with customer name
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT so.sales_id, so.date, so.status,
                    c.name AS customer_name, c.customer_id
             FROM SALES_ORDER so
             LEFT JOIN CUSTOMER c ON so.customer_id = c.customer_id
             ORDER BY so.sales_id DESC`
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET single sales order with items
router.get('/:id', async (req, res) => {
    try {
        const [order] = await db.query(
            `SELECT so.*, c.name AS customer_name
             FROM SALES_ORDER so
             LEFT JOIN CUSTOMER c ON so.customer_id = c.customer_id
             WHERE so.sales_id = ?`, [req.params.id]
        );
        if (order.length === 0) return res.status(404).json({ error: 'Order not found.' });

        const [items] = await db.query(
            `SELECT soi.*, p.name AS product_name
             FROM SALES_ORDER_ITEM soi
             JOIN PRODUCT p ON soi.product_id = p.product_id
             WHERE soi.sales_id = ?`, [req.params.id]
        );

        res.json({ ...order[0], items });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST create sales order
// Body: { customer_id, date, status, items: [{product_id, quantity, price}] }
router.post('/', async (req, res) => {
    const { customer_id, date, status, items } = req.body;
    if (!customer_id || !date || !items || items.length === 0) {
        return res.status(400).json({ error: 'customer_id, date, and items are required.' });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // Insert sales order header
        const [result] = await conn.query(
            'INSERT INTO SALES_ORDER (customer_id, date, status) VALUES (?,?,?)',
            [customer_id, date, status || 'Pending']
        );
        const salesId = result.insertId;

        // Insert each line item
        for (const item of items) {
            await conn.query(
                'INSERT INTO SALES_ORDER_ITEM (sales_id, product_id, quantity, price) VALUES (?,?,?,?)',
                [salesId, item.product_id, item.quantity, item.price]
            );
        }

        await conn.commit();
        res.status(201).json({ message: 'Sales order created.', sales_id: salesId });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

module.exports = router;
