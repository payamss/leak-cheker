'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Marker Icon imports
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIconRetina.src,
  shadowUrl: markerShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type CustomMapProps = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

const CustomMap = ({ latitude, longitude, accuracy }: CustomMapProps) => {
  return (
    <MapContainer
      center={[latitude, longitude] as LatLngExpression}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution=''
      />

      <Marker position={[latitude, longitude] as LatLngExpression} icon={customIcon}>
        <Popup>Your current location</Popup>
      </Marker>

      <Circle
        center={[latitude, longitude] as LatLngExpression}
        radius={accuracy}
        pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
      />
    </MapContainer>
  );
};

export default CustomMap;
