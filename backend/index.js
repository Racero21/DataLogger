const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

// Load secrets
require('dotenv').config()

// Create an Express app
const app = express();

// Enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

app.get('/api/logger', (req, res) => {
    const query2 = 'SELECT LoggerId FROM datalogger ORDER BY LoggerId ASC';
    pool.query(query2, (error, results) => {
        if(error) {
            return res.status(500).json({error: 'Failed to fetch data: {error.message}'});
        }
        res.json(results)
    });
});

app.get('/api/timelogger', (req, res) => {
    const query2 = 'SELECT LogTime, AverageVoltage FROM flowmeter_log ORDER BY LogTime ASC';
    pool.query(query2, (error, results) => {
        if(error) {
            return res.status(500).json({error: 'Failed to fetch data: {error.message}'});
        }
        res.json(results)
    });
});

app.get('/api/flowmeter_log/:id?', (req, res) => {
    const LoggerId = req.params.id;
    let query = 'SELECT * FROM flowmeter_log ORDER BY LoggerId, LogTime ASC';

    if (LoggerId) {
        query = 'SELECT * FROM flowmeter_log WHERE LoggerId = ? ORDER BY LogTime ASC'
    }
    console.log(query)
    pool.query(query, LoggerId ? [LoggerId] : [], (error, results) => {
        if(error) {
            return res.status(500).json({error: 'Failed to fetch data: {error.message}'});
        }
        res.json(results)
    });
});

// Start the server on port 3001
app.listen(PORT, () => {
    console.log(`Server is running on http://${process.env.DB_HOST}:${process.env.DB_PORT}`);
});
