// routes/auth.js - Login endpoint
// POST /api/auth/login  { username, password }

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        // Join USER with ROLE to get role name
        const [rows] = await db.query(
            `SELECT u.user_id, u.name, u.username, r.role_name
             FROM USER u
             LEFT JOIN ROLE r ON u.role_id = r.role_id
             WHERE u.username = ? AND u.password = ?`,
            [username, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // Return user info (no JWT needed - simple session via localStorage)
        res.json({ success: true, user: rows[0] });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
