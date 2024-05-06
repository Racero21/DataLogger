import React, { Component, useEffect, useState, useRef } from 'react';
import { Icon, divIcon,  } from 'leaflet';
import { MapContainer, TileLayer, Marker,  Tooltip,  } from 'react-leaflet';
import axios from 'axios';
import '../Map.css'
import { Button } from '@mui/material';

const markerIcon = new Icon({
  iconUrl:require("../img/meter.png"),
  iconSize:[30,30]
});

const pollInterval = 1000

function MyMap() {
  const [loggerData, setLoggerData] = useState([]);
  const [logData, setLogData] = useState([]);
  const [mapUrl, setMapUrl] = useState("osm") // ["osm", "satellite"]
  const [error, setError] = useState(null);

  const mapOsm = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const mapSatellite = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

  const onClick = () => {
    setMapUrl((mapUrl) => (mapUrl === "osm" ? "satellite" : "osm"))
  };
  
  const mapRef = useRef(null);

  useEffect(() => {
    if(mapRef.current) {
      mapRef.current.setUrl(mapUrl === "osm" ? mapOsm : mapSatellite);
    }
  }, [mapUrl])


  
  // Initial Setup    
  useEffect(() => {
      (async () => {
        try {
            const loggerResponse = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/logger`);
            const logResponseFlow = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/latest_log/flow`);
            const logResponsePres = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/latest_log/pressure`);
            const tempLogData = logResponseFlow.data.concat(logResponsePres.data);
            const logData = new Map();
            tempLogData.forEach((element,index)=> {
              logData.set(element.LoggerId, element)
              console.log(logData)
            });
            setLoggerData(loggerResponse.data)
            setLogData(logData)
        } catch(e){
          setError('Error fetching data: ' + e.message);
        }
      })()
  },[]);

  // Setup log data polling
  useEffect(() => {
    let count = 0
    let dataTimeout = null;
    const fetchData = async() => {
      const logResponseFlow = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/latest_log/flow`).catch((error) => console.log(error.toJSON));
      const logResponsePres = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/latest_log/pressure`).catch((error) => console.log(error.toJSON));
      const tempLogData = logResponseFlow.data.concat(logResponsePres.data);
      const logData = new Map();
      tempLogData.forEach((element,index)=> {
        logData.set(element.LoggerId, element)
        console.log(logData)
      });
      // const logResponse = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/latest_log/flow`)
      //   .catch((error) => console.log(error.toJSON))
      setLogData(logData)
      count += 1
      console.log('count',count)
      dataTimeout = setTimeout(fetchData, pollInterval)
    }
    dataTimeout = setTimeout(fetchData, pollInterval)
    return () => clearTimeout(dataTimeout)
  },[])
  
  return (
    <>
    <Button onClick={onClick}>Switch Map Type</Button>
    <MapContainer center={[13.58438280013, 123.2738403740]} zoom={15} maxZoom={17} minZoom={13.5} style={{ height: '80vh', }} maxBounds={[[13.649076, 123.167956], [13.494945, 123.387211]]}>
      <TileLayer
        ref={mapRef}
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {loggerData.map((item, index) => (
        <div key={index}>
        <Marker position={[item.Latitude, item.Longitude]} icon={markerIcon}>
          <Tooltip permanent direction='bottom' offset={[0,10]}>
            <div>
              {item.Name.split('_').pop().replace('-',' ')}
            </div>
          </Tooltip>
        </Marker>
        <Marker position={[item.Latitude, item.Longitude]} icon={new divIcon({iconSize:[0,0]})}>
          <Tooltip sticky permanent direction='top' offset={[0,-10]}>
            <div key={index}>
              <strong>
              💧 {logData?.get(item.LoggerId)?.CurrentFlow} <em>m³/h</em><br></br>
              🕒 {logData?.get(item.LoggerId)?.CurrentPressure} <em>psi</em><br></br>
              ⚡ {logData?.get(item.LoggerId)?.AverageVoltage} <em>V</em><br></br>
              </strong>
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
