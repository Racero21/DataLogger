// import React from 'react';
import React, { useState } from 'react';
import InsightsIcon from '@mui/icons-material/Insights';
import MapIcon from '@mui/icons-material/Map';
import TuneIcon from '@mui/icons-material/Tune';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import { AppBar } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useAuth } from '../auth/AuthProvider';

export default function ToggleButtonsMultiple({ onChange, setSearchQuery }) {
  const auth= useAuth();
  const currentUser = localStorage.getItem("user");
  console.log(currentUser.toString())
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Box sx={{ flexGrow: 1, width:'100%', display: 'flex', justifyContent: 'center'}}>
      <AppBar position="static" style={{ zIndex: 1000 }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'inline-flex', justifyContent: 'flex-start' }}>
          <TextField
              sx={{backgroundColor: "white", borderRadius: '10px'}}
              id="search"
              label="Search"
              variant="outlined"
              margin='normal'
              onChange={handleSearchChange}
              // InputProps={{
              //   sx: { color: 'white' }, // Set text color to white
              //   style: { borderColor: 'white' } // Set outline color to white
              // }}
            />
          <Button color="inherit" onClick={() => onChange(null, 'statistics')}>
            <InsightsIcon sx={{ mr: 1 }} />
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => onChange(null, 'map')}>
            <MapIcon sx={{ mr: 1 }} />
            Map
          </Button>
          <Button color="inherit" onClick={() => onChange(null, 'config')}>
            <TuneIcon sx={{ mr: 1 }} />
            Config
          </Button>
          </Typography>
          {currentUser === "admin" ? <Button color='inherit' onClick={() => onChange(null, 'add')}>Create User</Button> : ''}
          <Button color="inherit" onClick={() => auth.logOut()}><SettingsIcon />Logout</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
