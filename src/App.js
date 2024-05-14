import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';
import Logger from './components/Logger';
import Charts from './components/Chart';
import Pressure from './components/Pressure'
import ToggleButtonsMultiple from './components/Toggle';
import MyMap from './components/Map';
import { Box, Divider, Grid } from '@mui/material';
import Login from './Login';
import AuthProvider from './auth/AuthProvider';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PrivateRoute from './route/PrivateRoute';
import AddUser from './components/AddUser';

function App() {
  const [data, setData] = useState([]);
  // const [searchData, setSearchData]
  const [error, setError] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState('statistics');
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleChange = (event, newComponent) => {
    if (newComponent !== null) setSelectedComponent(newComponent);
  };

  const filteredData = data.filter((item) =>
    String(item.LoggerId).toLowerCase().includes(searchQuery.toLowerCase()) || item.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const RenderComponentWrapper = () => {
    return (
      <>
        <ToggleButtonsMultiple onChange={handleToggleChange} setSearchQuery={setSearchQuery} />
        <Grid container gap={2} mt={0.5} columns={14} justifyContent={'center'}>
          {renderComponent()}
        </Grid>
      </>
    );
  };

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'statistics':
        return <>
          {filteredData.map((item) => (
            <Grid item xs={12} sm={6} md={4}
              p={2} sx={{boxShadow: 4, borderRadius: '10px' }}
              minWidth={400}>
              {String(item.Name).toLowerCase().includes('pressure') ? <Pressure id={item.LoggerId} name={item.Name} /> : <Charts id={item.LoggerId} name={item.Name} />}
              {/* <Chart id={item.LoggerId} /> */}
            </Grid>))}
          <Divider width='100%'></Divider>
          <h1>other graphs</h1>
        </>
      case 'map':
        return (
          <div style={{ border: '2px solid #00b3ff', flex: '1' }}>
            <div id="map">
              <MyMap />
            </div>
          </div>
        );
      case 'config':
        return <Logger />;
      case 'add':
        return <AddUser />
      default:
        return <MyMap />;
    }
  };

  useEffect(() => {
    const fetchUniqueLoggers = async () => {
      try {
        const response = await axios.get(
          `http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/logger/`
        );
        const data = response.data;
        setData(data);
      } catch (error) {
        setError('Error fetching data: ' + error.message);
      }
    };

    fetchUniqueLoggers();
  }, [selectedComponent]);

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#00bcd4', // Cyan color
      },
      secondary: {
        main: '#ffeb3b', // Yellow color
      },
    },
  });

  const lightTheme = createTheme({
    palette: {
      primary: {
        main: '#2196f3', // Blue color
      },
      secondary: {
        main: '#4caf50', // Green color
      },
    },
  });

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />

      <div className='App'>
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent={"center"}
          gap={1.5}
          flexDirection="row"
          p={1}
          sx={{ boxSizing: 'border-box', height: '100%', width: '100vw', maxWidth: '100%' }}
        >
          <Router>
            <AuthProvider>

              <Routes>
                <Route path='/login' element={<Login />} />
                <Route element={<PrivateRoute />}>
                  <Route path='/' element={<RenderComponentWrapper />} />
                </Route>
              </Routes>
            </AuthProvider>
          </Router>
        </Box>
      </div>


    </ThemeProvider>
  );
}

export default App;
