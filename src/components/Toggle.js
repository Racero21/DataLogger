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

export default function ToggleButtonsMultiple({ onChange, query }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    query(searchQuery);
    console.log(searchQuery);
  };

  // const filteredData = search.filter((item) =>
  //   item.LoggerId.toLowerCase().includes(searchQuery.toLowerCase()) || item.Name.toLowerCase().includes(searchQuery.toLowerCase())
  // );

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
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <TextField
              id="search"
              label="Search"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
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
          <Button color="inherit" onClick={() => onChange(null, 'settings')}><SettingsIcon />Settings</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
