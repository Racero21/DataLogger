import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function MyMap() {
  return (
    <MapContainer center={[13.5955, 123.2813]} zoom={13} style={{ height: '25vh', width: '75vh' }}>
      {/* style={{ height: '75vh', width: '100%' }}> */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[13.5955, 123.2813]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default MyMap;
