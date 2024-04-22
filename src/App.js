import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Logger from './Logger';
import Chart from './Chart';
import ToggleButtonsMultiple from './Toggle';
import { render } from '@testing-library/react';

function App() {
    const [data, setData] = useState([]);
    const [view, setView] = useState("Chart");
    const [selectedComponent, setSelectedComponent] = useState('statistics');
    // const [loggers, setLoggers] = useState([]);

    const handleToggleChange = (event, newComponent) => {
        if (newComponent !== null)
            setSelectedComponent(newComponent);
    };

    const renderComponent = () => {
        switch (selectedComponent) {
          case 'statistics':
            return <Chart />;
          case 'map':
            return <div><h1> MAP HERE </h1></div>;
          case 'config':
            return <Logger />;
          case 'other':
            return <Logger />;
          default:
            return <Chart />;
        }
      };

    useEffect(() => {
      // Make an API call to your Node.js backend using axios
      axios.get('http://192.168.3.18,9:3001/api/flow_logger')
          .then(response => {
              // Set the data in state
              setData(response.data);
              console.log("Success!!");
              console.log(data);
          })
          .catch(error => {
              console.error('Error fetching data:', error);
          });  
      
    //   axios.get('http://192.168.3.179:3001/api/logger')
    //       .then(response => {
    //           // Set the data in state
    //           setLoggers(response.data);
    //           console.log("Success!!");
    //           console.log(loggers);
    //       })
    //       .catch(error => {
    //           console.error('Error fetching data:', error);
    //       });  
  }, [selectedComponent]);
  
    return (
        <div>

            {/* <h1>Data from flow_logger</h1>
            <ul>
                {data.map(item => (
                    <li key={item.LogId}>
                        {item.LogId}: {item.LoggerModel} - {item.AverageVoltage}V
                    </li>
                ))}
            </ul>
            <Logger />
            <Chart /> */}
            <ToggleButtonsMultiple onChange={handleToggleChange}/>
            {renderComponent()}
        </div>
    );
}

export default App;

// function App() {
//     const [data, setData] = useState([]);

//     useEffect(() => {
//       // Make an API call to your Node.js backend using axios
//       axios.get('http://192.168.3.179:3001/api/flow_logger')
//           .then(response => {
//               // Set the data in state
//               setData(response.data);
//               console.log("Success!!");
//               console.log(data);
//           })
//           .catch(error => {
//               console.error('Error fetching data:', error);
//           });  
//   }, []);
  
//     return (
//         <div>
//             <h1>Data from flow_logger</h1>
//             <ul>
//                 {data.map(item => (
//                     <li key={item.LogId}>
//                         {item.LogId}: {item.LoggerModel} - {item.AverageVoltage}V
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }