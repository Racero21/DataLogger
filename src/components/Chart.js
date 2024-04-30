import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Import chart.js to automatically register all chart types
import { Grid, Card, CardContent, Typography, Divider } from '@mui/material';
import GaugeChart from 'react-gauge-chart';
import GaugeComponent from 'react-gauge-component';
import 'chartjs-adapter-date-fns';
import '../Chart.css'
import { Box } from '@mui/material';
import { yellow } from '@mui/material/colors';

function Chart({ id }) {
    const [datac, setCData] = useState(null);
    const [copy, setCopy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [latest, setLatest] = useState([]);
    const [info, setInfo] = useState(null)
    const [error, setError] = useState(null);

    const borderColor = {
      voltage: '#FFA726', // Electric Orange
      flow: '#42A5F5',    // Water Blue
      positive: '#4CAF50', // Fresh Green
      negative: '#FF7043', // Rusty Red
    };
    
    useEffect(() => {
        
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/flowmeter_log/`+id);
                const name = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/logger`)
                
                const names = name.data;
                names.map(item => {
                  if(item.LoggerId === id) {
                    setInfo(item.Name);
                    console.log(item.Name)
                  }
                  return 0;
                })
                // setInfo(names);
                console.log(info)

                const data = response.data;
                const lastElement = data[data.length - 1];

                setLatest(lastElement);
                console.log(data)
                console.log(latest);
                // Process the data from the response and create the data object for the chart
                const transformedData = {
                    labels: data.map(item => item.LogTime),
                    datasets: [
                        {
                            label: 'Average Voltage',
                            data: data.map(item => item.AverageVoltage),
                            borderColor: borderColor.voltage,
                            // backgroundColor: 'brown',
                            // backgroundColor: '#FAFAFA', // Light Grey

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
                
                setCData(transformedData);
                setCopy(transformedData);
                setLoading(false);
                
            } catch (error) {
                setError('Error fetching data: ' + error.message);
            }
        };

        fetchData();
        // console.log(datac)
    }, [id, borderColor.flow, borderColor.negative, borderColor.positive, borderColor.voltage]);
    function getUnitofMeasurement(label) {
        switch (label) {
            case 'Average Voltage':
                return 'V';
            case 'Current Flow':
                return 'm3/h';
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
                text: 'Time Series Data of ' + info,
            },
            // subtitle: {
            //   display: true,
            //   text: 'LoggerID: ' + id,
            //   padding: {
            //     bottom: 10
            //   }
            // },
            legend: {
              display: false,
            },
            tooltip: {
                callbacks: {
                    label: (item) => `${item.dataset.label}: ${item.formattedValue} ${getUnitofMeasurement(item.dataset.label)}`
                }
            },
        },
      };

      const handleCardClick = (legend) => {
        const updatedDatasets = datac.datasets.map((dataset) => {
          if (dataset.label !== legend && dataset.hidden === false) {
            // Hide other datasets if they are not the clicked legend
            return {
              ...dataset,
              hidden: true,
            };
          } 
          else if (dataset.label === legend && dataset.hidden === true) {
            // Show the clicked legend if it's hidden
            return {
              ...dataset,
              hidden: false,
            };
          } 
          return dataset; // Keep other datasets unchanged
        });
      
        // Update the chart data with the updated datasets
        setCData({
          ...datac,
          datasets: updatedDatasets,
        });
      };

    if(loading) {
        return (
            <div>Loading...</div>
        )
    }

    return (
        <div>
      <Line data={datac} options={options}/>
      <Grid container spacing={2}>
        {/* First Card */}
        <Grid item xs={4}>
          <Card className='card'  onHover={() => handleCardClick('Average Voltage')} onClick={() => handleCardClick('Average Voltage')} sx={{ border: `5px solid ${borderColor.voltage}`}}>
            <CardContent sx={{display: 'flex', flexDirection: 'row'}}>
              <Grid item container direction={'column'}>
              <Typography variant="h5" component="h2">
                Voltage
              </Typography>
              <Typography color="textSecondary">
                {latest.AverageVoltage} Volts
              </Typography>
              </Grid>
              <div style={{ width: '50%', height: '50%' }}> {/* Adjust percentage values as needed */}
                <GaugeChart id="gauge-chart" 
                percent={latest.AverageVoltage/10} 
                cornerRadius={0.2}
                arcWidth={0.4}
                // nrOfLevels={420}
                formatTextValue={(value) => value/10 + 'V'}
                arcsLength={[0.1, 0.1, 0.6, 0.1, 0.1]}
                colors={['#EA4228', '#F5CD19', 'green', '#F5CD19', '#EA4228']}
                animate={false}
                textColor='black'
                marginInPercent={0}
                hideText={true}
                 />
                
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Second Card */}
        <Grid item xs={4} sx={{display: 'flex', flexDirection: 'column'}}>
          <Card className='card' onClick={() => handleCardClick('Current Flow')} sx={{ border: `5px solid ${borderColor.flow}`}}>
            <CardContent sx={{display: 'flex', flexDirection: 'row'}}>
            <Grid item container direction={'column'}>
              <Typography variant="h5" component="h2">
                Flow
              </Typography>
              <Typography color="textSecondary">
              {latest.CurrentFlow} m3/h
              </Typography>
            </Grid>
            <div style={{ width: '50%', height: '50%' }}> {/* Adjust percentage values as needed */}
                <GaugeChart id="gauge-chart" 
                percent={latest.CurrentFlow/600} 
                cornerRadius={0.2}
                arcWidth={0.4}
                // nrOfLevels={420}
                formatTextValue={(value) => value + 'V'}
                arcsLength={[0.2, 0.19, 0.44, 0.06, 0.1]}
                colors={['#EA4228', '#F5CD19', 'green', '#F5CD19', '#EA4228']}
                animate={false}
                textColor='black'
                marginInPercent={0}
                hideText={true}
                 />
                
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Third Card */}
        <Grid item xs={2}>
          <Card className='card' onClick={() => handleCardClick('Flow Positive')} sx={{ border: `5px solid ${borderColor.positive}`}}>
            <CardContent sx={{display: 'flex', flexDirection: 'row'}}>
              <Grid container spacing={2}>
                {/* <Grid item>
                  GAUGE
                </Grid>  */}
                <Grid item xs={12} sm container>
                  <Grid item xs container direction={"column"} spacing={2}>
                    <Grid item xs>
                      <Typography variant="h5" component="h2">
                        Positive
                      </Typography>
                      <Typography color={"textSecondary"}>
                        {latest.TotalFlowPositive} L
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Fourth Card */}
        <Grid item xs={2}>
          <Card className='card' onClick={() => handleCardClick('Flow Negative')} sx={{ border: `5px solid ${borderColor.negative}`}}>
            <CardContent sx={{display: 'flex', flexDirection: 'row'}}>
              <Grid item container direction={'column'}>
              <Typography variant="h5" component="h2">
                Negative
              </Typography>
              <Typography color="textSecondary">
                {latest.TotalFlowNegative} L
              </Typography>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
    );
}

export default Chart;