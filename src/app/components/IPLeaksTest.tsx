'use client';

import { useEffect, useState } from 'react';

type IPInfo = {
  ip: string; // IPv4 or IPv6 address
  isp: string; // ISP
  org: string; // Organization
  as: string; // Autonomous System
  city: string;
  regionName: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  timezone: string;
  rdapName: string; // Name from RDAP
  rdapHandle: string; // Handle from RDAP
};

const IPLeaksTest = () => {
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
  const [ipv6, setIpv6] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch IPv4 and IPv6 data
  useEffect(() => {
    const fetchIPData = async () => {
      try {
        // Fetch IPv4 Data
        const ipv4Response = await fetch('https://api.ipify.org?format=json');
        const ipv4Data = await ipv4Response.json();
        const ipAddress = ipv4Data.ip;

        // Fetch extended IP details
        const geoResponse = await fetch(`http://ip-api.com/json/${ipAddress}`);
        const geoData = await geoResponse.json();

        // Fetch RDAP Data
        const rdapResponse = await fetch(`https://rdap.db.ripe.net/ip/${ipAddress}`);
        const rdapData = await rdapResponse.json();

        // Parse RDAP name and handle
        const rdapName = rdapData.name || 'N/A';
        const rdapHandle = rdapData.handle || 'N/A';

        // Fetch IPv6 (if available)
        const ipv6Response = await fetch('https://api64.ipify.org?format=json');
        const ipv6Data = await ipv6Response.json();

        setIpInfo({
          ip: ipAddress,
          isp: geoData.isp,
          org: geoData.org,
          as: geoData.as,
          city: geoData.city,
          regionName: geoData.regionName,
          country: geoData.country,
          countryCode: geoData.countryCode,
          lat: geoData.lat,
          lon: geoData.lon,
          timezone: geoData.timezone,
          rdapName,
          rdapHandle,
        });

        setIpv6(ipv6Data.ip || null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch IP details. Please try again later.');
      }
    };

    fetchIPData();
  }, []);

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">IP Leak Test</h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : ipInfo ? (
        <div className="space-y-4">
          {/* Public IP */}
          <div>
            <p className="text-gray-700">
              <strong>Public IPv4:</strong>{' '}
              <span className="text-blue-600 font-mono">{ipInfo.ip}</span>
            </p>
            {ipv6 && (
              <p className="text-gray-700">
                <strong>Public IPv6:</strong>{' '}
                <span className="text-green-600 font-mono">{ipv6}</span>
              </p>
            )}
          </div>

          {/* Location and Country Flag */}
          <div className="flex items-center space-x-4">
            <img
              src={`https://flagcdn.com/w320/${ipInfo.countryCode.toLowerCase()}.png`}
              alt="Country flag"
              className="w-16 h-12 rounded shadow"
            />
            <div>
              <p className="text-gray-700">
                <strong>Location:</strong> {ipInfo.city}, {ipInfo.regionName}, {ipInfo.country}
              </p>
              <p className="text-gray-700">
                <strong>Latitude/Longitude:</strong> {ipInfo.lat}, {ipInfo.lon}
              </p>
            </div>
          </div>

          {/* ISP and Organization */}
          <div>
            <p className="text-gray-700">
              <strong>ISP:</strong> {ipInfo.isp}
            </p>
            <p className="text-gray-700">
              <strong>Organization:</strong> {ipInfo.org}
            </p>
            <p className="text-gray-700">
              <strong>AS:</strong> {ipInfo.as}
            </p>
          </div>

          {/* RDAP Information */}
          <div>
            <p className="text-gray-700">
              <strong>RDAP Name:</strong> {ipInfo.rdapName}
            </p>
            <p className="text-gray-700">
              <strong>RDAP Handle:</strong> {ipInfo.rdapHandle}
            </p>
          </div>

          {/* Timezone */}
          <div>
            <p className="text-gray-700">
              <strong>Timezone:</strong> {ipInfo.timezone}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Fetching IP details...</p>
      )}
    </div>
  );
};

export default IPLeaksTest;
