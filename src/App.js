import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Logger from './Logger';
import Chart from './Chart';
import ToggleButtonsMultiple from './Toggle';

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
                <div key={item.LoggerId}> <Chart id={item.LoggerId}/></div>  
            ))
          case 'map':
            return <div><h1> MAP HERE </h1></div>;
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
        <div>
            {/* <AppBar /> */}
            <ToggleButtonsMultiple onChange={handleToggleChange}/>
            {renderComponent()}
        </div>
    );
}

export default App;