import React, { useEffect, useMemo, useState } from 'react';
import { DivOverlay, Icon, divIcon } from 'leaflet';
import { MapContainer, TileLayer, Marker,  Tooltip,  } from 'react-leaflet';
import axios from 'axios';
import '../Map.css'
import { Padding } from '@mui/icons-material';

const markerIcon = new Icon({
  iconUrl:require("../img/meter.png"),
  iconSize:[30,30]
});

function MyMap() {
  const [mapData, setMapData] = useState([]);
  const [logData, setLogData] = useState([]);

  useEffect(() =>{
      axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/logger`)
      .then(response => {
        setMapData(response.data);
      })
      .catch(error =>{
        console.error("Error Fetching data:", error);
      });
  }, [mapData]);

  return (
    <MapContainer center={[13.58438280013, 123.2738403740]} zoom={15} maxZoom={17} minZoom={13.5} style={{ height: '80vh', }} maxBounds={[[13.649076, 123.167956], [13.494945, 123.387211]]}>
      {/* style={{ height: '75vh', width: '100%' }}> */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {mapData.map((item, index) => (
        <div>
        <Marker position={[item.Latitude, item.Longitude]} icon={markerIcon}>
          {/* <DivOverlay content={()=>{<div>test</div>}}></DivOverlay> */}
          <Tooltip permanent direction='bottom' offset={[0,10]}>
            <div id={item.Name+'tooltip'}>
              {item.Name}
            </div>
          </Tooltip>
        </Marker>
        <Marker position={[item.Latitude, item.Longitude]} icon={new divIcon({iconSize:[0,0]})}>
          <Tooltip sticky permanent direction='top' offset={[0,-10]}>
            <div >
              <strong>
              💧 320.5 <em>m³/h</em><br></br>
              ⚡ 3.15 <em>V</em>
              </strong>
            </div>
            <div id={item.Name+'tooltip'}>
              {/* {item.Name} */}
            </div>
          </Tooltip>
        </Marker>
        </div>
      ))}

    </MapContainer>
  );
}

export default MyMap;
