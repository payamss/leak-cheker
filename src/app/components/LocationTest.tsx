'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import Leaflet and marker icon files
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Define a custom Leaflet icon
const customIcon = new L.Icon({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIconRetina.src,
  shadowUrl: markerShadow.src,
  iconSize: [25, 41], // Marker size: width, height
  iconAnchor: [12, 41], // Anchor point (bottom center of the marker)
  popupAnchor: [1, -34], // Popup position relative to the icon
  shadowSize: [41, 41], // Shadow size
});

type LocationInfo = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
};

const LocationTest = () => {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setLocation({
            latitude,
            longitude,
            accuracy,
            timestamp: new Date(position.timestamp).toLocaleString(),
          });
        },
        (err) => {
          setError(`Error fetching location: ${err.message}`);
        }
      );
    };

    fetchLocation();
  }, []);

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4">Location Leak Test</h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : location ? (
        <div className="text-sm space-y-2">
          <p>
            <strong>Latitude:</strong> {location.latitude}
          </p>
          <p>
            <strong>Longitude:</strong> {location.longitude}
          </p>
          <p>
            <strong>Accuracy:</strong> {location.accuracy} meters
          </p>
          <p>
            <strong>Timestamp:</strong> {location.timestamp}
          </p>

          {/* Leaflet Map */}
          <div className="mt-4 h-64 w-full rounded-md overflow-hidden">
            <MapContainer
              center={[location.latitude, location.longitude] as LatLngExpression}
              zoom={15}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Marker at User's Location */}
              <Marker
                position={[location.latitude, location.longitude] as LatLngExpression}
                icon={customIcon}
              >
                <Popup>Your current location</Popup>
              </Marker>

              {/* Accuracy Circle */}
              <Circle
                center={[location.latitude, location.longitude] as LatLngExpression}
                radius={location.accuracy} // Radius in meters
                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
              />
            </MapContainer>
          </div>
        </div>
      ) : (
        <p>Fetching location data...</p>
      )}
    </div>
  );
};

export default LocationTest;
