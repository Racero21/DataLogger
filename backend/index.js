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
    const query = 'SELECT * FROM datalogger ORDER BY LoggerId ASC';
    pool.query(query, (error, results) => {
        if(error) {
            return res.status(500).json({error: 'Failed to fetch data: {error.message}'});
        }
        res.json(results)
    });
});

app.get('/api/timelogger', (req, res) => {
    const query = 'SELECT LogTime, AverageVoltage FROM flowmeter_log ORDER BY LogTime ASC';
    pool.query(query, (error, results) => {
        if(error) {
            return res.status(500).json({error: 'Failed to fetch data: {error.message}'});
        }
        res.json(results)
    });
});

app.get('/api/maplogger', (req, res) => {
    const query = 'SELECT LoggerId, Name, Latitude, Longitude FROM datalogger ORDER BY Name ASC';
    pool.query(query, (error, results) => {
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
            return res.status(500).json({error: `Failed to fetch data: ${error.message}`});
        }
        res.json(results)
    });
});

app.get('/api/latest_logs', (req, res) => {
    let query = 'SELECT * FROM latest_logs'
    pool.query(query, (error, results) => {
        if(error){
            return res.status(500).json({error: `Failed to fetch data: ${error.message}`})
        }
        res.json(results)
    })
})

app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;

    // Query database to validate user credentials
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    pool.query(query, [username, password], (error, results) => {
        if (error) {
            return res.status(500).json({ error: `Failed to authenticate: ${error.message}` });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Assuming you have a column named 'token' in your users table
        const token = results[0].token;

        // Return user data and token
        res.json({
            data: {
                user: {
                    id: results[0].id,
                    username: results[0].username,
                    email: results[0].email,
                },
                token: token,
            },
        });
    });
});

// Start the server on port 3001
app.listen(process.env.DB_PORT, () => {
    console.log(`Server is running on http://${process.env.DB_HOST}:${process.env.DB_PORT}`);
});
