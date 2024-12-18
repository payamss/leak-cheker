'use client';

import { useEffect, useState } from 'react';
import { FiServer, FiAlertCircle, FiGlobe, FiCheckCircle, FiPlay, FiLoader } from 'react-icons/fi';
import Shimmer from './Shimmer';
import { fetchDNSServers } from '../../../utils/dnsTestApi';

import React from 'react';
import DNSLeakInfoBox from './DNSLeakInfoBox';
import CountryFlag from './CountrlFlagComponent';
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
  const [referenceServer, setReferenceServer] = useState<DNSServer | null>(null);
  const [dnsServers, setDNSServers] = useState<DNSServer[]>([]);
  const [currentTest, setCurrentTest] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentLink, setCurrentLink] = useState<string>(''); // Current endpoint link
  const [, setError] = useState<string | null>(null);
  const [isTestStarted, setIsTestStarted] = useState<boolean>(false); // New state

  const dnsTestEndpoints = [
    'https://ipv4.icanhazip.com',
    'https://ipv6.icanhazip.com',
    'https://icanhazip.com',
    'https://ipinfo.io/json',
    'https://ifconfig.me/all.json',
    'https://api.ip.sb/geoip',
    'https://ipwhois.app/json/',
    'https://api.ip.sb/geoip',
    'https://ipwhois.app/json/',
    'https://api.db-ip.com/v2/free/self',
    'https://api.ipify.org?format=json',
    'https://jsonip.com/',
  ];
  const totalServers = dnsTestEndpoints.length;


  useEffect(() => {
    const fetchIPAddresses = async () => {

      if (typeof window === 'undefined') {
        return; // Skip fetching on the server
      }


      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipResData = await ipRes.json();

        setReferenceServer({
          ip: ipResData.ip,
          isp: ipResData.org || ipResData.isp || 'Unknown ISP',
          country: ipResData.country_name || ipResData.country || 'Unknown',
          region: ipResData.region || 'Unknown',
          city: ipResData.city || 'Unknown',
          version: ipResData.ip.includes(':') ? 'IPv6' : 'IPv4',
          link: 'https://ipapi.co/json/',
        });


      } catch (err) {
        console.error('Failed to fetch public IP from https://ipapi.co/json/:', err);
        // setError('Failed to fetch Public IPv4 addresses.');
        try {
          const ipRes = await fetch('https://api64.ipify.org?format=json');
          const ipResData = await ipRes.json();
          setReferenceServer({
            ip: ipResData.ip,
            isp: ipResData.org || ipResData.isp || 'Unknown ISP',
            country: ipResData.country_name || ipResData.country || 'Unknown',
            region: ipResData.region || ipResData.regionName || 'Unknown',
            city: ipResData.city || 'Unknown',
            version: ipResData.ip.includes(':') ? 'IPv6' : 'IPv4',
            link: 'https://ipapi.co/json/',
          });
        } catch (err) {
          console.error('Failed to fetch public IP from :https://api64.ipify.org?format=json', err);
          //  setError('Failed to fetch Public IPv6 addresses.');
        }

      }

    };

    fetchIPAddresses();
  }, []);

  // Test DNS Servers

  const testDNSServers = async () => {
    setLoading(true);
    try {
      const servers: DNSServer[] = [];
      for (let i = 0; i < dnsTestEndpoints.length; i++) {
        setCurrentTest(i + 1);
        setCurrentLink(dnsTestEndpoints[i]);

        try {
          const data = await fetchDNSServers(dnsTestEndpoints[i]);

          if (data) {
            servers.push({
              ip: data.ip || data.query || data.ipAddress || data.ip_addr || data || 'N/A',
              isp: data.org || data.isp || 'Unknown ISP',
              country: data.country_name || data.country || 'Unknown',
              region: data.region || data.regionName || 'Unknown',
              city: data.city || 'Unknown',
              version: (data.ip || data.query || data.ipAddress || data.ip_addr || data)?.includes(':') ? 'IPv6' : 'IPv4',
              link: dnsTestEndpoints[i],
            });
          }

          setDNSServers([...servers]);
        } catch (err) {
          console.error(err);

        }
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
      }
    } catch (err) {
      console.error(err);
      setError('Failed to test DNS servers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger DNS Leak Test when `isTestStarted` becomes true
  useEffect(() => {
    if (referenceServer && !referenceServer.ip) return;

    if (isTestStarted) {
      testDNSServers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTestStarted, referenceServer]);

  // Check for DNS Leak and provide reasoning
  const getLeakReason = (server: DNSServer): { reasons: string[]; severity: 'critical' | 'warning' | null } => {
    const reasons: string[] = [];
    let severity: 'critical' | 'warning' | null = null;

    if (!referenceServer || !referenceServer.ip) {
      reasons.push('Reference server is not set or invalid.');
      severity = 'critical';
      return { reasons, severity };
    }

    const normalizeIP = (ip: string) => ip.trim();

    // Warning: Version mismatch
    if (referenceServer.version !== server.version) {
      reasons.push(`IP version mismatch: Expected ${referenceServer.version}, but got ${server.version}.`);
      severity = severity || 'warning';
      return { reasons, severity };
    }

    // Critical: IP mismatch
    if (normalizeIP(referenceServer.ip) !== normalizeIP(server.ip)) {
      reasons.push(`IP mismatch: Expected [${normalizeIP(referenceServer.ip)}], but got [${normalizeIP(server.ip)}].`);
      severity = 'critical';
    }

    // Warning: ISP mismatch
    if (
      server.isp !== 'Unknown ISP' &&
      referenceServer.isp !== 'Unknown ISP' &&
      referenceServer.isp !== server.isp
    ) {
      reasons.push(`ISP mismatch: Expected [${referenceServer.isp}], but got [${server.isp}].`);
      severity = severity || 'warning';
    }

    // Warning: Country mismatch
    if (
      server.country !== 'Unknown' &&
      referenceServer.country !== 'Unknown' &&
      server.country !== referenceServer.country
    ) {
      reasons.push(`Country mismatch: Expected ${referenceServer.country}, but got ${server.country}.`);
      severity = severity || 'warning';
    }

    // Warning: City mismatch
    if (
      server.city !== 'Unknown' &&
      referenceServer.city !== 'Unknown' &&
      server.city !== referenceServer.city
    ) {
      reasons.push(`City mismatch: Expected ${referenceServer.city}, but got ${server.city}.`);
      severity = severity || 'warning';
    }

    // Warning: Region mismatch
    if (
      server.region !== 'Unknown' &&
      referenceServer.region !== 'Unknown' &&
      server.region !== referenceServer.region
    ) {
      reasons.push(`Region mismatch: Expected ${referenceServer.region}, but got ${server.region}.`);
      severity = severity || 'warning';
    }

    return { reasons, severity };
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-xl">
      <h3 className="text-3xl font-bold text-blue-600 mb-6 flex items-center">
        <FiServer className="w-6 h-6 mr-2" /> DNS Leak Test
      </h3>

      {/* Expandable Info Box */}
      <DNSLeakInfoBox />

      {/* Public IPv4 and IPv6 */}
      <div className="p-4 bg-white rounded-lg shadow-md mb-4 space-y-4">
        {referenceServer ? (
          <>
            <h4 className="text-lg font-semibold text-gray-700 flex flex-wrap items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center">
                <FiGlobe className="w-5 h-5 mr-2 text-gray-500" /> Public IPs
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div>Run Test</div>
                <button
                  onClick={() => setIsTestStarted(true)}
                  className="px-4 py-3 bg-blue-600 text-white hover:bg-blue-500 transition rounded-full flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <FiLoader className="animate-spin text-white w-5 h-5" />
                  ) : (
                    <FiPlay className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </h4>
            <div>
              <strong>IP:</strong> {referenceServer.ip || <Shimmer />}
            </div>
            {referenceServer.isp && (
              <div>
                <strong>ISP:</strong> {referenceServer.isp}
              </div>
            )}
            {referenceServer.country && (
              <div>
                <strong>Country:</strong> {referenceServer.country}
              </div>
            )}
          </>
        ) : (
          <Shimmer text="Loading Reference Server ..." />
        )}
      </div>

      {/* Progress Bar */}
      {loading && (
        <div className="mb-4">
          <div className="text-gray-600 mb-2 text-sm">
            Testing DNS Server {currentTest} of {totalServers}...
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: `${(currentTest / totalServers) * 100}%` }}
            ></div>
          </div>
          <div className="text-gray-500 mt-2 text-sm text-center">
            Current Server: {currentLink}
          </div>
        </div>
      )}

      {/* DNS Leak Result */}
      {dnsServers.length > 0 && (
        <div className="mt-4">
          {dnsServers.some((server) => {
            const { severity } = getLeakReason(server);
            return severity === 'critical';
          }) ? (
            // Critical Leak Detected
            <div className="text-red-600 flex items-center mb-4">
              <FiAlertCircle className="w-6 h-6 mr-2" />
              <div>⚠ DNS Leak Detected! Critical issues found. Check the rows below for details.</div>
            </div>
          ) : dnsServers.some((server) => {
            const { severity } = getLeakReason(server);
            return severity === 'warning';
          }) ? (
            // Warning Only
            <div className="text-yellow-600 flex items-center mb-4">
              <FiAlertCircle className="w-6 h-6 mr-2" />
              <div>⚠ DNS Leak Warning! Non-critical issues found. Review the rows below.</div>
            </div>
          ) : (
            // No Leak Detected
            <div className="text-green-600 flex items-center mb-4">
              <FiCheckCircle className="w-6 h-6 mr-2" />
              <div>✅ No DNS Leak Detected. Your DNS servers are secure.</div>
            </div>
          )}
        </div>
      )}

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse mt-4 bg-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-200 text-center">
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
              const { reasons, severity } = getLeakReason(server);

              // Determine row color based on severity
              const rowClass =
                severity === 'critical'
                  ? 'bg-red-100 hover:bg-red-200'
                  : severity === 'warning'
                    ? 'bg-yellow-100 hover:bg-yellow-200 text-center'
                    : 'bg-white hover:bg-gray-100 text-center';

              const rowClass2 =
                severity === 'critical'
                  ? 'bg-red-50 hover:bg-red-100 p-2 border text-red-600 text-sm'
                  : severity === 'warning'
                    ? 'bg-yellow-50 hover:bg-yellow-100 p-2 border text-yellow-600 text-sm'
                    : 'bg-white hover:bg-gray-100';

              return (
                <React.Fragment key={`server-${index}`}>
                  {/* Main Row */}
                  <tr key={`main-row-${index}`} className={`${rowClass}`}>
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border">
                      <CountryFlag ip={server.ip} />
                    </td>
                    <td className="p-2 border">{server.ip}</td>
                    <td className="p-2 border">{server.isp}</td>
                    <td className="p-2 border">{`${server.city}, ${server.region}, ${server.country}`}</td>
                    <td className="p-2 border">{server.version}</td>
                    <td className="p-2 border">
                      <Modal title={server.link} server={server.link} />
                    </td>
                  </tr>

                  {/* Leak Reason Row */}
                  {reasons.length > 0 &&
                    reasons.map((reason, i) => (
                      <tr key={`reason-row-${index}-${i}`}>
                        <td colSpan={7} className={rowClass2}>
                          {i + 1} - {reason}
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

  );
};

export default DNSLeakTest;
