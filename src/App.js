import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Logger from './Logger';
import Chart from './Chart';

function App() {
    const [data, setData] = useState([]);
    // const [loggers, setLoggers] = useState([]);

    useEffect(() => {
      // Make an API call to your Node.js backend using axios
      axios.get('http://192.168.3.179:3001/api/flow_logger')
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
  }, []);
  
    return (
        <div>

            <h1>Data from flow_logger</h1>
            <ul>
                {data.map(item => (
                    <li key={item.LogId}>
                        {item.LogId}: {item.LoggerModel} - {item.AverageVoltage}V
                    </li>
                ))}
            </ul>
            <Logger />
            {/* <Chart /> */}
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