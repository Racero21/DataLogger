import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Import chart.js to automatically register all chart types
import { Grid, Card, CardContent, Typography } from '@mui/material';
import GaugeChart from 'react-gauge-chart';
import GaugeComponent from 'react-gauge-component';
import 'chartjs-adapter-date-fns';
import '../Chart.css'
import { Box } from '@mui/material';

function Chart({ id }) {
    const [datac, setCData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [latest, setLatest] = useState([]);
    const [info, setInfo] = useState(null)
    const [error, setError] = useState(null);

    // const borderColor = {
    //   voltage: 'rgba(75,192,192,1)',
    //   flow: 'rgba(255,192,255,1)',
    //   positive: 'rgba(255,0,255,255)',
    //   negative: 'rgba(255,192,0,60)',
    // };
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
                // console.log(datac)
                
                
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
    }, [id, borderColor.flow, borderColor.negative, borderColor.positive, borderColor.voltage]);
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

    if(loading) {
        return (
            <div>Loading...</div>
        )
    }

    return (
        <div>
      
      {/* <h1>LoggerId {id}</h1> */}
      {/* Chart Component */}
      {/* <Box sx={{ alignItems: 'center',}} > */}
      <Line data={datac} options={options}/>
      {/* </Box> */}
      <Grid container spacing={2}>
        {/* First Card */}
        <Grid item xs={3}>
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
                // nrOfLevels={420}
                formatTextValue={(value) => value + 'V'}
                arcsLength={[0.3, 0.5, 0.2]}
                colors={['brown', '#F5CD19', '#EA4228']}
                textColor='black'
                marginInPercent={0}
                hideText={false}
                 />
                
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Second Card */}
        <Grid item xs={3}>
          <Card className='card' onClick={() => handleCardClick('Current Flow')} sx={{ border: `5px solid ${borderColor.flow}`}}>
            <CardContent sx={{display: 'flex', flexDirection: 'row'}}>
            <Grid item container direction={'column'}>
              <Typography variant="h5" component="h2">
                Flow
              </Typography>
              <Typography color="textSecondary">
              {latest.CurrentFlow} psi
              </Typography>
            </Grid>
            <div style={{ width: '50%', height: '50%' }}> {/* Adjust percentage values as needed */}
                <GaugeChart id="gauge-chart" 
                percent={latest.AverageVoltage*10} 
                minValue={0} // Set the minimum value
                maxValue={10}
                arcWidth={0.4}
                cornerRadius={0.2}
                nrOfLevels={6}
                arcsLength={[0.3, 0.5, 0.2]}
                colors={['brown', '#F5CD19', '#EA4228']}
                textColor='black'
                marginInPercent={0}
                hideText={true}
                 />
                
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Third Card */}
        <Grid item xs={3}>
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
                        {latest.TotalFlowPositive} Liters
                      </Typography>
                      
                      {/* <Typography gutterBottom variant='subtitle1' component={'div'}>
                        Positive
                      </Typography> */}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <div style={{ width: '80%', height: '50%' }}>
            <GaugeComponent
              type="semicircle"
              arc={{
                width: 0.4,
                padding: 0.005,
                cornerRadius: 2,
              }}
              value={latest.TotalFlowPositive}
              labels={{
                tickLabels: {
                  defaultTickValueConfig: {
                    hide: true,
                  },
                  defaultTickLineConfig: {
                    hide: true,
                  },
                },
              }}
            />
          </div>
              {/* <Typography variant="h5" component="h2">
                Positive
              </Typography>
              <Typography color="textSecondary">
                This is the content of card 3.
              </Typography> */}
            </CardContent>
          </Card>
        </Grid>

        {/* Fourth Card */}
        <Grid item xs={3}>
          <Card className='card' onClick={() => handleCardClick('Flow Negative')} sx={{ border: `5px solid ${borderColor.negative}`}}>
            <CardContent sx={{display: 'flex', flexDirection: 'row'}}>
              <Grid item container direction={'column'}>
              <Typography variant="h5" component="h2">
                Negative
              </Typography>
              <Typography color="textSecondary">
                {latest.TotalFlowNegative} Liters
              </Typography>
              </Grid>
              GAUGE
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
    );
}

export default Chart;