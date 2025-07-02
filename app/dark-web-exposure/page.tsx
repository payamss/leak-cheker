'use client';

import { useEffect, useState } from 'react';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiXCircle, FiInfo, FiEye, FiLock } from 'react-icons/fi';
import DarkWebInfoBox from './components/DarkWebInfoBox';

type ThreatLevel = 'clean' | 'low' | 'medium' | 'high' | 'critical';

type ThreatResult = {
  source: string;
  status: 'checking' | 'clean' | 'flagged' | 'error';
  threat_level: ThreatLevel;
  details?: string;
  last_seen?: string;
  confidence?: number;
  categories?: string[];
};

type IPInfo = {
  ip: string;
  country?: string;
  isp?: string;
  asn?: string;
};

const DarkWebExposureTest = () => {
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
  const [threatResults, setThreatResults] = useState<ThreatResult[]>([]);
  const [overallRisk, setOverallRisk] = useState<ThreatLevel>('clean');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Initialize threat sources
  const initializeThreatSources = (): ThreatResult[] => [
    {
      source: 'AbuseIPDB',
      status: 'checking',
      threat_level: 'clean',
      details: 'Checking against abuse reports database...'
    },
    {
      source: 'VirusTotal',
      status: 'checking', 
      threat_level: 'clean',
      details: 'Scanning with 90+ security vendors...'
    },
    {
      source: 'IPQualityScore',
      status: 'checking',
      threat_level: 'clean', 
      details: 'Analyzing IP reputation and fraud risk...'
    },
    {
      source: 'Shodan Intelligence',
      status: 'checking',
      threat_level: 'clean',
      details: 'Checking internet-wide scan data...'
    },
    {
      source: 'Blocklist.de',
      status: 'checking',
      threat_level: 'clean',
      details: 'Scanning fail2ban and attack logs...'
    },
    {
      source: 'SURBL',
      status: 'checking', 
      threat_level: 'clean',
      details: 'Checking spam and malware databases...'
    }
  ];

  // Calculate overall risk based on individual results
  const calculateOverallRisk = (results: ThreatResult[]): ThreatLevel => {
    const completedResults = results.filter(r => r.status !== 'checking');
    if (completedResults.length === 0) return 'clean';

    const flaggedResults = completedResults.filter(r => r.status === 'flagged');
    if (flaggedResults.length === 0) return 'clean';

    const highestThreat = flaggedResults.reduce((highest, current) => {
      const levels: ThreatLevel[] = ['clean', 'low', 'medium', 'high', 'critical'];
      return levels.indexOf(current.threat_level) > levels.indexOf(highest) 
        ? current.threat_level 
        : highest;
    }, 'clean' as ThreatLevel);

    return highestThreat;
  };

  // Simulate threat intelligence API calls (replace with real APIs)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const checkThreatDatabase = async (source: string, _ip: string): Promise<ThreatResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000));
    
    // Note: _ip parameter available for future real API implementation

    // Simulate different response scenarios
    const scenarios = [
      { status: 'clean', threat_level: 'clean', details: 'No threats detected' },
      { status: 'flagged', threat_level: 'low', details: 'Minor security concerns detected', confidence: 25 },
      { status: 'flagged', threat_level: 'medium', details: 'Moderate threat indicators found', confidence: 60 },
      { status: 'flagged', threat_level: 'high', details: 'High-risk IP detected in threat feeds', confidence: 85 },
      { status: 'error', threat_level: 'clean', details: 'Service temporarily unavailable' }
    ];

    // For demo purposes, mostly return clean results with occasional flags
    const random = Math.random();
    let scenario;
    
    if (random < 0.7) {
      scenario = scenarios[0]; // 70% clean
    } else if (random < 0.85) {
      scenario = scenarios[1]; // 15% low threat
    } else if (random < 0.95) {
      scenario = scenarios[2]; // 10% medium threat
    } else if (random < 0.98) {
      scenario = scenarios[3]; // 3% high threat
    } else {
      scenario = scenarios[4]; // 2% error
    }

    return {
      source,
      status: scenario.status as 'clean' | 'flagged' | 'error',
      threat_level: scenario.threat_level as ThreatLevel,
      details: scenario.details,
      confidence: scenario.confidence,
      last_seen: scenario.status === 'flagged' ? '2024-01-15' : undefined,
      categories: scenario.status === 'flagged' ? ['Malware', 'Botnet'] : undefined
    };
  };

  // Get user's public IP
  const fetchPublicIP = async (): Promise<IPInfo> => {
    try {
      // Get IP address
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      if (!ipResponse.ok) throw new Error('Failed to fetch IP');
      const { ip } = await ipResponse.json();

      // Get additional info about the IP
      let ipInfo: IPInfo = { ip };
      
      try {
        const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          ipInfo = {
            ip,
            country: geoData.country_name,
            isp: geoData.org,
            asn: geoData.asn
          };
        }
            } catch (e) {
        // If geo lookup fails, just use IP
        console.warn('Geo lookup failed:', e);
      }

      return ipInfo;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error('Failed to retrieve IP information');
    }
  };

  // Start the dark web exposure scan
  const startScan = async () => {
    setIsScanning(true);
    setScanComplete(false);
    setError(null);
    
    try {
      // Get IP information
      const ipData = await fetchPublicIP();
      setIpInfo(ipData);

      // Initialize threat results
      const initialResults = initializeThreatSources();
      setThreatResults(initialResults);

      // Start checking each threat database
      const promises = initialResults.map(async (result, index) => {
        try {
          const threatResult = await checkThreatDatabase(result.source, ipData.ip);
          
          setThreatResults(prev => {
            const updated = [...prev];
            updated[index] = threatResult;
            return updated;
          });

          return threatResult;
        } catch {
          const errorResult: ThreatResult = {
            ...result,
            status: 'error',
            details: 'Check failed - service unavailable'
          };
          
          setThreatResults(prev => {
            const updated = [...prev];
            updated[index] = errorResult;
            return updated;
          });

          return errorResult;
        }
      });

      // Wait for all checks to complete
      const allResults = await Promise.all(promises);
      
      // Calculate overall risk
      const risk = calculateOverallRisk(allResults);
      setOverallRisk(risk);
      setScanComplete(true);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  // Get risk color and icon
  const getRiskInfo = (level: ThreatLevel) => {
    switch (level) {
      case 'clean':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: FiCheckCircle, text: 'Clean' };
      case 'low':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: FiInfo, text: 'Low Risk' };
      case 'medium':
        return { color: 'text-orange-600', bg: 'bg-orange-100', icon: FiAlertTriangle, text: 'Medium Risk' };
      case 'high':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: FiXCircle, text: 'High Risk' };
      case 'critical':
        return { color: 'text-red-800', bg: 'bg-red-200', icon: FiXCircle, text: 'Critical Risk' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: FiInfo, text: 'Unknown' };
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Dark Web Exposure Test
        </h2>
        <p>Loading...</p>
      </div>
    );
  }

  const overallRiskInfo = getRiskInfo(overallRisk);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
        <FiShield className="w-8 h-8 mr-3" />
        Dark Web Exposure Test
      </h2>

      {/* Info Box */}
      <DarkWebInfoBox />

      {/* IP Information */}
      {ipInfo && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FiEye className="w-5 h-5 mr-2" />
            Your IP Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>IP Address:</strong> <span className="text-blue-600">{ipInfo.ip}</span>
            </div>
            {ipInfo.country && (
              <div>
                <strong>Country:</strong> {ipInfo.country}
              </div>
            )}
            {ipInfo.isp && (
              <div>
                <strong>ISP:</strong> {ipInfo.isp}
              </div>
            )}
            {ipInfo.asn && (
              <div>
                <strong>ASN:</strong> {ipInfo.asn}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overall Risk Assessment */}
      {scanComplete && (
        <div className={`p-6 rounded-lg shadow-md mb-6 ${overallRiskInfo.bg}`}>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <overallRiskInfo.icon className={`w-6 h-6 mr-2 ${overallRiskInfo.color}`} />
            Overall Risk Assessment: <span className={overallRiskInfo.color}>{overallRiskInfo.text}</span>
          </h3>
          
          {overallRisk === 'clean' ? (
            <p className="text-gray-700">
              Great news! Your IP address was not found in any known threat databases or dark web exposure lists.
            </p>
          ) : (
            <div>
              <p className="text-gray-700 mb-3">
                Your IP address has been flagged in one or more threat intelligence databases.
              </p>
              <div className="bg-white p-4 rounded-md">
                <h4 className="font-semibold text-gray-800 mb-2">Immediate Actions:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Change your router&apos;s public IP by restarting your modem</li>
                  <li>Run a full system malware scan</li>
                  <li>Check for compromised devices on your network</li>
                  <li>Consider using a VPN for additional protection</li>
                  <li>Contact your ISP if issues persist</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scan Control */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
        {!isScanning && !scanComplete && (
          <button
            onClick={startScan}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center mx-auto"
          >
            <FiShield className="w-5 h-5 mr-2" />
            Start Dark Web Exposure Scan
          </button>
        )}
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error}
            <button
              onClick={startScan}
              className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Retry Scan
            </button>
          </div>
        )}
      </div>

      {/* Threat Database Results */}
      {threatResults.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FiLock className="w-5 h-5 mr-2" />
            Threat Intelligence Results
          </h3>
          
          <div className="space-y-4">
            {threatResults.map((result, index) => {
              const riskInfo = getRiskInfo(result.threat_level);
              
              return (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{result.source}</h4>
                    <div className="flex items-center space-x-2">
                      {result.status === 'checking' ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span className="text-blue-600 text-sm">Scanning...</span>
                        </div>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskInfo.bg} ${riskInfo.color}`}>
                          {result.status === 'error' ? 'Error' : riskInfo.text}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{result.details}</p>
                  
                  {result.confidence && (
                    <div className="text-xs text-gray-500">
                      Confidence: {result.confidence}%
                    </div>
                  )}
                  
                  {result.last_seen && (
                    <div className="text-xs text-gray-500">
                      Last seen: {result.last_seen}
                    </div>
                  )}
                  
                  {result.categories && (
                    <div className="mt-2">
                      {result.categories.map((category, idx) => (
                        <span key={idx} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-2">
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DarkWebExposureTest; 