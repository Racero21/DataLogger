import React, { useEffect, useState, useRef } from 'react';
import { Icon, divIcon,  } from 'leaflet';
import { MapContainer, TileLayer, Marker,  Tooltip,  } from 'react-leaflet';
import axios from 'axios';
import '../Map.css'
import { Button } from '@mui/material';

const markerIcon = new Icon({
  iconUrl:require("../img/meter.png"),
  iconSize:[30,30]
});

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
    
  useEffect(() => {
      (async () => {
        try {
            const loggerResponse = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/logger`);
            const logResponse = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/latest_logs`);
            setLoggerData(loggerResponse.data)
            setLogData(logResponse.data)
            console.log('loggerdata'+loggerData)
            console.log('loggerdata'+logData)
        } catch(e){
          setError('Error fetching data: ' + e.message);
        }
      })()
  },[]);

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
              💧 {logData[index].CurrentFlow} <em>m³/h</em><br></br>
              ⚡ {logData[index].AverageVoltage} <em>V</em>
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
