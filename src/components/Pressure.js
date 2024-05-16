import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Import chart.js to automatically register all chart types
import { Grid, Card, CardContent, Typography, Divider } from '@mui/material';
import GaugeChart from 'react-gauge-chart';
import 'chartjs-adapter-date-fns';
import { subHours } from 'date-fns';
import '../Chart.css'
import Modal from '@mui/material/Modal'
import { Box } from '@mui/material';

function Pressure({ id }) {
  const [datac, setCData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [latest, setLatest] = useState([]);
  const [loggerData, setLoggerData] = useState(null)
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
    voltage: '#ffac33 ', // Electric Orange
    pressure: '#007fff ',    // Microsoft Blue
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

  function parseTime(logTime) {
    const datetime = logTime.slice(0, -1);
    return new Date(datetime);
  }

  useEffect(() => {
    const fetchData = async () => {
      console.log(id)
      try {
        const logResponse = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/pressure_log/` + id);
        const loggerResponse = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/logger`)

        const loggers = loggerResponse.data;
        loggers.map(item => {
          if (item.LoggerId === id) {
            setLoggerData(item);
            setLoggerName(item.Name.split('_').pop().replaceAll('-', ' '))
            console.log(item.Name)
            return 0;
          }
          return -1;
        })
        console.log(loggers)

        const data = logResponse.data;
        const lastElement = data[data.length - 1];

        const filtered = filterDataByTimeRange(data, selectedTimeFrame)

        setLatest(lastElement);
        console.log(filtered)
        console.log(`${Object.keys(data).length} filtered down to ${Object.keys(filtered).length}`)

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
              label: 'Current Pressure',
              data: filtered.map(item => item.CurrentPressure),
              borderColor: borderColor.pressure,
              fill: true,
              hidden: false,
            },
            // Add more datasets if needed
          ]
        };

        setCData(transformedData);
        setLoading(false);

      } catch (error) {
        setError('Error fetching data: ' + error.message);
      }
    };

    fetchData();
    // console.log(datac)
  }, [id, selectedTimeFrame, borderColor.pressure, borderColor.negative, borderColor.positive, borderColor.voltage]);
  function getUnitofMeasurement(label) {
    switch (label) {
      case 'Average Voltage':
        return 'V';
      case 'Current Pressure':
        return 'psi';
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
          displayFormats: {
            hour: 'MM/d H:00'
          }
        }
      },
    },
    plugins: {
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
          mode: 'x'
        }
      },
      title: {
        font: {
          size: 20,
        },
        display: true,
        text: 'Time Series Data of ' + loggerName,
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
        sx={{ display: 'flex', justifyContent: 'center' }}
      >
        <Box
          display={'flex'}
          sx={{ width: '65vw', padding: '1.5%', margin: 'auto', backgroundColor: 'white', flexDirection: 'column', borderRadius: '10px' }}
          justifyContent={'center'}
        >
          <select value={selectedTimeFrame} onChange={handleTimeFrameChange}>
            <option value="hour">Last Hour</option>
            <option value="hour12">Last 12 Hours</option>
            <option value="day">Last 24 Hours</option>
            <option value="day2">Last 48 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
          <Line data={datac} options={options} />
          <Typography variant='subtitle1'>
          LATEST RECORDED LOG - <strong>{`${new Date(latest.LogTime.slice(0, -1))}`}</strong>
          </Typography>
          <Grid container spacing={2} onClick={handleOpen} justifyContent={'center'}>
            {/* First Card */}
            <Grid item xs={6}>
              <Card className='card' onClick={() => handleCardClick('Current Pressure')} sx={{ border: `5px solid ${borderColor.pressure}` }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'row' }}>
                  <Grid item container direction={'column'}>
                    <Typography variant="overline" fontSize={16}>
                      Current Pressure
                    </Typography>
                    <Typography variant="h4">
                      {latest.CurrentPressure ?? <strong style={{ 'color': 'red' }}>N/A</strong>} psi
                    </Typography>
                  </Grid>
                  <div style={{ width: '50%', height: '50%' }}> {/* Adjust percentage values as needed */}
                    <GaugeChart id="gauge-chart"
                      percent={latest.CurrentPressure / 600}
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

            {/* Second Card */}
            <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Card className='card' onClick={() => handleCardClick('Average Voltage')} sx={{ border: `5px solid ${borderColor.voltage}` }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'row' }}>
                  <Grid item container direction={'column'}>
                    <Typography variant="overline" fontSize={16}>
                      Voltage
                    </Typography>
                    <Typography variant="h4">
                      {latest.AverageVoltage ?? <strong style={{ 'color': 'red' }}>'N/A'</strong>} Volts
                    </Typography>
                  </Grid>
                  <div style={{ width: '50%', height: '50%' }}> {/* Adjust percentage values as needed */}
                    <GaugeChart id="gauge-chart"
                      percent={latest.AverageVoltage / 10}
                      cornerRadius={0.2}
                      arcWidth={0.4}
                      // nrOfLevels={420}
                      formatTextValue={(value) => value / 10 + 'V'}
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

          </Grid>
        </Box>

      </Modal>
      <Typography variant='h4' sx={{ textAlign: 'center', }}>
        {loggerName.split('_').pop().replaceAll('-', ' ')}
      </Typography>
      <Divider></Divider>
      <Grid container spacing={2} onClick={handleOpen} sx={{ paddingTop: '10px' }}>
        {/* First Card */}
        <Grid item xs={6} >
          <Card className='card' onClick={() => handleCardClick('Current Pressure')} sx={{ border: `5px solid ${borderColor.pressure}` }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'row' }}>
              <Grid item container direction={'column'}>
                <Typography variant='button'>
                  Pressure
                </Typography>
                <Typography variant='h6' fontWeight={'bolder'}>
                  {latest.CurrentPressure} psi
                </Typography>
              </Grid>
              <div style={{ width: '50%', height: '50%' }}> {/* Adjust percentage values as needed */}
                <GaugeChart id="gauge-chart"
                  percent={latest.CurrentPressure / 30}
                  cornerRadius={0.2}
                  arcWidth={0.4}
                  // nrOfLevels={420}
                  formatTextValue={(value) => value + 'V'}
                  arcsLength={[0.1, 0.1, 0.5, 0.1, 0.1]}
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
        <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Card className='card' onClick={() => handleCardClick('Average Voltage')} sx={{ border: `5px solid ${borderColor.voltage}` }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'row' }}>
              <Grid item container direction={'column'}>
                <Typography variant='button'>
                  Voltage
                </Typography>
                <Typography variant='h6' fontWeight={'bolder'}>
                  {latest.AverageVoltage} Volts
                </Typography>
              </Grid>
              <div style={{ width: '50%', height: '50%' }}> {/* Adjust percentage values as needed */}
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
                  hideText={true}
                />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default Pressure;