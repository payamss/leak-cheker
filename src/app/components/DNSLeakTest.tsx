'use client';

import { useEffect, useState } from 'react';

type DNSInfo = {
  isp: string;
  query: string; // IP address
  country: string;
  regionName: string;
  city: string;
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
        setDnsInfo(data);
      } catch (err) {
        setError('Failed to fetch DNS information.');
        console.error(err);
      }
    };

    fetchDNSInfo();
  }, []);

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-2">DNS Leak Test</h2>
      {error && <p className="text-red-500">{error}</p>}
      {dnsInfo ? (
        <div className="text-sm space-y-2">
          <p>
            <strong>IP Address:</strong> {dnsInfo.query}
          </p>
          <p>
            <strong>ISP:</strong> {dnsInfo.isp}
          </p>
          <p>
            <strong>Location:</strong> {dnsInfo.city}, {dnsInfo.regionName}, {dnsInfo.country}
          </p>
        </div>
      ) : (
        <p>Loading DNS information...</p>
      )}
    </div>
  );
};

export default DNSLeakTest;
