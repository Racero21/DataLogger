import React, { useEffect, useState } from 'react';
import { Box, TextField } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';

const pollInterval = 1000

function AddUser() {
    const [input, setInput] = useState({
        username: "",
        password: "",
    });

    const [users, setUsers] = useState([]);

    // const auth = useAuth();
    const handleSubmit = (async (e) => {
        console.log(input.username)
        console.log(input.password)
        e.preventDefault();
        if(input.username !== "" && input.password !== "") {
            // auth.loginAction(input);
            try {
                const response = await fetch(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/auth/register`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(input),
                });
                const res = await response.json();
                if (res.data) {
                  alert('user added successfully')
                  return;
                }
                throw new Error("Invalid username or password");
              } catch (err) {
                alert(err)
                console.error(err);
              }
            return;
        }
        alert("please provide a valid input");
    });

    const handleInput = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setInput((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDelete= async (username) => {
        const response = await axios.delete(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/remove/`+ username)
        // const res = response.json();
        if(response.data) {
            alert("User deleted successfully")
        }
        else alert('err')
        return ;
    }

    useEffect(() => {
        let dataTimeout = null;
        const fetchData = async(init) => {
            const userResponse = await  axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/user`)
            setUsers(userResponse.data)
        if(!init) dataTimeout = setTimeout(fetchData, pollInterval)
        }
        fetchData(true)
        dataTimeout = setTimeout(fetchData,pollInterval)
        return () => clearTimeout(dataTimeout)
    }, []);

    return (
        <Box sx={{
            boxSizing: 'border-box', 
            width: '20%',
            height: '100%', 
            display: 'inline', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            border: '2px solid white', 
            flexWrap: 'wrap'
        }}>
            <form onSubmit={handleSubmit}>
                <div>
                    <TextField
                        name='username'
                        type='text'
                        id='username'
                        label='Username'
                        variant='outlined'
                        onChange={handleInput}
                    />
                </div>
                
                <div>
                    <TextField
                        name='password'
                        type='password'
                        id='password'
                        label='Password'
                        variant='outlined'
                        onChange={handleInput}
                    />
                </div>

                <button type='submit'>Add</button>

            </form>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 'inherit' }} aria-label="simple table">
                    <TableHead>
                    <TableRow>
                        <TableCell align="center" sx={{fontWeight:'bold'}}>Username</TableCell>
                        <TableCell align="center" sx={{fontWeight:'bold'}}></TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {users.map((row) => (
                        <TableRow
                        key={row.Name}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                        <TableCell align="right">{row.username}</TableCell>
                        <TableCell align="right"><button onClick={() => handleDelete(row.username)}>delete</button></TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default AddUser;
