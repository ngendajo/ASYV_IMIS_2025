import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const AlumniLocationMap = ({ data }) => {
  return (
    <MapContainer
      center={[0, 20]}
      zoom={2}
      scrollWheelZoom={false}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {data.map((entry, index) => (
        <CircleMarker
          key={index}
          center={[entry.lat, entry.lon]}
          radius={5 + Math.log(entry.count) * 2} // adjust size based on count
          color="blue"
          fillOpacity={0.5}
        >
          <Tooltip direction="top" offset={[0, -5]} opacity={1} permanent>
            <div style={{ textAlign: 'center' }}>
              <strong>{entry.country}</strong><br />
              {entry.count} alumni
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default AlumniLocationMap;
