import React, { useEffect, useState, useRef } from 'react';
import { Icon, divIcon } from 'leaflet';
import { MapContainer, TileLayer, Marker, Tooltip, Popup } from 'react-leaflet';
import ResetViewControl from '@20tab/react-leaflet-resetview'
import axios from 'axios';
import '../Map.css'
import Charts from './Chart';
import "chart.js/auto";
import Pressure from './Pressure';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { Typography } from '@mui/material';

const markerIcon = new Icon({
  iconUrl: require("../img/meter.png"),
  iconSize: [30, 30],
  // className:'blinking'
});

const pollInterval = 5000

function lerp(min, max, val) {
  return Math.max(0, Math.round(((val - min) / (max - min)) * 100))
}

function batteryPercentQ(curVoltage) {
  // Quadratic Regression Model for 3.2 V LiFePo4 battery
  const a = 5.93, b = -35.26, c = 52.41
  return Math.ceil(((a * curVoltage ** 2) + b * curVoltage + c) * 100)
}

function batteryPercentL(curVoltage) {
  // Logarithmic Regression Model for 3.2 V LiFePo4 battery
  const a = 8, b = -8.75
  return Math.ceil(((a * Math.log(curVoltage)) + b) * 100)
}

function MyMap() {
  const [loggerData, setLoggerData] = useState([]);
  const [logData, setLogData] = useState([]);
  const [mapUrl, setMapUrl] = useState("osm") // ["osm", "satellite"]
  const [darkMode, setDarkMode] = useState(false)
  const [error, setError] = useState(null);

  const mapOsm = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const mapSatellite = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

  const onClick = () => {
    setMapUrl((mapUrl) => (
      mapUrl === "osm" ? "satellite" : "osm"
    ))
    setDarkMode(darkMode ? false : true)
    console.log(darkMode ? "light mode" : "dark mode")

  };

  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setUrl(mapUrl === "osm" ? mapOsm : mapSatellite);
    }
  }, [mapUrl])

  useEffect(() => {
    let count = 0
    let dataTimeout = null;
    const fetchData = async (init) => {
      const loggerResponse = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/logger`);
      const logResponseFlow = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/latest_log/flow`).catch((error) => console.log(error.toJSON));
      const logResponsePres = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/latest_log/pressure`).catch((error) => console.log(error.toJSON));
      const tempLogData = logResponseFlow.data.concat(logResponsePres.data);
      const logData = new Map();
      tempLogData.forEach((element, index) => {
        logData.set(element.LoggerId, element)
        // console.log(logData)
      });
      setLoggerData(loggerResponse.data)
      setLogData(logData)
      count += 1
      console.log('count', count)
      if (!init) dataTimeout = setTimeout(fetchData, pollInterval)
    }
    // Initial Setup
    fetchData(true)
    // Setup log data polling
    dataTimeout = setTimeout(fetchData, pollInterval)
    return () => clearTimeout(dataTimeout)
  }, [])

  useEffect(() => {
    const iconElements = document.querySelectorAll('.blinking');

  })

  return (
    <>
      <MapContainer center={[13.58438280013, 123.2738403740]} zoom={13.5} maxZoom={17} minZoom={13} style={{ height: '80vh', }} maxBounds={[[13.649076, 123.167956], [13.494945, 123.387211]]}>
        <ResetViewControl title="Reset View" icon={"🔎"} />
        <Box onClick={onClick} sx={{ '& > :not(style)': { my: 5, mx: 1, display: 'flex' } }}>
          <Fab color="primary" aria-label="add" sx={{ boxSizing: 'border-box', position: "absolute", bottom: (theme) => '0%', right: (theme) => theme.spacing(2) }}>
            <DarkModeOutlinedIcon />
          </Fab>
        </Box>

        <TileLayer
          ref={mapRef}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {loggerData.map((item, index) => (
          <div key={index}>
            <Marker position={[item.Latitude, item.Longitude]} icon={markerIcon} riseOnHover={true}>
              {/* {String(item.Name).toLowerCase().includes('pressure') ? <Pressure id={item.LoggerId} name={item.Name} /> : <Charts id={item.LoggerId} name={item.Name} />} */}

              <Tooltip permanent direction='bottom' offset={[0, 10]} >
                <div className={darkMode ? "pslabel-dark" : "pslabel-light"}>
                  {item.Name.split('_').pop().replaceAll('-', ' ')}
                </div>
              </Tooltip>
              <Popup minWidth={400}>
                {String(item.Name).toLowerCase().includes('pressure') ? <Pressure id={item.LoggerId} name={item.Name} showGauge={false} /> : <Charts id={item.LoggerId} name={item.Name} showGauge={false} />}
              </Popup>
            </Marker>
            <Marker position={[item.Latitude, item.Longitude]} icon={new divIcon({ iconSize: [0, 0] })} zIndexOffset={-1}>
              <Tooltip sticky permanent direction='top' offset={[0, -10]}>
                <div key={index} style={{ 'textAlign': 'center' }}>
                  {/* <strong style={{ 'fontSize': '1.125em' }}> */}
                  <Typography variant='h4' fontSize={14} fontWeight={'bolder'} p={.5}>
                    {logData?.get(item.LoggerId)?.CurrentPressure ?
                      <> {(logData.get(item.LoggerId).CurrentPressure < item.PressureLimit.split(',')[0]) || (logData.get(item.LoggerId).CurrentPressure > item.PressureLimit.split(',')[1]) ?
                        <span className='blinking'>🕒 {logData?.get(item.LoggerId)?.CurrentPressure} <em>psi</em><br></br></span> :
                        <> 🕒 {logData?.get(item.LoggerId)?.CurrentPressure} <em>psi</em><br></br></>}</> : ''}
                    {logData?.get(item.LoggerId)?.CurrentFlow ? <> 💧 {logData.get(item.LoggerId).CurrentFlow} <em>lps</em><br></br> </> : ''}
                    {/* {logData?.get(item.LoggerId)?.AverageVoltage ? <> ⚡ {logData.get(item.LoggerId).AverageVoltage} <em>V</em> </> : ''} */}
                    {/* {logData?.get(item.LoggerId)?.AverageVoltage? <> 🔋 {lerp(2.8,3.4,logData?.get(item.LoggerId)?.AverageVoltage)} <em>%</em><br></br> </>:''} */}
                    {logData?.get(item.LoggerId)?.AverageVoltage ?
                      <> {(logData.get(item.LoggerId)?.AverageVoltage < 3.04) || (logData.get(item.LoggerId)?.AverageVoltage > 3.3) ?
                        <span className='blinking'>🔋 {batteryPercentL(logData?.get(item.LoggerId)?.AverageVoltage)} <em>%</em><br></br> </span> :
                        <> 🔋 {batteryPercentL(logData?.get(item.LoggerId)?.AverageVoltage)} <em>%</em><br></br></>}</> : ''}
                  </Typography>
                  {/* </strong> */}
                </div>
              </Tooltip>
            </Marker>
          </div>
        ))}
      </MapContainer>
    </>
  );
}

export default MyMap;
