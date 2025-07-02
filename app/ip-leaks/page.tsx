/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiGlobe, FiMapPin, FiServer, FiAlertCircle, FiClock, FiMap } from 'react-icons/fi';
// import CustomMap from './CustomMap';

type GeolocationData = {
  query: string;
  isp: string;
  org: string;
  as: string;
  country: string;
  countryCode: string;
  city: string;
  regionName: string;
  lat: number;
  lon: number;
  timezone: string;
  zip: string;
};

type RDAPData = {
  handle: string;
  startAddress: string;
  endAddress: string;
  ipVersion: string;
  name: string;
  type: string;
  country: string;
  status: string[];
  entities: {
    handle: string;
    roles: string[];
    vcardArray: any[];
  }[];
  events: {
    eventAction: string;
    eventDate: string;
  }[];
};

const Shimmer = () => (
  <div className="animate-pulse bg-gray-200 h-6 w-full rounded"></div>
);

const IPLeaksTest = () => {
  const [ipv4, setIPv4] = useState<string | null>(null);
  const [ipv6, setIPv6] = useState<string | null>(null);
  const [geoData, setGeoData] = useState<GeolocationData | null>(null);
  const [rdapData, setRdapData] = useState<RDAPData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [ipv4Error, setIPv4Error] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [rdapError, setRdapError] = useState<string | null>(null);
  const [ipv6Error, setIPv6Error] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      
      let fetchedIPv4: string | null = null;

      // Step 1: Fetch IPv4 Address first
      try {
        const ipv4Res = await fetch('https://api.ipify.org?format=json');
        if (!ipv4Res.ok) throw new Error('Failed to fetch IPv4 Address');
        const ipv4Data = await ipv4Res.json();
        fetchedIPv4 = ipv4Data.ip;
        setIPv4(fetchedIPv4);
      } catch (err) {
        console.error('IPv4 fetch error:', err);
        setIPv4Error('Unable to fetch IPv4 Address.');
      }

      // Step 2: Fetch Geolocation Data using the IPv4
      if (fetchedIPv4) {
        try {
          // Use HTTPS-only APIs for production compatibility
          let geoRes = await fetch(`https://ipapi.co/${fetchedIPv4}/json/`);
          
          if (!geoRes.ok) {
            // Fallback to ipinfo.io
            geoRes = await fetch(`https://ipinfo.io/${fetchedIPv4}/json`);
          }
          
          if (!geoRes.ok) {
            // Second fallback to ipinfo.io without specific IP
            geoRes = await fetch(`https://ipinfo.io/json`);
          }
          
          if (!geoRes.ok) throw new Error('Failed to fetch Geolocation Data');
          
          const geoResult = await geoRes.json();
          
          // Transform ipinfo.io response to match expected format
          if (geoResult.loc) {
            const [lat, lon] = geoResult.loc.split(',').map(Number);
            const transformedGeoData = {
              query: geoResult.ip || fetchedIPv4,
              isp: geoResult.org || 'Unknown',
              org: geoResult.org || 'Unknown',
              as: geoResult.org || 'Unknown',
              country: geoResult.country_name || geoResult.country || 'Unknown',
              countryCode: geoResult.country && geoResult.country.length === 2 ? geoResult.country : undefined,
              city: geoResult.city || 'Unknown',
              regionName: geoResult.region || 'Unknown',
              lat: lat || 0,
              lon: lon || 0,
              timezone: geoResult.timezone || 'Unknown',
              zip: geoResult.postal || 'Unknown',
            };
            setGeoData(transformedGeoData);
          } else if (geoResult.query || geoResult.ip) {
            // If it's already in the expected format (from ipapi.co or other APIs)
            const normalizedGeoData = {
              ...geoResult,
              query: geoResult.query || geoResult.ip || fetchedIPv4,
              countryCode: geoResult.countryCode && geoResult.countryCode.length === 2 ? geoResult.countryCode : undefined,
            };
            setGeoData(normalizedGeoData);
          } else {
            throw new Error('Invalid geolocation response format');
          }
        } catch (err) {
          console.error('Geolocation fetch error:', err);
          setGeoError('Unable to fetch Geolocation Data.');
        }

        // Step 3: Fetch RDAP Data using the IPv4
        try {
          const rdapRes = await fetch(`https://rdap.db.ripe.net/ip/${fetchedIPv4}`);
          if (!rdapRes.ok) throw new Error('Failed to fetch RDAP Data');
          const rdapResult = await rdapRes.json();
          setRdapData(rdapResult);
        } catch (err) {
          console.error('RDAP fetch error:', err);
          setRdapError('Unable to fetch RDAP Data.');
        }
      } else {
        setGeoError('Unable to fetch Geolocation Data.');
        setRdapError('Unable to fetch RDAP Data.');
      }

      // Step 4: Fetch IPv6 Address (independent of IPv4)
      try {
        const ipv6Res = await fetch('https://api64.ipify.org?format=json');
        if (!ipv6Res.ok) throw new Error('Failed to fetch IPv6 Address');
        const ipv6Data = await ipv6Res.json();
        setIPv6(ipv6Data.ip);
      } catch (err) {
        console.error('IPv6 fetch error:', err);
        setIPv6Error('Unable to fetch IPv6 Address.');
      }

      setLoading(false);
    };

    fetchAllData();
  }, []); // Remove ipv4 dependency to prevent loops

  // Helper function to display RDAP entities
  const renderEntities = (entities: RDAPData['entities']) => {
    return entities.map((entity, index) => (
      <div
        key={index}
        className="p-4 bg-gray-50 border rounded-md shadow-sm space-y-2"
      >
        <p className="font-semibold text-gray-800">
          Role: {entity.roles?.join(', ') || 'Unknown'}
        </p>
        {entity.vcardArray && entity.vcardArray[1] && entity.vcardArray[1].map((field: any[], idx: number) => (
          <div key={idx} className="text-sm text-gray-600">
            {field[0] === 'fn' && <p>Name: {field[3]}</p>}
            {field[0] === 'adr' && <p>Address: {field[1]?.label}</p>}
          </div>
        ))}
      </div>
    ));
  };
  const renderEvents = (events: RDAPData['events']) =>
    events.map((event, idx) => (
      <p key={idx} className="text-sm text-gray-600">
        {event.eventAction}: {new Date(event.eventDate).toLocaleString()}
      </p>
    ));
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Your Exposed Public IP Data
      </h2>

      {loading ? (
        <div className="space-y-4">
          <Shimmer />
          <Shimmer />
          <Shimmer />
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* IPv4 and IPv6 */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                <FiGlobe className="w-6 h-6 mr-2" /> Public IPs
              </h3>
              {ipv4 ? (
                <p>
                  <strong>Public IPv4:</strong>{' '}
                  <span className="text-blue-600">{ipv4}</span>
                </p>
              ) : (
                <div className="flex text-red-500 gap-2 items-center justify-center text-center">
                  <FiAlertCircle className="w-6 h-6" />
                  <p className="text-red-500">{ipv4Error}</p>
                </div>
              )}
              {ipv6 ? (
                <p>
                  <strong>Public IPv6:</strong>{' '}
                  <span className="text-green-600">{ipv6}</span>
                </p>
              ) : (<div className="flex text-red-500 gap-2 items-center justify-center text-center">

                <FiAlertCircle className="w-6 h-6" />
                <p className="text-red-500">{ipv6Error}</p>
              </div>
              )}
            </div>
            {/* Geolocation Section */}

            {geoData ? (
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                  <FiMapPin className="w-6 h-6 mr-2" /> Geolocation Data
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <FiGlobe className="text-gray-500" />
                      <p>
                        <strong>IP Address:</strong> {geoData?.query}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiMap className="text-gray-500" />
                      <p className="flex items-center space-x-2">
                        <span>
                          <strong>Location:</strong> {geoData?.city}, {geoData?.regionName}, {geoData?.country}
                        </span>
                        {geoData?.countryCode && (
                          <Image
                            src={`https://flagcdn.com/w320/${geoData.countryCode.toLowerCase()}.png`}
                            alt="Country Flag"
                            width={30}
                            height={20}
                            className=" ml-2 rounded-sm"
                          />
                        )}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FiServer className="text-gray-500" />
                      <p>
                        <strong>ISP:</strong> {geoData?.isp}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiServer className="text-gray-500" />
                      <p>
                        <strong>Organization:</strong> {geoData?.org}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiClock className="text-gray-500" />
                      <p>
                        <strong>Timezone:</strong> {geoData?.timezone}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiMap className="text-gray-500" />
                      <p>
                        <strong>Coordinates:</strong> {geoData?.lat}, {geoData?.lon}
                      </p>
                    </div>

                  </div>

                  {/* Map Section */}
                  {/* <div className="rounded-lg overflow-hidden shadow-sm">
                <CustomMap
                  latitude={geoData?.lat || 0}
                  longitude={geoData?.lon || 0}
                  accuracy={1000} // Using approximate accuracy
                />
              </div> */}
                </div>
              </div>
            ) : (
              <div className="flex text-red-500 gap-2 items-center justify-center text-center">
                <FiAlertCircle className="w-6 h-6" />
                <p > {geoError}</p>
              </div>
            )}

            {/* RDAP Details */}
            {rdapData ? (
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                  <FiServer className="w-6 h-6 mr-2" /> Host Data
                </h3>
                <p>
                  <strong>IP Range:</strong> {rdapData?.handle}
                </p>
                <p>
                  <strong>Network Name:</strong> {rdapData?.name}
                </p>
                <p>
                  <strong>Type:</strong> {rdapData?.type}
                </p>
                <div className="mt-4 space-y-2">{renderEntities(rdapData?.entities || [])}</div>
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold">Events</h4>
                  {renderEvents(rdapData?.events || [])}
                </div>
              </div>
            ) : (
              <div className="flex text-red-500 gap-2 items-center justify-center text-center">
                <FiAlertCircle className="w-6 h-6" />
                <p >{rdapError}</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
};

export default IPLeaksTest;
