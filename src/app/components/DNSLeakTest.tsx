'use client';

import { useEffect, useState } from 'react';
import { FiServer, FiAlertCircle, FiCheckCircle, FiLoader, FiGlobe } from 'react-icons/fi';
import Shimmer from './Shimmer';
import { fetchDNSServers } from '../../../utils/dnsTestApi';
import Modal from './ModalComponent';

type DNSServer = {
  ip: string;
  isp: string;
  country: string;
  region: string;
  city: string;
  version: string; // IPv4 or IPv6
  link: string;
};

const DNSLeakTest = () => {
  const [ipv4, setIPv4] = useState<string | null>(null);
  const [ipv6, setIPv6] = useState<string | null>(null);
  const [dnsServers, setDNSServers] = useState<DNSServer[]>([]);
  const [currentTest, setCurrentTest] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);

  // DNS Test Endpoints
  const dnsTestEndpoints = [

    'https://ipv4.icanhazip.com',
    'https://ipv6.icanhazip.com',
    'https://icanhazip.com',
    'https://ipapi.co/json/',
    'https://api64.ipify.org?format=json',
    'https://ipinfo.io/json',
    'https://ifconfig.me/all.json',
    'https://api.ip.sb/geoip',
    'https://ipwhois.app/json/',
    'https://api.db-ip.com/v2/free/self',
    'https://api.ipify.org?format=json',
    'https://api64.ipify.org?format=json',
    'https://ipapi.co/json/',
    'https://jsonip.com/',
  ];
  const totalServers = dnsTestEndpoints.length;

  // Fetch Public IPv4 and IPv6 Addresses
  useEffect(() => {
    const fetchIPAddresses = async () => {
      try {
        const ipv4Res = await fetch('https://api.ipify.org?format=json');
        const ipv6Res = await fetch('https://api64.ipify.org?format=json');

        const ipv4Data = await ipv4Res.json();
        const ipv6Data = await ipv6Res.json();

        setIPv4(ipv4Data.ip);
        setIPv6(ipv6Data.ip);
      } catch (err) {
        console.error('Failed to fetch public IPs:', err);
        setError('Failed to fetch Public IPv4/IPv6 addresses.');
      }
    };

    fetchIPAddresses();
  }, []);

  // Test DNS Servers One by One
  useEffect(() => {
    const testDNSServers = async () => {
      setLoading(true);
      try {
        const servers: DNSServer[] = [];

        for (let i = 0; i < dnsTestEndpoints.length && i < totalServers; i++) {
          setCurrentTest(i + 1); // Track progress

          const data = await fetchDNSServers(dnsTestEndpoints[i]);

          if (data) {
            servers.push({
              ip: data.ip || data.query || data.ipAddress || data.ip_addr || data.query || data || 'N/A',
              isp: data.isp || 'Unknown ISP',
              country: data.country || 'Unknown',
              region: data.region || data.regionName || 'Unknown',
              city: data.city || 'Unknown',
              version: data.ip?.includes(':') ? 'IPv6' : 'IPv4',
              link: dnsTestEndpoints[i],
            });
          }

          setDNSServers([...servers]); // Update table progressively
          await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
        }
      } catch (err) {
        console.error(err);
        setError('Failed to test DNS servers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    testDNSServers();
  }, []);

  // Check for DNS Leak
  const hasDNSLeak = (): boolean => {
    if (dnsServers.length === 0) return false;
    const mainISP = dnsServers[0]?.isp;
    return dnsServers.some((server) => server.isp !== mainISP);
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h3 className="text-3xl font-bold text-blue-600 mb-6 flex items-center">
        <FiServer className="w-6 h-6 mr-2" /> DNS Leak Test
      </h3>

      {/* Public IPv4 and IPv6 */}
      <div className="p-4 bg-white rounded-lg shadow-md mb-4">
        <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-2">
          <FiGlobe className="w-5 h-5 mr-2 text-gray-500" /> Public IPs
        </h4>
        <p>
          <strong>IPv4:</strong> {ipv4 || <Shimmer />}
        </p>
        <p>
          <strong>IPv6:</strong> {ipv6 || <Shimmer />}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div>
          <p className="text-gray-600 mb-2">
            Testing DNS Server {currentTest} of {totalServers}...
          </p>
          <FiLoader className="animate-spin w-8 h-8 text-blue-500 mx-auto mb-4" />
        </div>
      )}

      {/* Results Table */}
      <table className="w-full table-auto border-collapse mt-4 bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">#</th>
            <th className="p-2 border">IP Address</th>
            <th className="p-2 border">ISP</th>
            <th className="p-2 border">Location</th>
            <th className="p-2 border">Version</th>
            <th className="p-2 border">Link</th>
          </tr>
        </thead>
        <tbody>
          {dnsServers.map((server, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="p-2 border">{index + 1 || <Shimmer />}</td>
              <td className="p-2 border">{server.ip || <Shimmer />}</td>
              <td className="p-2 border">{server.isp || <Shimmer />}</td>
              <td className="p-2 border">
                {server.city && server.region && server.country
                  ? `${server.city}, ${server.region}, ${server.country}`
                  : <Shimmer />}
              </td>

              <td className="p-2 border">{server.version || <Shimmer />}</td>
              <td className="p-2 border">{<Modal title={server.link} server={server.link} />}</td>



            </tr>
          ))}
          {loading && (
            <tr>
              <td colSpan={4} className="p-2 border text-center">
                <Shimmer />
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* DNS Leak Result */}
      {dnsServers.length > 0 && (
        <div className="mt-4">
          {hasDNSLeak() ? (
            <div className="text-red-600 flex items-center">
              <FiAlertCircle className="w-6 h-6 mr-2" />
              <p>⚠ DNS Leak Detected! Your DNS servers may not be secure.</p>
            </div>
          ) : (
            <div className="text-green-600 flex items-center">
              <FiCheckCircle className="w-6 h-6 mr-2" />
              <p>✅ No DNS Leak Detected. Your DNS servers are secure.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DNSLeakTest;
