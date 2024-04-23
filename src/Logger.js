import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Logger() {
    const [loggers, setLoggers] = useState([]);

    useEffect(() => {
      // Make an API call to your Node.js backend using axios
      axios.get('http://192.168.3.189:3001/api/logger')
          .then(response => {
              // Set the data in state
              setLoggers(response.data);
              console.log("Success!! LOGGERS");
              console.log(loggers);
          })
          .catch(error => {
              console.error('Error fetching data:', error);
          });  
  }, [loggers]);
  
    return (
        <div>
            <h2>Distinct Flow Loggers</h2>
            {loggers.map((item, index) => (
                    // <li key={index}>
                    <pre>
                        LoggerId: {item.LoggerId} Model: {item.LoggerModel} <button>edit</button>
                    </pre>
                        
                    // </li>
                ))}
            {/* <ol>
                {loggers.map((index, logger) => (
                    <li key={index}>{logger.LoggerId}</li>
                ))}
            </ol> */}
        </div>
    );
}

export default Logger;