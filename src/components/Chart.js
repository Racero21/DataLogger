import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Import chart.js to automatically register all chart types
import { Grid, Card, CardContent, Typography } from '@mui/material';
import 'chartjs-adapter-date-fns';
import { LegendToggle } from '@mui/icons-material';
import '../Chart.css'
import { Box } from '@mui/material';

function Chart({ id }) {
    const [datac, setCData] = useState(null);
    // const [scatterData, setScatterData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const borderColor = {
      voltage: 'rgba(75,192,192,1)',
      flow: 'rgba(255,192,255,1)',
      positive: 'rgba(255,0,255,255)',
      negative: 'rgba(255,192,0,60)',
    };
    
    useEffect(() => {
        
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/flowmeter_log/`+id);
                
                const data = response.data;
                
                // Process the data from the response and create the data object for the chart
                const transformedData = {
                    labels: data.map(item => item.LogTime),
                    datasets: [
                        {
                            label: 'Average Voltage',
                            data: data.map(item => item.AverageVoltage),
                            borderColor: borderColor.voltage,
                            // backgroundColor: 'brown',
                            color: 'yellow',
                            fill: true,
                            hidden: false,
                        },
                        {
                            label: 'Current Flow',
                            data: data.map(item => item.CurrentFlow),
                            borderColor: borderColor.flow,
                            fill: true,
                            hidden: false,
                        },
                        {
                            label: 'Flow Positive',
                            data: data.map(item => item.TotalFlowPositive),
                            borderColor: borderColor.positive,
                            fill: true,
                            hidden: false,
                        },
                        {
                            label: 'Flow Negative',
                            data: data.map(item => item.TotalFlowNegative),
                            borderColor: borderColor.negative,
                            fill: true,
                            hidden: false,
                        },
                        // Add more datasets if needed
                    ]
                };

                // const scatterPlotData = data.map(item => ({
                //     x: item.AverageVoltage,
                //     y: item.CurrentFlow
                // }));
                 
                
                setCData(transformedData);
                setLoading(false);
                // setScatterData(scatterPlotData)
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
                return 'V';
            case 'Current Flow':
                return 'psi';
            case 'Flow Positive':
            case 'Flow Negative':
                return 'Liters';
            default: 
                return '';
        }
    }

    const options = {
        
        responsive: true,
        maintainAspectRatio: true,
        // maintainAspectRatio: true, // This allows setting explicit height and width
        // // Set the desired height and width here
        // // You can use static values or calculate them dynamically
        // // Example static values:
        // height: 50,
        // width: 50,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'second'
            }
          }
        },
        plugins: {      
            title: {
                font: {
                    size: 20,
                },
                display: true,
                text: 'Time Series Data'
            },
            subtitle: {
              display: true,
              text: 'LoggerID: ' + id,
              padding: {
                bottom: 10
              }
            },
            legend: {
              display: false,
            },
            tooltip: {
                callbacks: {
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
    
      const handleCardClick = (legend) => {
        const updatedDatasets = datac.datasets.map((dataset) => {
          if (dataset.label === legend) {
            // Toggle the visibility of the dataset
            return {
              ...dataset,
              hidden: !dataset.hidden, // Toggle visibility
            };
          }
          return dataset;
        });
      
        // Update the chart data with the updated datasets
        setCData({
          ...datac,
          datasets: updatedDatasets,
        });
      };

    //   const scatterOptions = {
    //     responsive: true,
    //     maintainAspectRatio: false,
    //     plugins: {      
    //         title: {
    //             display: true,
    //             text: 'Current Flow to Voltage'
    //         },
    //     },
    //     scales: {
    //         x: {
    //             type: 'linear',
    //             position: 'bottom',
    //             title: {
    //                 display: true,
    //                 text: 'Voltage'
    //             }
    //         },
    //         y: {
    //             title: {
    //                 display: true,
    //                 text: 'Flow'
    //             }
    //         }
    //     }
    // };

    if(loading) {
        return (
            <div>Loading...</div>
        )
    }

    return (
        <div>
      
      <h1>LoggerId {id}</h1>
      {/* Chart Component */}
      <Box sx={{display: 'inherit', alignItems: 'center',}} >
      <Line data={datac} options={options}/>
      </Box>
      <Grid container spacing={2}>
        {/* First Card */}
        <Grid item xs={3}>
          <Card className='card' onClick={() => handleCardClick('Average Voltage')} sx={{ border: `1px solid ${borderColor.voltage}`}}>
            <CardContent>
              <Typography variant="h5" component="h2">
                Voltage
              </Typography>
              <Typography color="textSecondary">
                This is the content of card 1.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Second Card */}
        <Grid item xs={3}>
          <Card className='card' onClick={() => handleCardClick('Current Flow')} sx={{ border: `1px solid ${borderColor.flow}`}}>
            <CardContent>
              <Typography variant="h5" component="h2">
                Flow
              </Typography>
              <Typography color="textSecondary">
                This is the content of card 2.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Third Card */}
        <Grid item xs={3}>
          <Card className='card' onClick={() => handleCardClick('Flow Positive')} sx={{ border: `1px solid ${borderColor.positive}`}}>
            <CardContent>
              <Typography variant="h5" component="h2">
                Positive
              </Typography>
              <Typography color="textSecondary">
                This is the content of card 3.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Fourth Card */}
        <Grid item xs={3}>
          <Card className='card' onClick={() => handleCardClick('Flow Negative')} sx={{ border: `1px solid ${borderColor.negative}`}}>
            <CardContent>
              <Typography variant="h5" component="h2">
                Negative
              </Typography>
              <Typography color="textSecondary">
                This is the content of card 3.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
        // <div id="chart" style={{height:'33vh', width: '30vw'}}>
        //     <Line data={datac} options={options}/>
        // </div>
    );
}

export default Chart;

 {/* </div> */}
            {/* <div style={{ height: 400, width: 600 }}>
                <Scatter data={{ datasets: [{ data: scatterData, label: 'Current Flow to Voltage'}] }} options={scatterOptions} />
            </div> */}


            {/* <h1>LoggerId: {id}</h1> */}
            {/* <div style={{height:400, width:600}}> */}