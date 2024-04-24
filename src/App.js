import React, { useEffect, useState } from 'react';
// import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import axios from 'axios';
import Logger from './components/Logger';
import Chart from './components/Chart';
import ToggleButtonsMultiple from './components/Toggle';
import MyMap from './components/Map';
import { Box } from '@mui/material';
// import { Router } from '@mui/icons-material';

function App() {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [selectedComponent, setSelectedComponent] = useState('statistics');

    const handleToggleChange = (event, newComponent) => {
        if (newComponent !== null)
            setSelectedComponent(newComponent);
    };

    const renderComponent = () => {
        switch (selectedComponent) {
          case 'statistics':
            console.log(data)
            return data.map(item => (
                // <div key={item.LoggerId}> <Chart id={item.LoggerId}/></div>
              <Box
                // height={30%}
                // width={200}
                my={4}
                display="flex"
                alignItems="center"
                gap={4}
                p={2}
                sx={{ border: '2px solid grey', height: '1%', width: '35%'}}
              >
                <Chart id={item.LoggerId} />
              </Box>  
            ))
          case 'map':
            return <div>
              {/* <h1> MAP HERE </h1> */}
                <div id="map">
                  <MyMap />
                </div>
            </div>;
          case 'config':
            return <Logger />;
          case 'other':
            return <Logger />;
          default:
            return <h1>XDD</h1>;
        }
      };

    useEffect(() => {
      // Make an API call to your Node.js backend using axios
      const fetchUniqueLoggers = async () => {
            try {
                const response = await axios.get('http://192.168.3.189:3001/api/logger/');
                const data = response.data;
                
                setData(data)
            } catch (error) {
                setError('Error fetching data: ' + error.message);
            }
        }
      
      fetchUniqueLoggers()

  }, [selectedComponent]);
  
    return (
    //   <Router>
    //   <Switch>
    //     <Route path="/" exact component={renderComponent()} />
    //     <Route path="/map" component={MyMap} />
    //   </Switch>
    // </Router>
        <div>
            {/* <AppBar /> */}
            <ToggleButtonsMultiple onChange={handleToggleChange}/>
            <div>
            {renderComponent()}
            </div>
            
        </div>
    );
}

export default App;