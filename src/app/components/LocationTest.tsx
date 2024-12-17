'use client';

import { useEffect, useState } from 'react';

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
      <h2 className="text-xl font-semibold mb-2">Location Leak Test</h2>
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
        </div>
      ) : (
        <p>Fetching location data...</p>
      )}
    </div>
  );
};

export default LocationTest;
