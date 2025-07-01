'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiAlertCircle, FiLoader } from 'react-icons/fi';

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

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        const response = await fetch(`https://ipwhois.app/json/${ip}`);
        if (!response.ok) throw new Error('Failed to fetch country data');

        const data = await response.json();

        if (data.country_code) {
          const countryCode = data.country_code.toLowerCase();

          // Check if the flag is already in the cache
          if (flagCache.has(countryCode)) {
            setFlagUrl(flagCache.get(countryCode) || null);
          } else {
            const countryResponse = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
            if (!countryResponse.ok) throw new Error('Country not found');

            const countryData = await countryResponse.json();
            const flag = countryData[0]?.flags?.svg || countryData[0]?.flags?.png;

            // Cache the flag URL
            flagCache.set(countryCode, flag);
            setFlagUrl(flag);
          }
        } else {
          throw new Error('Country code not found');
        }
      } catch (err) {
        console.error('Error fetching country flag:', err);
        setError('Unable to fetch flag');
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
      ) : error ? (
        <div className="flex items-center space-x-1 text-red-600">
          <FiAlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      ) : (
        // Display Country Flag
        flagUrl && (
          <Image
            src={flagUrl}
            alt="Country Flag"
            width={30}
            height={30}
            className="rounded"
          />
        )
      )}
    </div>
  );
};

export default CountryFlag;
