import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Import chart.js to automatically register all chart types
import { Grid, Card, CardContent, Typography, Divider, Button } from '@mui/material';
import GaugeChart from 'react-gauge-chart';
import { Chart, Interaction } from 'chart.js';
import '../Chart.css';
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';
import { CrosshairPlugin, Interpolate } from 'chartjs-plugin-crosshair';
import { subHours } from 'date-fns';
import Modal from '@mui/material/Modal';
import { Box } from '@mui/material';



function Charts({ id, showGauge=true }) {
  Chart.register(zoomPlugin);
  Chart.register(CrosshairPlugin);
  Interaction.modes.interpolate = Interpolate
  const [lineData, setLineData] = useState(null);
  const [barData, setBarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [latest, setLatest] = useState([]);
  const [loggerData, setLoggerData] = useState(null)
  const [totalizer, setTotalizer] = useState(null)
  const [loggerName, setLoggerName] = useState(null)
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [selectedTimeFrame, setSelectedTimeFrame] = useState('hour');

  const handleTimeFrameChange = (event) => {
    setSelectedTimeFrame(event.target.value);
  };

  const borderColor = {
    voltage: '#ffac33', // Electric Orange
    flow: '#42A5F5',    // Water Blue
    totalizer: '#f4ff00',
    positive: '#4CAF50', // Fresh Green
    negative: '#af579f', // Rusty Red
  };

  const filterDataByTimeRange = (data, timeRange) => {
    const currentTime = new Date();
    let timeThreshold = null;

    switch (timeRange) {
      case 'hour':
        timeThreshold = subHours(currentTime, 1);
        break;
      case 'hour12':
        timeThreshold = subHours(currentTime, 12);
        break;
      case 'day':
        timeThreshold = subHours(currentTime, 24);
        break;
      case 'day2':
        timeThreshold = subHours(currentTime, 48);
        break;
      case 'week':
        timeThreshold = subHours(currentTime, 24 * 7);
        break;
      case 'month':
        timeThreshold = subHours(currentTime, 24 * 30);
        break;
      default:
        timeThreshold = 0;
    }
    return data.filter(item => parseTime(item.LogTime) >= timeThreshold);
  }
  const cumulativeToCategorical = (data, interval = null) => {
    // }, [])
    return data.map((item, index, arr) => {
      const newItem = structuredClone(item)
      if (index == 0) {
        newItem.TotalFlowPositive = null
        newItem.TotalFlowNegative = null
      }
      else {
        let prev = arr[index - 1]
        newItem.TotalFlowPositive -= prev.TotalFlowPositive
        newItem.TotalFlowNegative -= prev.TotalFlowNegative
      }
      return newItem
    })
  }

  function parseTime(logTime) {
    const datetime = logTime.slice(0, -1);
    return new Date(datetime);
  }

  function getUnitofMeasurement(label) {
    switch (label) {
      case 'Average Voltage':
        return 'V';
      case 'Current Flow':
        return 'L/s';
      case 'Flow Positive':
      case 'Flow Negative':
        return 'm3';
      default:
        return '';
    }
  }

  const lineOptions = {
    cubicInterpolationMode: 'monotone',
    stepped: (item) => getUnitofMeasurement(item.dataset.label) == 'm3' ? 'middle' : false,
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            hour: 'MM/d H:00'
          }
          // unit: 'hour',
        },
      },
    },
    plugins: {
      crosshair: {
        line: {
          color: '#f66',
          width: 1,
          dashPattern: [15, 5]
        },
        zoom: {
          enabled: false
        },
        // snap: {
        //   enabled: true
        // },
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          mode: 'x',
        },
        pan: {
          enabled: true,
          mode: 'x',
        },
        limits: {
          x: {
            min: 'original',
            max: 'original'
          }
        }
      },
      title: {
        font: {
          size: 20,
        },
        display: true,
        text: loggerName + ' Flow Meter'
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (item) => `${item.dataset.label}: ${item.formattedValue} ${getUnitofMeasurement(item.dataset.label)}`
        },
        mode: 'interpolate',
        intersect: false
      }
    },
  };

  const barOptions = {
    aspectRatio:0.75,
    maintainAspectRatio: true,
    responsive: true,
    indexAxis: 'y',
    scales: {
      y: {
        type: 'time',
        time: {
          // displayFormats: {
          //   Day: 'MM/d H:00'
          // }
          unit: 'day',
        },
      },
    },
    plugins: {
      crosshair: {
        line: {
          color: '#f66',
          width: 1,
          dashPattern: [0, 5]
        },
        zoom: {
          enabled: false
        },
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: false,
          },
          pinch: {
            enabled: false
          },
        },
        pan: {
          enabled: false,
          mode: 'x',
        },
        limits: {
          x: {
            min: 'original',
            max: 'original'
          }
        }
      },
      title: {
        font: {
          size: 20,
        },
        display: true,
        text: loggerName + ' Totalizer'
      },
      legend: {
        // display: false,
      },
      tooltip: {
        callbacks: {
          label: (item) => `${item.dataset.label}: ${item.formattedValue} m3`
        },
        mode:'y',
        intersect: false
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const logResponse = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/flow_log/` + id);
        const loggerResponse = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/logger/` + id)
        const totalizerResponse = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/totalizer/` + id)

        setTotalizer(totalizerResponse.data)

        setLoggerData(loggerResponse.data[0])
        setLoggerName(loggerResponse.data[0].Name.split('_').pop().replaceAll('-', ' '))


        const flowData = logResponse.data;
        const totalizerData = totalizerResponse.data;
        const lastElement = flowData[flowData.length - 1];

        const filtered = cumulativeToCategorical(filterDataByTimeRange(flowData, selectedTimeFrame))

        setLatest(lastElement);
        // console.log(filtered)
        console.log(`${Object.keys(flowData).length} filtered down to ${Object.keys(filtered).length}`)

        // Process the data from the response and create the data object for the chart
        const transformedData = {
          labels: filtered.map(item => parseTime(item.LogTime)),
          datasets: [
            {
              label: 'Average Voltage',
              data: filtered.map(item => item.AverageVoltage),
              borderColor: borderColor.voltage,
              // backgroundColor: 'brown',
              // backgroundColor: '#FAFAFA', // Light Grey
              color: 'yellow',
              fill: true,
              hidden: true,
            },
            {
              label: 'Current Flow',
              data: filtered.map(item => item.CurrentFlow),
              borderColor: borderColor.flow,
              fill: true,
              hidden: false,
            },
            {
              label: 'Flow Positive',
              data: filtered.map(item => item.TotalFlowPositive),
              borderColor: borderColor.positive,
              fill: true,
              hidden: true,
            },
            {
              label: 'Flow Negative',
              data: filtered.map(item => item.TotalFlowNegative),
              borderColor: borderColor.negative,
              fill: true,
              hidden: true,
            },
            // Add more datasets if needed
          ]
        };

        const transformedTotalizerData = {
          labels: totalizerData.map(item => parseTime(item.Date)),
          datasets: [
            {
              label: 'Daily Flow Positive',
              data: totalizerData.map(item => item.DailyFlowPositive),
              backgroundColor: borderColor.positive,
              fill: true,
              hidden: false,
            },
            {
              label: 'Daily Flow Negative',
              data: totalizerData.map(item => item.DailyFlowNegative),
              backgroundColor: borderColor.negative,
              fill: true,
              hidden: false,
            },
            // Add more datasets if needed
          ]
        };
        console.log(transformedTotalizerData)
        setBarData(transformedTotalizerData);
        setLineData(transformedData);
        setLoading(false);

      } catch (error) {
        setError('Error fetching data: ' + error.message);
      }
    };

    fetchData();
  }, [id, selectedTimeFrame]);


  const handleCardClick = (legend) => {
    const updatedDatasets = lineData.datasets.map((dataset) => {
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
    setLineData({
      ...lineData,
      datasets: updatedDatasets,
    });
  };

  if (loading) {
    return (
      <div>Loading...</div>
    )
  }

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{ display: 'flex', justifyContent: 'center', align: 'middle' }}>
        <Grid container
          display={'flex'}
          sx={{ width: '75vw', padding: '1.5%', margin: 'auto', backgroundColor: 'white', borderRadius: '10px' }}
          justifyContent={'center'}>
          <Grid item xs={12} sm={12} md ={8}>
            <Box
              display={'flex'}
              sx={{ margin: 'auto', backgroundColor: 'white', flexDirection: 'column', borderRadius: '10px' }}>
              <select value={selectedTimeFrame} onChange={handleTimeFrameChange}>
                <option value="hour">Last Hour</option>
                <option value="hour12">Last 12 Hours</option>
                <option value="day">Last 24 Hours</option>
                <option value="day2">Last 48 Hours</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>
              <Line data={lineData} options={lineOptions} />
              <Typography variant='subtitle1'>
                LATEST RECORDED LOG - <strong>{`${new Date(latest.LogTime.slice(0, -1))}`}</strong>
              </Typography>
              <Grid container spacing={2} onClick={handleOpen}>
                {/* First Card */}
                <Grid item xs={4}>
                  <Card className='card' onClick={() => handleCardClick('Current Flow')} sx={{ border: `5px solid ${borderColor.flow}` }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'row' }}>
                      <Grid container direction={'column'}>
                        <Typography variant="button" fontSize={16}>
                          Flow
                        </Typography>
                        <Typography variant="h4">
                          {latest.CurrentFlow ?? <strong style={{ 'color': 'red' }}>N/A</strong>} L/s
                        </Typography>
                      </Grid>
                      <div style={{ width: '50%', height: '50%' }}> {/* Adjust percentage values as needed */}
                        <GaugeChart id="gauge-chart"
                          percent={latest.CurrentFlow / 48.61}
                          cornerRadius={0.2}
                          arcWidth={0.4}
                          // nrOfLevels={420}
                          // formatTextValue={(value) => value + ' L/s'}
                          arcsLength={[0.075, 0.15, 0.75, 0.1]}
                          // 15% 100
                          colors={['#EA4228', '#F5CD19', 'green', '#F5CD19']}
                          animate={false}
                          textColor='black'
                          marginInPercent={0}
                          hideText={true} />
                      </div>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Second Card */}
                <Grid item xs={4}>
                  <Card className='card' onClick={() => handleCardClick('Average Voltage')} sx={{ border: `5px solid ${borderColor.voltage}` }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'row' }}>
                      <Grid item container direction={'column'}>
                        <Typography variant="button" fontSize={16}>
                          Voltage
                        </Typography>
                        <Typography variant='h4'>
                          {latest.AverageVoltage ?? <strong style={{ 'color': 'red' }}>'N/A'</strong>} V
                        </Typography>
                      </Grid>
                      <div style={{ width: '50%', height: '50%' }}> {/* Adjust percentage values as needed */}
                        <GaugeChart id="gauge-chart"
                          percent={latest.AverageVoltage / 4.3}
                          cornerRadius={0.2}
                          arcWidth={0.4}
                          // nrOfLevels={420}
                          formatTextValue={(value) => value / 10 + 'V'}
                          arcsLength={[0.15, 0.15, 0.6, 0.1, 0.1]}
                          colors={['#EA4228', '#F5CD19', 'green', '#F5CD19', '#EA4228']}
                          animate={false}
                          textColor='black'
                          marginInPercent={0}
                          hideText={true} />
                      </div>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Totalizer + Card */}
                <Grid item xs={2} sx={{ display: 'flex' }}>
                  <Card className='card' onClick={() => handleCardClick('Flow Positive')} sx={{ flex: 1, border: `5px solid ${borderColor.positive}` }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="button" fontSize={16}>
                        Totalizer Positive
                      </Typography>
                      <Typography variant='h6' >
                        {totalizer[0]?.DailyFlowPositive ?? <strong style={{ 'color': 'red' }}>N/A</strong>} m<sup>3</sup>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Totalizer - Card */}
                <Grid item xs={2} sx={{ display: 'flex' }}>
                  <Card className='card' onClick={() => handleCardClick('Flow Negative')} sx={{ flex: 1, border: `5px solid ${borderColor.negative}` }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="button" fontSize={16}>
                        Totalizer Negative
                      </Typography>
                      <Typography variant='h6' >
                        {totalizer[0]?.DailyFlowNegative ?? <strong style={{ 'color': 'red' }}>N/A</strong>} m<sup>3</sup>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12} sm={12} md={4} paddingTop={1} paddingLeft={2}>
          <Bar data={barData} options={barOptions} />

          </Grid>
        </Grid>
      </Modal>

      <Typography variant='h4' sx={{ textAlign: 'center', }}>
        {loggerName.split('_').pop().replace('-', ' ')}
      </Typography>
      <Divider></Divider>
      <Grid container spacing={2} onClick={handleOpen} sx={{ paddingTop: '10px' }}>
        {/* First Card */}
        <Grid item xs={6} >
          <Card className='card' onClick={() => handleCardClick('Current Flow')} sx={{ border: `5px solid ${borderColor.flow}` }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'row' }}>
              <Grid item container direction={'column'} >
                <Typography variant="button" >
                  Flow
                </Typography>
                <Typography variant='h6' fontWeight='bolder'>
                  {latest.CurrentFlow ?? <strong style={{ 'color': 'red' }}>N/A</strong>} L/s
                </Typography>
              </Grid>
              <div style={{ width: '50%', height: '50%' }}> {/* Adjust percentage values as needed */}
                {showGauge? 
                <GaugeChart id="gauge-chart"
                  percent={latest.CurrentFlow / 41}
                  cornerRadius={0.2}
                  arcWidth={0.4}
                  // nrOfLevels={420}
                  // formatTextValue={(value) => value + ' L/s'}
                  arcsLength={[0.075, 0.075, 0.75]}
                  // 15% 100
                  colors={['#EA4228', '#F5CD19', 'green']}
                  animate={false}
                  textColor='black'
                  marginInPercent={0}
                  hideText={true} />:''}
              </div>
            </CardContent>
          </Card>
        </Grid>
        {/* Second Card */}
        <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Card className='card' onClick={() => handleCardClick('Average Voltage')} sx={{ border: `5px solid ${borderColor.voltage}` }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'row' }}>
              <Grid item container direction={'column'}>
                <Typography variant="button">
                  Voltage
                </Typography>
                <Typography variant='h6' fontWeight='bolder'>
                  {latest.AverageVoltage ?? <strong style={{ 'color': 'red' }}>N/A</strong>} V
                </Typography>
              </Grid>
              <div style={{ width: '50%', height: '50%' }}> {/* Adjust percentage values as needed */}
                {showGauge?
                <GaugeChart id="gauge-chart"
                  percent={latest.AverageVoltage / 4.5}
                  cornerRadius={0.2}
                  arcWidth={0.4}
                  // nrOfLevels={420}
                  formatTextValue={(value) => value / 10 + 'V'}
                  arcsLength={[0.15, 0.15, 0.6, 0.1, 0.1]}
                  colors={['#EA4228', '#F5CD19', 'green', '#F5CD19', '#EA4228']}
                  animate={false}
                  textColor='black'
                  marginInPercent={0}
                  hideText={true} />:''}
              </div>
            </CardContent>
          </Card>

        </Grid>
        {/* Third Card */}
        <Grid item xs={6}>
          <Card className='card' onClick={() => handleCardClick('Flow Positive')} sx={{ border: `5px solid ${borderColor.positive}` }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'row' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm container>
                  <Grid item xs container direction={"column"} spacing={2}>
                    <Grid item xs>
                      <Typography variant="button">
                        Totalizer Positive
                      </Typography>
                      <Typography variant='h6'>
                        {/* {latest.TotalFlowPositive} L */}
                        {totalizer[0]?.DailyFlowPositive ?? <strong style={{ 'color': 'red' }}>N/A</strong>} m<sup>3</sup>
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Fourth Card */}
        <Grid item xs={6} >
          <Card className='card' onClick={() => handleCardClick('Flow Negative')} sx={{ border: `5px solid ${borderColor.negative}` }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'row' }}>
              <Grid item container direction={'column'}>
                <Typography variant="button">
                  Totalizer Negative
                </Typography>
                <Typography variant='h6'>
                  {/* {latest.TotalFlowNegative} L */}
                  {totalizer[0]?.DailyFlowNegative ?? <strong style={{ 'color': 'red' }}>N/A</strong>} m<sup>3</sup>
                </Typography>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default Charts;