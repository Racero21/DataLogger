import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line, Scatter } from 'react-chartjs-2';
import 'chart.js/auto'; // Import chart.js to automatically register all chart types



function Chart({ id }) {
    const [datac, setCData] = useState(null);
    const [scatterData, setScatterData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        
        const fetchData = async () => {
            try {
                const response = await axios.get('http://192.168.3.189:3001/api/flowmeter_log/'+id);
                const data = response.data;
                
                // Process the data from the response and create the data object for the chart
                const transformedData = {
                    labels: data.map(item => item.LogTime),
                    datasets: [
                        {
                            label: 'Average Voltage',
                            data: data.map(item => item.AverageVoltage),
                            borderColor: 'rgba(75,192,192,1)',
                            fill: false,
                        },
                        {
                            label: 'Current Flow',
                            data: data.map(item => item.CurrentFlow),
                            borderColor: 'rgba(255,192,255,1)',
                            fill: false,
                        },
                        {
                            label: 'Flow Positive',
                            data: data.map(item => item.TotalFlowPositive),
                            borderColor: 'rgba(255,0,255,255)',
                            fill: false,
                        },
                        {
                            label: 'Flow Negative',
                            data: data.map(item => item.TotalFlowNegative),
                            borderColor: 'rgba(255,192,0,60)',
                            fill: false,
                        },
                        // Add more datasets if needed
                    ]
                };

                const scatterPlotData = data.map(item => ({
                    x: item.AverageVoltage,
                    y: item.CurrentFlow
                }));
                 
                
                setCData(transformedData);
                setLoading(false);
                setScatterData(scatterPlotData)
            } catch (error) {
                setError('Error fetching data: ' + error.message);
            }
        };

        fetchData();

        // Optionally, return a cleanup function if necessary
        // For example, if you need to destroy the chart instance
        // return () => {
        //     if (chartInstance) {
        //         chartInstance.destroy();
        //     }
        // };
    }, [id]);
    function getUnitofMeasurement(label) {
        switch (label) {
            case 'Average Voltage':
                return ' V';
            case 'Current Flow':
                return ' psi';
            case 'Flow Positive':
            case 'Flow Negative':
                return ' Liters';
            default: 
                return '';
        }
    }
    const footer = (tooltipItems) => {
        let sum = 0;
      
        tooltipItems.forEach(function(tooltipItem) {
          sum += tooltipItem.parsed.y;
        });
        return 'Sum: ' + sum;
      };

    const options = {
        
        responsive: true,
        maintainAspectRatio: true, // This allows setting explicit height and width
        // Set the desired height and width here
        // You can use static values or calculate them dynamically
        // Example static values:
        height: 50,
        width: 50,
        plugins: {      
            title: {
                display: true,
                text: 'Voltage and Current Flow Over Time'
            },
            tooltip: {
                callbacks: {
                    footer: footer,
                    label: (item) => `${item.dataset.label}: ${item.formattedValue} ${getUnitofMeasurement(item.dataset.label)}`
                }
            },
        },
        // Example dynamic values based on parent container size:
        // layout: {
        //   padding: {
        //     top: 50,
        //     left: 50,
        //     right: 50,
        //     bottom: 50
        //   }
        // }
      };
    
    

      const scatterOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {      
            title: {
                display: true,
                text: 'Current Flow to Voltage'
            },
        },
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                title: {
                    display: true,
                    text: 'Voltage'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Flow'
                }
            }
        }
    };

    if(loading) {
        return (
            <div>Loading...</div>
        )
    }

    return (
        <div>
            <h1>LoggerId: {id}</h1>
            <div style={{height:400, 
                    width:600}}>
                <Line data={datac} options={options}/>
            </div>
            <div style={{ height: 400, width: 600 }}>
                <Scatter data={{ datasets: [{ data: scatterData, label: 'Current Flow to Voltage'}] }} options={scatterOptions} />
            </div>
        </div>
    );
}

export default Chart;