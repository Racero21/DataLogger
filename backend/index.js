const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const { createHash } = require('crypto');

// Load secrets
require('dotenv').config()

// Create an Express app
const app = express();

const salt = process.env.SECRET;
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

// DATA ENDPOINTS - GET

app.get('/api/logger/:id?', (req, res) => {
    let query = 'SELECT * FROM datalogger ORDER BY Name ASC';
    const loggerId = req.params.id;
    if(loggerId) query = `SELECT * FROM datalogger WHERE LoggerId = ${loggerId}`; 
    pool.query(query, (error, results) => {
        console.log(query)
        if(error) {
            return res.status(500).json({error: `Failed to fetch data: ${error.message}`});
        }
        res.json(results)
    });
});

app.get('/api/flow_log/:id?', (req, res) => {
    const LoggerId = req.params.id;
    if (LoggerId) {
        query = `SELECT * FROM flow_log WHERE LoggerId = ${LoggerId} ORDER BY LogTime ASC`
    }
    else return res.status(500).json({error: `Error`});
    // console.log(query)
    pool.query(query, (error, results) => {
        if(error) {
            return res.status(500).json({error: `Failed to fetch data: ${error.message}`});
        }
        res.json(results)
    });
});

app.get('/api/pressure_log/:id?', (req, res) => {
    const LoggerId = req.params.id;
    if (LoggerId) {
        query = `SELECT * FROM pressure_log WHERE LoggerId = ${LoggerId} ORDER BY LogTime ASC`
    }
    else return res.status(500).json({error: `Error`});
    // console.log(query)
    pool.query(query, (error, results) => {
        if(error) {
            return res.status(500).json({error: `Failed to fetch data: ${error.message}`});
        }
        res.json(results)
    });
});

app.get('/api/latest_log/flow/:id?', (req, res) => {
    let query = 'SELECT * FROM latest_flow_log '
    const LoggerId = req.params.id;
    if(LoggerId) query += `WHERE LoggerId = ${LoggerId}`
    // console.log(req.params.id)
    pool.query(query, (error, results) => {
        if(error){
            return res.status(500).json({error: `Failed to fetch data: ${error.message}`})
        }
        res.json(results)
    })
})

app.get('/api/latest_log/pressure/:id?', (req, res) => {
    let query = 'SELECT * FROM latest_pressure_log '
    const LoggerId = req.params.id;
    if(LoggerId) query += `WHERE LoggerId =${LoggerId}`
    // console.log(query)
    pool.query(query, (error, results) => {
        if(error){
            return res.status(500).json({error: `Failed to fetch data: ${error.message}`})
        }
        res.json(results)
    })
})

app.get('/api/totalizer/:id?', (req, res) =>{
    const LoggerId = req.params.id;
    if(!LoggerId) return res.status(500).json({error: `No Logger ID given`});
    let query = `SELECT * FROM totalizer WHERE LoggerId =${mysql.escape(LoggerId)} ORDER BY LastUpdated DESC LIMIT 1`
    pool.query(query, (error, results) => {
        if(error){
            return res.status(500).json({error: `Failed to fetch data ${error.message}`})
        }
        res.json(results)
    })
})

// DATA ENDPOINTS - UPDATE

app.patch('/api/logger_limits/:id', (req, res) => {
    // let query = 'SELECT * FROM latest_log'
    const LoggerId = req.params.id
    const VoltageLimit = req.body.VoltageLimit
    const FlowLimit = req.body.FlowLimit
    const PressureLimit = req.body.PressureLimit

    let query = "UPDATE datalogger SET"
    if(VoltageLimit) query += ` VoltageLimit = "${VoltageLimit}",`
    if(FlowLimit) query += ` FlowLimit = "${FlowLimit}",`
    if(PressureLimit) query += ` PressureLimit = "${PressureLimit}"`
    if(!(VoltageLimit || PressureLimit || FlowLimit)){
        console.log("No change")
        return
    }
    query = query.slice(-1) == ',' ? query.slice(0,-1) : query
    // console.log(`query: ${query} query.slice(-1): ${query.slice(-1)}`)
    query += ` WHERE LoggerId = ${LoggerId}`
    console.log(query)

    pool.query(query, (error, results) => {
        if(error){
            return res.status(500).json({error: `Failed to fetch data: ${error.message}`})
        }
        res.json(results)
        console.log(`Logger ${LoggerId} limits changed! (${VoltageLimit} - ${FlowLimit} - ${PressureLimit})`)
        // console.log(query)
    })
})

// AUTHENTICATION ENDPOINTS

app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    const hash = createHash('sha256').update(password + salt).digest('hex');
    console.log("login:" + hash);
    // Query database to validate user credentials
    const query = 'SELECT * FROM user WHERE username = ? AND password = ?';
    pool.query(query, [username, hash], async (error, results) => {
        if (error) {
            return res.status(500).json({ error: `Failed to authenticate: ${error.message}` });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ username: results[0].username }, process.env.SECRET, { expiresIn: '1d' });

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

app.post('/auth/register', (req, res) => {
    const { username, password } = req.body;
    hash = createHash('sha256').update(password + salt).digest('hex');
    console.log("register:" + hash);
    // Query database to validate user credentials
    const query = 'INSERT INTO user (username, password) VALUES (?, ?)';

    pool.query(query, [username, hash], (error, results) => {
        if (error) {
            return res.status(500).json({ error: `Failed to authenticate: ${error.message}` });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        // Return user data and token
        res.json({
            data: {
                message: "Successfully added user"
            },
        });
    });
});

app.get('/api/user', (req, res) => {
    const query = 'SELECT username FROM user ORDER BY username ASC';
    pool.query(query, (error, results) => {
        if(error) {
            return res.status(500).json({error: `Failed to fetch data: ${error.message}`});
        }
        res.json(results)
    });
});

app.delete('/api/remove/:username?', (req, res) => {
    const username = req.params.username;

    const query = 'DELETE FROM user WHERE username = ?'
    pool.query(query, [username], (error, results) => {
        if (error) {
            return res.status(500).json({error: `Failed to delete data: ${error.message}`})
        }
        res.json({
            data: {
                message: 'Successfully deleted user'
            }
        })
    })
})


// Start the server on port 3001
app.listen(process.env.DB_PORT, () => {
    console.log(`Server is running on http://${process.env.DB_HOST}:${process.env.DB_PORT}`);
});