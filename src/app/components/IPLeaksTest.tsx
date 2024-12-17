'use client';

import { useEffect, useState } from 'react';

const IPLeaksTest = () => {
  const [ip, setIp] = useState<string | null>(null);

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) throw new Error(`Error fetching IP: ${response.statusText}`);
        const data = await response.json();
        setIp(data.ip);
      } catch (error) {
        console.error('Error fetching IP:', error);
      }
    };

    fetchIP();
  }, []);

  return (
    <div className="p-5 border rounded-lg shadow bg-white">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">IP Leak Test</h2>
      <p className="text-gray-600">Your Public IP Address:</p>
      <p className="text-blue-600 font-mono text-lg mt-2">{ip || 'Loading...'}</p>
    </div>
  );
};

export default IPLeaksTest;
