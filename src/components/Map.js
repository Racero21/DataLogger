import React, { useEffect, useMemo, useState } from 'react';
import { DivOverlay, Icon, divIcon, map } from 'leaflet';
import { MapContainer, TileLayer, Marker,  Tooltip,  } from 'react-leaflet';
import axios from 'axios';
import '../Map.css'
import { Padding } from '@mui/icons-material';

const markerIcon = new Icon({
  iconUrl:require("../img/meter.png"),
  iconSize:[30,30]
});

function MyMap() {
  const [loggerData, setLoggerData] = useState([]);
  const [logData, setLogData] = useState([]);
  const [error, setError] = useState(null);


  useEffect(() => {
      (async () => {
        try {
            const response = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/logger`);
            // const data = response.data;
            setLoggerData(response.data)
        } catch(e){
          setError('Error fetching data: ' + e.message);
        }
      })()
  },[]);
  
  useEffect(() => {
      (async () => {
        try {
            const response = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/latest_logs`);
            setLogData(response.data)
            console.log(logData)
        } catch(e){
          setError('Error fetching data: ' + e.message);
        }
      })()
  },[loggerData]);

  return (
    <MapContainer center={[13.58438280013, 123.2738403740]} zoom={15} maxZoom={17} minZoom={13.5} style={{ height: '80vh', }} maxBounds={[[13.649076, 123.167956], [13.494945, 123.387211]]}>
      <TileLayer
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
            <div>
              <strong>
              💧 {logData[index]['CurrentFlow']} <em>m³/h</em><br></br>
              ⚡ {logData[index]['AverageVoltage']} <em>V</em>
              </strong>
            </div>
          </Tooltip>
        </Marker>
        </div>
      ))}

    </MapContainer>
  );
}

export default MyMap;
