import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Import chart.js to automatically register all chart types


function Chart() {
    const [chartData, setChartData] = useState({});
    const [datac, setCData] = useState({})
    useEffect(() => {
        axios.get('http://192.168.3.179:3001/api/flow_logger')
            .then(response => {
                // Process the data from the response and create the data object for the chart
                setChartData(response.data);
                const data = {
                    labels: chartData.map(item => item.LogTime), // Assuming LogTime is the x-axis data
                    datasets: [
                        {
                            label: 'Average Voltage',
                            data: chartData.map(item => item.AverageVoltage),
                            borderColor: 'rgba(75,192,192,1)',
                            fill: false,
                        },
                        // Add more datasets if needed
                    ],
                };
                setCData(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    return (
        <div>
            <h2>Average Voltage over Time</h2>
            <Line data={datac} />
        </div>
    );
}

export default Chart;