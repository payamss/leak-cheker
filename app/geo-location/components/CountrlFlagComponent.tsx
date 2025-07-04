'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiAlertCircle, FiLoader, FiGlobe } from 'react-icons/fi';

// Define props for the component
type CountryFlagProps = {
  ip: string; // IPv4 or IPv6
};

// Cache for storing flag URLs
const flagCache = new Map<string, string>();

const CountryFlag = ({ ip }: CountryFlagProps) => {
  const [flagUrl, setFlagUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [countryCode, setCountryCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        const response = await fetch(`https://ipwhois.app/json/${ip}`);
        if (!response.ok) throw new Error('Failed to fetch country data');

        const data = await response.json();

        if (data.country_code && typeof data.country_code === 'string' && data.country_code.length === 2) {
          const code = data.country_code.toLowerCase();
          setCountryCode(code);

          // Check if the flag is already in the cache
          if (flagCache.has(code)) {
            setFlagUrl(flagCache.get(code) || null);
          } else {
            const countryResponse = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
            if (!countryResponse.ok) throw new Error('Country not found');

            const countryData = await countryResponse.json();
            const flag = countryData[0]?.flags?.svg || countryData[0]?.flags?.png;

            // Cache the flag URL
            flagCache.set(code, flag);
            setFlagUrl(flag);
          }
        } else {
          setCountryCode(null);
          throw new Error('Country code not found');
        }
      } catch (err) {
        console.error('Error fetching country flag:', err);
        setError('No flag');
        setFlagUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryData();
  }, [ip]);

  return (
    <div className="flex items-center space-x-2 justify-center">
      {/* Loading State */}
      {loading ? (
        <FiLoader className="animate-spin text-blue-500 w-5 h-5" />
      ) : error || !flagUrl || !countryCode ? (
        <div className="flex items-center space-x-1 text-gray-400">
          <FiGlobe className="w-5 h-5" />
          <span className="text-xs">N/A</span>
        </div>
      ) : (
        // Display Country Flag
        <Image
          src={flagUrl}
          alt="Country Flag"
          width={24}
          height={18}
          style={{ width: 24, height: 'auto' }}
          className="rounded"
        />
      )}
    </div>
  );
};

export default CountryFlag;
