'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import LocationInfo from './components/LocationInfo';

// Dynamically import CustomMap with SSR disabled
const CustomMap = dynamic(() => import('../components/CustomMap'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-200 rounded-md flex items-center justify-center">Loading map...</div>
});

type LocationData = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
};

const GeoLocationTest = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Don't run on server

    const fetchLocation = () => {
      // Check if we're in a browser environment and geolocation is supported
      if (typeof window === 'undefined' || !navigator.geolocation) {
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
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000
        }
      );
    };

    fetchLocation();
  }, [isClient]);

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="p-4 border rounded-lg shadow-md bg-white">
        <h2 className="text-xl font-semibold mb-4">Location Leak Test</h2>
        <p>Loading...</p>
      </div>
    );
  }

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

          {/* Leaflet Map - Now enabled with dynamic import */}
          <div className="mt-4 h-64 w-full rounded-md overflow-hidden">
            <CustomMap
              latitude={location.latitude}
              longitude={location.longitude}
              accuracy={location.accuracy}
            />
          </div>
        </>
      ) : (
        <p>Fetching location data...</p>
      )}
    </div>
  );
};

export default GeoLocationTest;
