'use client';

import { useEffect, useState } from 'react';

type DNSInfo = {
  status: string;
  query: string;
  isp: string;
  org: string;
  as: string;
  city: string;
  region: string;
  regionName: string;
  country: string;
  countryCode: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
};

const DNSLeakTest = () => {
  const [dnsInfo, setDnsInfo] = useState<DNSInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDNSInfo = async () => {
      try {
        const response = await fetch('http://ip-api.com/json');
        if (!response.ok) {
          throw new Error(`Failed to fetch DNS info: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.status === 'success') {
          setDnsInfo(data);
        } else {
          throw new Error('Failed to retrieve DNS information');
        }
      } catch (err) {
        setError('Failed to fetch DNS information. Please try again.');
        console.error(err);
      }
    };

    fetchDNSInfo();
  }, []);

  return (
    <div className="p-5 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">DNS Leak Test</h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : dnsInfo ? (
        <div className="grid grid-cols-2 gap-4 text-gray-700 text-sm">
          <div>
            <span className="font-semibold">IP Address:</span> {dnsInfo.query}
          </div>
          <div>
            <span className="font-semibold">ISP:</span> {dnsInfo.isp}
          </div>
          <div>
            <span className="font-semibold">Organization:</span> {dnsInfo.org}
          </div>
          <div>
            <span className="font-semibold">AS:</span> {dnsInfo.as}
          </div>
          <div>
            <span className="font-semibold">City:</span> {dnsInfo.city}
          </div>
          <div>
            <span className="font-semibold">Region:</span> {dnsInfo.regionName} ({dnsInfo.region})
          </div>
          <div>
            <span className="font-semibold">Country:</span> {dnsInfo.country} ({dnsInfo.countryCode})
          </div>
          <div>
            <span className="font-semibold">Zip Code:</span> {dnsInfo.zip}
          </div>
          <div>
            <span className="font-semibold">Latitude:</span> {dnsInfo.lat}
          </div>
          <div>
            <span className="font-semibold">Longitude:</span> {dnsInfo.lon}
          </div>
          <div>
            <span className="font-semibold">Timezone:</span> {dnsInfo.timezone}
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Fetching DNS information...</p>
      )}
    </div>
  );
};

export default DNSLeakTest;
