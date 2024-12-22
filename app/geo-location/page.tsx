'use client';

import { useEffect, useState } from 'react';
// import CustomMap from './CustomMap';
import LocationInfo from './components/LocationInfo';

type LocationData = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
};

const GeoLocationTest = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
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
        <>
          <LocationInfo
            latitude={location.latitude}
            longitude={location.longitude}
            accuracy={location.accuracy}
            timestamp={location.timestamp}
          />

          {/* Leaflet Map */}
          {/* <div className="mt-4 h-64 w-full rounded-md overflow-hidden">
            <CustomMap
              latitude={location.latitude}
              longitude={location.longitude}
              accuracy={location.accuracy}
            />
          </div> */}
        </>
      ) : (
        <p>Fetching location data...</p>
      )}
    </div>
  );
};

export default GeoLocationTest;
