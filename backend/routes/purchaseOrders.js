// routes/purchaseOrders.js
// GET  /api/purchase-orders      → list all purchase orders
// POST /api/purchase-orders      → create new purchase order with items

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all purchase orders with supplier name
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT po.purchase_id, po.date, po.status,
                    s.name AS supplier_name, s.supplier_id
             FROM PURCHASE_ORDER po
             LEFT JOIN SUPPLIER s ON po.supplier_id = s.supplier_id
             ORDER BY po.purchase_id DESC`
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET single purchase order with its items
router.get('/:id', async (req, res) => {
    try {
        const [order] = await db.query(
            `SELECT po.*, s.name AS supplier_name
             FROM PURCHASE_ORDER po
             LEFT JOIN SUPPLIER s ON po.supplier_id = s.supplier_id
             WHERE po.purchase_id = ?`, [req.params.id]
        );
        if (order.length === 0) return res.status(404).json({ error: 'Order not found.' });

        const [items] = await db.query(
            `SELECT poi.*, p.name AS product_name
             FROM PURCHASE_ORDER_ITEM poi
             JOIN PRODUCT p ON poi.product_id = p.product_id
             WHERE poi.purchase_id = ?`, [req.params.id]
        );

        res.json({ ...order[0], items });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST create purchase order
// Body: { supplier_id, date, status, items: [{product_id, quantity, price}] }
router.post('/', async (req, res) => {
    const { supplier_id, date, status, items } = req.body;
    if (!supplier_id || !date || !items || items.length === 0) {
        return res.status(400).json({ error: 'supplier_id, date, and items are required.' });
    }

    // Use a transaction so order + items are inserted together or not at all
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // Insert the purchase order header
        const [result] = await conn.query(
            'INSERT INTO PURCHASE_ORDER (supplier_id, date, status) VALUES (?,?,?)',
            [supplier_id, date, status || 'Pending']
        );
        const purchaseId = result.insertId;

        // Insert each line item
        for (const item of items) {
            await conn.query(
                'INSERT INTO PURCHASE_ORDER_ITEM (purchase_id, product_id, quantity, price) VALUES (?,?,?,?)',
                [purchaseId, item.product_id, item.quantity, item.price]
            );
        }

        await conn.commit();
        res.status(201).json({ message: 'Purchase order created.', purchase_id: purchaseId });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

module.exports = router;
