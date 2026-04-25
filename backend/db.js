// db.js - MySQL connection pool
// All routes import this to query the database

const mysql = require('mysql2');

// Create a connection pool (more efficient than single connection)
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',          // Change to your MySQL username
    password: 'Prasad@21',      // Change to your MySQL password
    database: 'inventory_db',
    waitForConnections: true,
    connectionLimit: 10,   // Max 10 simultaneous connections
    queueLimit: 0
});

// Export promise-based pool so we can use async/await in routes
module.exports = pool.promise();
