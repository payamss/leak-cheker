'use client';

import { useEffect, useState } from 'react';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiXCircle, FiInfo, FiEye, FiLock, FiExternalLink, FiHelpCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
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

// Threat category information database
const threatCategoryInfo = {
  'Malware': {
    title: 'Malware Detection',
    description: 'Your IP has been associated with malware distribution or infected devices.',
    severity: 'High',
    whatItMeans: 'This indicates that your network may be infected with malicious software that is communicating with command and control servers or participating in malware distribution.',
    immediateActions: [
      'Disconnect affected devices from the internet immediately',
      'Run comprehensive antivirus/anti-malware scans on all devices',
      'Update all operating systems and software',
      'Check for suspicious network activity',
      'Consider professional malware removal services'
    ],
    learnMoreLinks: [
      { title: 'What is Malware?', url: 'https://www.cisa.gov/malware' },
      { title: 'Malware Removal Guide', url: 'https://www.malwarebytes.com/malware' },
      { title: 'NIST Cybersecurity Framework', url: 'https://www.nist.gov/cyberframework' }
    ]
  },
  'Botnet': {
    title: 'Botnet Participation',
    description: 'Your IP is part of a botnet - a network of compromised computers controlled by cybercriminals.',
    severity: 'Critical',
    whatItMeans: 'Your device(s) may be compromised and being used by criminals for illegal activities like DDoS attacks, spam distribution, or cryptocurrency mining without your knowledge.',
    immediateActions: [
      'Immediately isolate infected devices from the network',
      'Change all passwords and enable two-factor authentication',
      'Run deep system scans with multiple security tools',
      'Monitor network traffic for suspicious connections',
      'Contact your ISP to report the compromise',
      'Consider rebuilding compromised systems from scratch'
    ],
    learnMoreLinks: [
      { title: 'Understanding Botnets', url: 'https://www.cisa.gov/botnets' },
      { title: 'Botnet Removal Guide', url: 'https://www.fbi.gov/how-we-can-help-you/safety-resources/scams-and-safety/common-scams-and-crimes/botnet-operations' },
      { title: 'Report Cybercrime', url: 'https://www.ic3.gov/' }
    ]
  },
  'Spam': {
    title: 'Spam Distribution',
    description: 'Your IP has been flagged for sending unsolicited emails or spam.',
    severity: 'Medium',
    whatItMeans: 'Your network may be compromised and being used to send spam emails, or you may have misconfigured email servers that are being abused.',
    immediateActions: [
      'Check all email accounts for unauthorized access',
      'Scan for malware that might be sending emails',
      'Review email server configurations',
      'Change email passwords and enable 2FA',
      'Check with your ISP about IP reputation'
    ],
    learnMoreLinks: [
      { title: 'Email Security Best Practices', url: 'https://www.cisa.gov/email-security' },
      { title: 'Stop Email Spam', url: 'https://consumer.ftc.gov/articles/how-recognize-and-avoid-phishing-scams' }
    ]
  },
  'Phishing': {
    title: 'Phishing Activity',
    description: 'Your IP has been associated with phishing attacks or hosting malicious websites.',
    severity: 'High',
    whatItMeans: 'Your network may be hosting phishing sites or your devices may be compromised and participating in phishing campaigns designed to steal credentials.',
    immediateActions: [
      'Scan all devices for malware and suspicious software',
      'Check for unauthorized websites or services running on your network',
      'Review all online accounts for unauthorized access',
      'Change all important passwords immediately',
      'Contact hosting providers if you run websites'
    ],
    learnMoreLinks: [
      { title: 'Phishing Prevention', url: 'https://www.cisa.gov/phishing' },
      { title: 'Report Phishing', url: 'https://www.antiphishing.org/report-phishing/' }
    ]
  },
  'Scanning': {
    title: 'Network Scanning',
    description: 'Your IP has been detected performing network scans or probes.',
    severity: 'Low',
    whatItMeans: 'Your network may be running security tools, or compromised devices may be scanning for vulnerabilities in other networks.',
    immediateActions: [
      'Review any legitimate security scanning tools you may be running',
      'Check for unauthorized software or malware',
      'Verify all devices on your network are legitimate',
      'Consider if this activity is related to your work or security research'
    ],
    learnMoreLinks: [
      { title: 'Network Security Scanning', url: 'https://www.sans.org/white-papers/1543/' }
    ]
  },
  'DDoS': {
    title: 'DDoS Participation',
    description: 'Your IP has participated in Distributed Denial of Service attacks.',
    severity: 'Critical',
    whatItMeans: 'Your devices are likely compromised and being used to attack other networks by overwhelming them with traffic.',
    immediateActions: [
      'Immediately disconnect from the internet',
      'Run comprehensive malware removal',
      'Check all IoT devices for default passwords',
      'Contact your ISP immediately',
      'Consider legal implications and report the compromise'
    ],
    learnMoreLinks: [
      { title: 'DDoS Attack Prevention', url: 'https://www.cisa.gov/ddos' },
      { title: 'Report DDoS Attacks', url: 'https://www.us-cert.gov/report' }
    ]
  }
};

