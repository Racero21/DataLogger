import React, { useEffect, useState } from 'react';
import { Box, TextField } from '@mui/material';
import { useAuth } from './auth/AuthProvider';

function Login() {
    const [input, setInput] = useState({
        username: "",
        password: "",
    });

    const auth = useAuth();
    const handleSubmit = ((e) => {
        console.log(input.username)
        console.log(input.password)
        e.preventDefault();
        if(input.username !== "" && input.password !== "") {
            auth.loginAction(input);
            return;
        }
        alert("please provide a valid input");
        console.log("API calls POST")
    });

    const handleInput = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setInput((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

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

                <button type='submit'>LOGIN</button>

            </form>
        </Box>
    );
}

export default Login;
