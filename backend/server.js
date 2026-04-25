// server.js - Main entry point for the backend
// Run with: node server.js

const express = require('express');
const cors    = require('cors');
const app     = express();
const PORT    = 3000;

// ── Middleware ────────────────────────────────────────────
app.use(cors());                        // Allow requests from the frontend
app.use(express.json());                // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',            require('./routes/auth'));
app.use('/api/dashboard',       require('./routes/dashboard'));
app.use('/api/products',        require('./routes/products'));
app.use('/api/categories',      require('./routes/categories'));
app.use('/api/brands',          require('./routes/brands'));
app.use('/api/units',           require('./routes/units'));
app.use('/api/suppliers',       require('./routes/suppliers'));
app.use('/api/customers',       require('./routes/customers'));
app.use('/api/warehouses',      require('./routes/warehouses'));
app.use('/api/purchase-orders', require('./routes/purchaseOrders'));
app.use('/api/sales-orders',    require('./routes/salesOrders'));
app.use('/api/invoices',        require('./routes/invoices'));
app.use('/api/payments',        require('./routes/payments'));

// ── Default route ─────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ message: 'Inventory Management System API is running.' });
});

// ── Start server ──────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
