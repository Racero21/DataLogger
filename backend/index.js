const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

// Create an Express app
const app = express();

// Enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test_database',  // Replace with your database name
});


// Define an API endpoint to retrieve data from the database
app.get('/api/flow_logger', (req, res) => {
    const query = 'SELECT * FROM flow_logger';
    pool.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Failed to fetch data' });
        }
        res.json(results);
    });
});

app.get('/api/logger', (req, res) => {
    const query2 = 'SELECT DISTINCT LoggerId FROM flow_logger ORDER BY LoggerId ASC';
    pool.query(query2, (error, results) => {
        if(error) {
            return res.status(500).json({error: 'Failed to fetch data: {error.message}'});
        }
        res.json(results)
    });
});

// Start the server on port 3001
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
