'use client';

import { useEffect, useState } from 'react';
import { FiServer, FiAlertCircle, FiGlobe, FiCheckCircle } from 'react-icons/fi';
import Shimmer from './Shimmer';
import { fetchDNSServers } from '../../../utils/dnsTestApi';
import Modal from './ModalComponent';
import CountryFlag from './CountrlFlagComponent';

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
  const [currentLink, setCurrentLink] = useState<string>(''); // Current endpoint link
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
    // 'https://api.ip.sb/geoip',
    // 'https://ipwhois.app/json/',
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
          setCurrentTest(i + 1);
          setCurrentLink(dnsTestEndpoints[i]); // Track current link

          const data = await fetchDNSServers(dnsTestEndpoints[i]);

          if (data) {
            servers.push({
              ip: data.ip || data.query || data.ipAddress || data.ip_addr || data || 'N/A',
              isp: data.isp || 'Unknown ISP',
              country: data.country || 'Unknown',
              region: data.region || data.regionName || 'Unknown',
              city: data.city || 'Unknown',
              version: data.ip?.includes(':') ? 'IPv6' : 'IPv4',
              link: dnsTestEndpoints[i],
            });
          }

          setDNSServers([...servers]);
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
  const hasDNSLeak = (): { leakDetected: boolean; reason: string } => {
    if (!dnsServers.length) return { leakDetected: false, reason: '' };

    const mainISP = dnsServers[0]?.isp || '';
    // const mainCountry = dnsServers[0]?.country || '';
    const uniqueISPs = new Set(dnsServers.map((server) => server.isp));
    const uniqueCountries = new Set(dnsServers.map((server) => server.country));

    // Logic for detecting leaks
    if (uniqueISPs.size > 1) {
      return {
        leakDetected: true,
        reason: 'Multiple ISPs detected. Your DNS requests are being resolved by different providers, which indicates a DNS leak.',
      };
    }

    if (uniqueCountries.size > 1) {
      return {
        leakDetected: true,
        reason: 'DNS servers are located in multiple countries, which is inconsistent with your VPN/proxy configuration.',
      };
    }

    if (mainISP.includes('Unknown') || mainISP.includes('ISP')) {
      return {
        leakDetected: true,
        reason: 'DNS requests are being resolved by your ISP, bypassing your VPN or secure DNS settings.',
      };
    }

    return { leakDetected: false, reason: '' };
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

      {/* Progress Bar */}
      {loading && (
        <div className="mb-4">
          <p className="text-gray-600 mb-2 text-sm">
            Testing DNS Server {currentTest} of {totalServers}...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: `${(currentTest / totalServers) * 100}%` }}
            ></div>
          </div>
          <p className="text-gray-500 mt-2 text-sm text-center">
            Current Server: {currentLink}
          </p>
        </div>
      )}

      {/* DNS Leak Result */}
      {dnsServers.length > 0 && (
        <div className="mt-4">
          {(() => {
            const { leakDetected, reason } = hasDNSLeak();
            return leakDetected ? (
              <div className="text-red-600 flex items-center mb-4">
                <FiAlertCircle className="w-6 h-6 mr-2" />
                <p>⚠ DNS Leak Detected! {reason}</p>
              </div>
            ) : (
              <div className="text-green-600 flex items-center mb-4">
                <FiCheckCircle className="w-6 h-6 mr-2" />
                <p>✅ No DNS Leak Detected. Your DNS servers are secure.</p>
              </div>
            );
          })()}
        </div>
      )}


      {/* Results Table */}
      <table className="w-full table-auto border-collapse mt-4 bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">#</th>
            <th className="p-2 border">Loc</th>
            <th className="p-2 border">IP Address</th>
            <th className="p-2 border">ISP</th>
            <th className="p-2 border">Location</th>
            <th className="p-2 border">Version</th>
            <th className="p-2 border">Link</th>
          </tr>
        </thead>
        <tbody>
          {dnsServers.map((server, index) => {
            const isLeak = dnsServers[0]?.isp !== server.isp; // Compare with reference ISP
            return (
              <tr
                key={index}
                className={`hover:bg-yellow-200 ${isLeak ? 'bg-red-100' : 'bg-white' // Highlight leak rows
                  }`}
              >
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border"><CountryFlag ip={server.ip} /></td>
                <td className="p-2 border">{server.ip}</td>
                <td className="p-2 border">{server.isp}</td>
                <td className="p-2 border">
                  {`${server.city}, ${server.region}, ${server.country}`}
                </td>
                <td className="p-2 border">{server.version}</td>
                <td className="p-2 border">
                  <Modal title={server.link} server={server.link} />
                </td>
              </tr>
            );
          })}
        </tbody>

      </table>
    </div>
  );
};

export default DNSLeakTest;
