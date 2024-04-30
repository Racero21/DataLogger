import React from 'react';
import { Box, TextField } from '@mui/material';

function Login() {
    const handleSubmit = (() => {
        console.log("API calls POST")
    })

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
            <form onSubmit={handleSubmit()}>
                <TextField
                    type='text'
                    id='username'
                    label='Username'
                    variant='outlined'
                />
                
                <TextField
                    type='password'
                    id='password'
                    label='Password'
                    variant='outlined'
                />

                <button type='submit'>LOGIN</button>

            </form>
        </Box>
    );
}

export default Login;