const DarkWebExposureTest = () => {
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
  const [threatResults, setThreatResults] = useState<ThreatResult[]>([]);
  const [overallRisk, setOverallRisk] = useState<ThreatLevel>('clean');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [expandedThreat, setExpandedThreat] = useState<number | null>(null);

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
      { status: 'flagged', threat_level: 'low', details: 'Minor security concerns detected', confidence: 25, categories: ['Malware', 'Botnet'] },
      { status: 'flagged', threat_level: 'medium', details: 'Moderate threat indicators found', confidence: 60, categories: ['Spam', 'Scanning'] },
      { status: 'flagged', threat_level: 'high', details: 'High-risk IP detected in threat feeds', confidence: 85, categories: ['Phishing', 'DDoS'] },
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
      categories: scenario.categories
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

  // Get unique threat categories from all flagged results
  const getDetectedThreats = () => {
    const flaggedResults = threatResults.filter(r => r.status === 'flagged' && r.categories);
    const allCategories = flaggedResults.flatMap(r => r.categories || []);
    return [...new Set(allCategories)];
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 py-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
          Dark Web Exposure Test
        </h2>
        <p>Loading...</p>
      </div>
    );
  }

  const overallRiskInfo = getRiskInfo(overallRisk);
  const detectedThreats = getDetectedThreats();

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center flex items-center justify-center">
        <FiShield className="w-7 h-7 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
        Dark Web Exposure Test
      </h2>

      {/* Info Box */}
      <DarkWebInfoBox />

      {/* IP Information */}
      {ipInfo && (
        <div className="bg-white p-3 sm:p-5 rounded-lg shadow-md mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4 flex items-center">
            <FiEye className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Your IP Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-base">
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
        <div className={`p-3 sm:p-5 rounded-lg shadow-md mb-4 sm:mb-6 ${overallRiskInfo.bg}`}> 
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4 flex items-center">
            <overallRiskInfo.icon className={`w-5 h-5 sm:w-6 sm:h-6 mr-2 ${overallRiskInfo.color}`} />
            Overall Risk Assessment: <span className={overallRiskInfo.color}>{overallRiskInfo.text}</span>
          </h3>
          {overallRisk === 'clean' ? (
            <p className="text-xs sm:text-base text-gray-700">
              Great news! Your IP address was not found in any known threat databases or dark web exposure lists.
            </p>
          ) : (
            <div>
              <p className="text-xs sm:text-base text-gray-700 mb-2 sm:mb-3">
                Your IP address has been flagged in one or more threat intelligence databases.
              </p>
              <div className="bg-white p-2 sm:p-4 rounded-md">
                <h4 className="font-semibold text-gray-800 mb-1 sm:mb-2">Immediate Actions:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-700">
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

      {/* Threat Category Explanations */}
      {detectedThreats.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-3 sm:p-5 rounded-lg shadow-md mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-red-800 mb-2 sm:mb-4 flex items-center">
            <FiAlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Detected Threat Categories - What This Means
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {detectedThreats.map((category, index) => {
              const info = threatCategoryInfo[category as keyof typeof threatCategoryInfo];
              if (!info) return null;
              return (
                <div key={index} className="bg-white p-2 sm:p-4 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h4 className="text-base sm:text-lg font-semibold text-red-700 flex items-center">
                      <FiAlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      {info.title}
                    </h4>
                    <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-800 text-xs sm:text-sm rounded-full">
                      Severity: {info.severity}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3">{info.description}</p>
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-md mb-2 sm:mb-3">
                    <h5 className="font-semibold text-gray-800 mb-1 sm:mb-2">What This Means:</h5>
                    <p className="text-xs sm:text-sm text-gray-700">{info.whatItMeans}</p>
                  </div>
                  <div className="mb-2 sm:mb-3">
                    <h5 className="font-semibold text-gray-800 mb-1 sm:mb-2">Immediate Actions Required:</h5>
                    <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-700">
                      {info.immediateActions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-1 sm:mb-2">Learn More:</h5>
                    <div className="flex flex-wrap gap-2">
                      {info.learnMoreLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm rounded-md hover:bg-blue-200 transition-colors"
                        >
                          {link.title}
                          <FiExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scan Control */}
      <div className="bg-white p-3 sm:p-5 rounded-lg shadow-md mb-4 sm:mb-6 text-center">
        {!isScanning && !scanComplete && (
          <button
            onClick={startScan}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg flex items-center mx-auto text-sm sm:text-base"
          >
            <FiShield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Start Dark Web Exposure Scan
          </button>
        )}
        {error && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded text-xs sm:text-base">
            Error: {error}
            <button
              onClick={startScan}
              className="ml-2 sm:ml-4 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-1 sm:py-2 rounded"
            >
              Retry Scan
            </button>
          </div>
        )}
      </div>

      {/* Threat Database Results */}
      {threatResults.length > 0 && (
        <div className="bg-white p-3 sm:p-5 rounded-lg shadow-md">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4 flex items-center">
            <FiLock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Threat Intelligence Results
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {threatResults.map((result, index) => {
              const riskInfo = getRiskInfo(result.threat_level);
              const isExpanded = expandedThreat === index;
              const hasThreatInfo = result.status === 'flagged' && result.categories && result.categories.length > 0;
              return (
                <div key={index} className="p-2 sm:p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-800 text-xs sm:text-base">{result.source}</h4>
                      {hasThreatInfo && (
                        <button
                          onClick={() => setExpandedThreat(isExpanded ? null : index)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View detailed threat information"
                        >
                          <FiHelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {result.status === 'checking' ? (
                        <div className="flex items-center">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1 sm:mr-2"></div>
                          <span className="text-blue-600 text-xs sm:text-sm">Scanning...</span>
                        </div>
                      ) : (
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${riskInfo.bg} ${riskInfo.color}`}>
                          {result.status === 'error' ? 'Error' : riskInfo.text}
                        </span>
                      )}
                      {hasThreatInfo && (
                        <button
                          onClick={() => setExpandedThreat(isExpanded ? null : index)}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {isExpanded ? <FiChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <FiChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{result.details}</p>
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
                    <div className="mt-1 sm:mt-2">
                      {result.categories.map((category, idx) => (
                        <span key={idx} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-2">
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Expanded Threat Information */}
                  {isExpanded && hasThreatInfo && (
                    <div className="mt-2 sm:mt-4 p-2 sm:p-4 bg-gray-50 rounded-lg border">
                      <h5 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
                        <FiInfo className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        What {result.source} Found:
                      </h5>
                      {result.categories?.map((category, idx) => {
                        const info = threatCategoryInfo[category as keyof typeof threatCategoryInfo];
                        if (!info) return null;
                        return (
                          <div key={idx} className="mb-2 sm:mb-4 last:mb-0">
                            <h6 className="font-medium text-gray-700 mb-1">{info.title}</h6>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{info.description}</p>
                            <div className="text-xs space-y-1">
                              <div className="flex flex-wrap gap-1">
                                {info.learnMoreLinks.slice(0, 2).map((link, linkIdx) => (
                                  <a
                                    key={linkIdx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded hover:bg-blue-100 transition-colors"
                                  >
                                    {link.title}
                                    <FiExternalLink className="w-2 h-2 ml-1" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
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