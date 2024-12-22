'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiAlertCircle, FiLoader } from 'react-icons/fi';

// Define props for the component
type CountryFlagProps = {
  ip: string; // IPv4 or IPv6
};

// Main Component
const CountryFlag = ({ ip }: CountryFlagProps) => {
  const [flagUrl, setFlagUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        // Fetch IP information (example: using ipapi.co)
        const response = await fetch(`https://ipwhois.app/json/${ip}`);
        if (!response.ok) throw new Error('Failed to fetch country data');

        const data = await response.json();

        // Check if data has the country_code
        if (data.country_code) {
          const countryCode = data.country_code.toLowerCase();
          setFlagUrl(`https://flagcdn.com/w80/${countryCode}.png`);
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
    <div className="flex items-center space-x-2">
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
            width={20}
            height={15}
            className="rounded"
          />
        )
      )}
    </div>
  );
};

export default CountryFlag;
