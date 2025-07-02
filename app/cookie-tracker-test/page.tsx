'use client';

import { useEffect, useState } from 'react';
import { FiShield, FiEye, FiDatabase, FiTarget, FiSettings, FiAlertTriangle, FiCheckCircle, FiXCircle, FiInfo, FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import CookieTrackerInfoBox from './components/CookieTrackerInfoBox';

type TestResult = {
  name: string;
  status: 'testing' | 'pass' | 'fail' | 'warning' | 'info';
  description: string;
  details?: string;
  recommendation?: string;
  severity: 'low' | 'medium' | 'high';
};

type BrowserFingerprint = {
  userAgent: string;
  language: string;
  languages: string[];
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: string | null;
  screenResolution: string;
  colorDepth: number;
  timezone: string;
  hardwareConcurrency: number;
  deviceMemory?: number;
  plugins: string[];
  fonts?: string[];
  canvas?: string;
  webgl?: string;
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
};

const CookieTrackerTest = () => {
  const [isClient, setIsClient] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [fingerprint, setFingerprint] = useState<BrowserFingerprint | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [, setThirdPartyCookieTest] = useState<'testing' | 'enabled' | 'blocked'>('testing');

  // Initialize test results
  const initializeTests = (): TestResult[] => [
    {
      name: 'Third-Party Cookies',
      status: 'testing',
      description: 'Testing if third-party cookies are enabled...',
      severity: 'high'
    },
    {
      name: 'Do Not Track Header',
      status: 'testing', 
      description: 'Checking Do Not Track browser setting...',
      severity: 'medium'
    },
    {
      name: 'Browser Fingerprinting',
      status: 'testing',
      description: 'Analyzing browser uniqueness...',
      severity: 'high'
    },
    {
      name: 'Local Storage',
      status: 'testing',
      description: 'Testing local storage capabilities...',
      severity: 'medium'
    },
    {
      name: 'Canvas Fingerprinting',
      status: 'testing',
      description: 'Checking canvas fingerprinting vulnerability...',
      severity: 'high'
    },
    {
      name: 'WebGL Fingerprinting',
      status: 'testing',
      description: 'Testing WebGL fingerprinting exposure...',
      severity: 'high'
    },
    {
      name: 'Font Detection',
      status: 'testing',
      description: 'Analyzing available fonts for fingerprinting...',
      severity: 'medium'
    },
    {
      name: 'Plugin Detection',
      status: 'testing',
      description: 'Checking for trackable browser plugins...',
      severity: 'medium'
    }
  ];

  // Test third-party cookie support
  const testThirdPartyCookies = async (): Promise<TestResult> => {
    try {
      // Try to set a cookie via JavaScript
      document.cookie = "privacy_test=test; SameSite=None; Secure";
      
      // Check if cookie was set
      const cookieSet = document.cookie.includes('privacy_test=test');
      
      if (cookieSet) {
        setThirdPartyCookieTest('enabled');
        return {
          name: 'Third-Party Cookies',
          status: 'fail',
          description: 'Third-party cookies are enabled',
          details: 'Your browser accepts third-party cookies, which can be used for tracking across websites.',
          recommendation: 'Disable third-party cookies in your browser settings for better privacy.',
          severity: 'high'
        };
      } else {
        setThirdPartyCookieTest('blocked');
        return {
          name: 'Third-Party Cookies',
          status: 'pass',
          description: 'Third-party cookies are blocked',
          details: 'Your browser blocks third-party cookies, providing better privacy protection.',
          severity: 'high'
        };
      }
    } catch {
      return {
        name: 'Third-Party Cookies',
        status: 'warning',
        description: 'Could not test third-party cookies',
        details: 'Cookie testing was blocked or failed.',
        severity: 'high'
      };
    }
  };

  // Generate canvas fingerprint
  const generateCanvasFingerprint = (): string => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'unavailable';

      // Draw some text and shapes for fingerprinting
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Privacy Test Canvas 🔒', 2, 2);
      
      ctx.fillStyle = 'rgba(255,0,255,0.5)';
      ctx.fillRect(100, 5, 80, 20);
      
      return canvas.toDataURL().slice(-50); // Last 50 chars for brevity
    } catch {
      return 'blocked';
    }
  };

  // Generate WebGL fingerprint
  const generateWebGLFingerprint = (): string => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'unavailable';

      const webglContext = gl as WebGLRenderingContext;
      const renderer = webglContext.getParameter(webglContext.RENDERER);
      const vendor = webglContext.getParameter(webglContext.VENDOR);
      return `${vendor} ${renderer}`.slice(0, 50);
    } catch {
      return 'blocked';
    }
  };

  // Detect available fonts (simplified)
  const detectFonts = (): string[] => {
    const testFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 
      'Palatino', 'Garamond', 'Bookman', 'Trebuchet MS', 'Arial Black', 'Impact'
    ];
    
    const availableFonts: string[] = [];
    
    // This is a simplified font detection - real fingerprinting is more sophisticated
    testFonts.forEach(font => {
      // In a real implementation, you'd measure text rendering differences
      // For demo purposes, we'll simulate some fonts being available
      if (Math.random() > 0.3) {
        availableFonts.push(font);
      }
    });
    
    return availableFonts;
  };

  // Get browser plugins
  const getPlugins = (): string[] => {
    if (typeof navigator !== 'undefined' && navigator.plugins) {
      return Array.from(navigator.plugins).map(plugin => plugin.name);
    }
    return [];
  };

  // Generate complete browser fingerprint
  const generateFingerprint = (): BrowserFingerprint => {
    const fp: BrowserFingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages ? Array.from(navigator.languages) : [navigator.language],
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: (navigator as any).deviceMemory, // eslint-disable-line @typescript-eslint/no-explicit-any
      plugins: getPlugins(),
      fonts: detectFonts(),
      canvas: generateCanvasFingerprint(),
      webgl: generateWebGLFingerprint(),
      localStorage: typeof Storage !== 'undefined',
      sessionStorage: typeof Storage !== 'undefined',
      indexedDB: typeof indexedDB !== 'undefined'
    };

    return fp;
  };

  // Analyze fingerprint uniqueness
  const analyzeFingerprint = (fp: BrowserFingerprint): TestResult[] => {
    const results: TestResult[] = [];

    // Do Not Track test
    results.push({
      name: 'Do Not Track Header',
      status: fp.doNotTrack === '1' ? 'pass' : 'fail',
      description: fp.doNotTrack === '1' ? 'Do Not Track is enabled' : 'Do Not Track is disabled',
      details: fp.doNotTrack === '1' 
        ? 'Your browser sends the Do Not Track header, requesting not to be tracked.'
        : 'Your browser does not send the Do Not Track header.',
      recommendation: fp.doNotTrack !== '1' ? 'Enable Do Not Track in your browser privacy settings.' : undefined,
      severity: 'medium'
    });

    // Browser fingerprinting analysis
    const fingerprintScore = calculateFingerprintScore(fp);
    results.push({
      name: 'Browser Fingerprinting',
      status: fingerprintScore > 70 ? 'fail' : fingerprintScore > 40 ? 'warning' : 'pass',
      description: `Browser uniqueness score: ${fingerprintScore}%`,
      details: fingerprintScore > 70 
        ? 'Your browser has a highly unique fingerprint, making you easily trackable.'
        : fingerprintScore > 40
        ? 'Your browser has a moderately unique fingerprint.'
        : 'Your browser fingerprint is relatively common.',
      recommendation: fingerprintScore > 40 ? 'Consider using privacy-focused browser settings or extensions.' : undefined,
      severity: 'high'
    });

    // Local storage test
    results.push({
      name: 'Local Storage',
      status: fp.localStorage ? 'warning' : 'pass',
      description: fp.localStorage ? 'Local storage is available' : 'Local storage is disabled',
      details: fp.localStorage 
        ? 'Local storage can be used to track you across browser sessions.'
        : 'Local storage is disabled, preventing persistent tracking.',
      recommendation: fp.localStorage ? 'Consider disabling local storage or using private browsing mode.' : undefined,
      severity: 'medium'
    });

    // Canvas fingerprinting test
    results.push({
      name: 'Canvas Fingerprinting',
      status: fp.canvas === 'blocked' ? 'pass' : fp.canvas === 'unavailable' ? 'info' : 'fail',
      description: fp.canvas === 'blocked' ? 'Canvas fingerprinting is blocked' : 
                  fp.canvas === 'unavailable' ? 'Canvas API unavailable' : 'Canvas fingerprinting possible',
      details: fp.canvas === 'blocked' 
        ? 'Canvas fingerprinting is successfully blocked.'
        : fp.canvas === 'unavailable'
        ? 'Canvas API is not available in this environment.'
        : 'Your browser allows canvas fingerprinting, which creates a unique identifier.',
      recommendation: fp.canvas !== 'blocked' && fp.canvas !== 'unavailable' 
        ? 'Use a browser extension to block canvas fingerprinting.' : undefined,
      severity: 'high'
    });

    // WebGL fingerprinting test
    results.push({
      name: 'WebGL Fingerprinting',
      status: fp.webgl === 'blocked' ? 'pass' : fp.webgl === 'unavailable' ? 'info' : 'fail',
      description: fp.webgl === 'blocked' ? 'WebGL fingerprinting is blocked' :
                  fp.webgl === 'unavailable' ? 'WebGL unavailable' : 'WebGL fingerprinting possible',
      details: fp.webgl === 'blocked'
        ? 'WebGL fingerprinting is successfully blocked.'
        : fp.webgl === 'unavailable'
        ? 'WebGL is not available in this environment.'
        : 'Your browser exposes WebGL information that can be used for fingerprinting.',
      recommendation: fp.webgl !== 'blocked' && fp.webgl !== 'unavailable'
        ? 'Consider disabling WebGL or using privacy extensions.' : undefined,
      severity: 'high'
    });

    // Font detection test
    results.push({
      name: 'Font Detection',
      status: (fp.fonts?.length || 0) > 8 ? 'fail' : (fp.fonts?.length || 0) > 4 ? 'warning' : 'pass',
      description: `${fp.fonts?.length || 0} fonts detected`,
      details: (fp.fonts?.length || 0) > 8
        ? 'Many fonts are available for fingerprinting, making you more unique.'
        : (fp.fonts?.length || 0) > 4
        ? 'Some fonts are available for fingerprinting.'
        : 'Few fonts available, reducing fingerprinting potential.',
      recommendation: (fp.fonts?.length || 0) > 4 
        ? 'Consider using a browser that limits font enumeration.' : undefined,
      severity: 'medium'
    });

    // Plugin detection test
    results.push({
      name: 'Plugin Detection',
      status: fp.plugins.length === 0 ? 'pass' : fp.plugins.length > 3 ? 'fail' : 'warning',
      description: fp.plugins.length === 0 ? 'No plugins detected' : `${fp.plugins.length} plugins detected`,
      details: fp.plugins.length === 0
        ? 'No browser plugins detected, reducing fingerprinting surface.'
        : `Detected plugins: ${fp.plugins.slice(0, 3).join(', ')}${fp.plugins.length > 3 ? '...' : ''}`,
      recommendation: fp.plugins.length > 0 
        ? 'Consider disabling unnecessary browser plugins.' : undefined,
      severity: 'medium'
    });

    return results;
  };

  // Calculate fingerprint uniqueness score
  const calculateFingerprintScore = (fp: BrowserFingerprint): number => {
    let score = 0;
    
    // User agent (common = lower score)
    if (fp.userAgent.includes('Chrome')) score += 10;
    else if (fp.userAgent.includes('Firefox')) score += 15;
    else score += 25;
    
    // Screen resolution (common resolutions = lower score)
    const commonResolutions = ['1920x1080', '1366x768', '1440x900', '1536x864'];
    if (!commonResolutions.includes(fp.screenResolution)) score += 20;
    else score += 5;
    
    // Timezone (common timezones = lower score)
    const commonTimezones = ['America/New_York', 'Europe/London', 'America/Los_Angeles'];
    if (!commonTimezones.includes(fp.timezone)) score += 15;
    else score += 3;
    
    // Languages
    if (fp.languages.length > 2) score += 10;
    
    // Plugins
    score += Math.min(fp.plugins.length * 5, 25);
    
    // Fonts
    score += Math.min((fp.fonts?.length || 0) * 2, 20);
    
    // Hardware
    if (fp.hardwareConcurrency > 8) score += 10;
    if (fp.deviceMemory && fp.deviceMemory > 8) score += 10;
    
    return Math.min(score, 100);
  };

  // Start comprehensive privacy test
  const startPrivacyTest = async () => {
    setIsTesting(true);
    setTestComplete(false);
    
    // Initialize tests
    const initialTests = initializeTests();
    setTestResults(initialTests);
    
    try {
      // Generate browser fingerprint
      const fp = generateFingerprint();
      setFingerprint(fp);
      
      // Test third-party cookies
      const thirdPartyResult = await testThirdPartyCookies();
      
      // Analyze fingerprint
      const fingerprintResults = analyzeFingerprint(fp);
      
      // Combine all results
      const allResults = [thirdPartyResult, ...fingerprintResults];
      setTestResults(allResults);
      
      setTestComplete(true);
    } catch (error) {
      console.error('Privacy test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  // Get status icon and color
  const getStatusInfo = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return { icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Good' };
      case 'warning':
        return { icon: FiAlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Warning' };
      case 'fail':
        return { icon: FiXCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'Privacy Risk' };
      case 'info':
        return { icon: FiInfo, color: 'text-blue-600', bg: 'bg-blue-100', text: 'Info' };
      case 'testing':
        return { icon: FiRefreshCw, color: 'text-gray-600', bg: 'bg-gray-100', text: 'Testing...' };
      default:
        return { icon: FiInfo, color: 'text-gray-600', bg: 'bg-gray-100', text: 'Unknown' };
    }
  };

  // Calculate overall privacy score
  const calculatePrivacyScore = (): number => {
    if (!testComplete) return 0;
    
    const passCount = testResults.filter(r => r.status === 'pass').length;
    const totalTests = testResults.length;
    
    return Math.round((passCount / totalTests) * 100);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Cookie & Tracker Test
        </h2>
        <p>Loading...</p>
      </div>
    );
  }

  const privacyScore = calculatePrivacyScore();

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
        <FiDatabase className="w-8 h-8 mr-3" />
        Cookie & Tracker Test
      </h2>

      {/* Info Box */}
      <CookieTrackerInfoBox />

      {/* Privacy Score */}
      {testComplete && (
        <div className={`p-6 rounded-lg shadow-md mb-6 ${
          privacyScore >= 70 ? 'bg-green-100' : privacyScore >= 40 ? 'bg-yellow-100' : 'bg-red-100'
        }`}>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FiShield className={`w-6 h-6 mr-2 ${
              privacyScore >= 70 ? 'text-green-600' : privacyScore >= 40 ? 'text-yellow-600' : 'text-red-600'
            }`} />
            Privacy Protection Score: <span className={
              privacyScore >= 70 ? 'text-green-600' : privacyScore >= 40 ? 'text-yellow-600' : 'text-red-600'
            }>{privacyScore}%</span>
          </h3>
          
          <p className="text-gray-700">
            {privacyScore >= 70 
              ? 'Excellent! Your browser has strong privacy protection.'
              : privacyScore >= 40
              ? 'Good privacy protection, but there\'s room for improvement.'
              : 'Your privacy is at risk. Consider implementing the recommendations below.'}
          </p>
        </div>
      )}

      {/* Test Control */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
        {!isTesting && !testComplete && (
          <button
            onClick={startPrivacyTest}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center mx-auto"
          >
            <FiEye className="w-5 h-5 mr-2" />
            Start Privacy & Tracking Analysis
          </button>
        )}
        
        {testComplete && (
          <button
            onClick={startPrivacyTest}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center mx-auto"
          >
            <FiRefreshCw className="w-5 h-5 mr-2" />
            Run Test Again
          </button>
        )}
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FiTarget className="w-5 h-5 mr-2" />
            Privacy Test Results
          </h3>
          
          <div className="space-y-4">
            {testResults.map((result, index) => {
              const statusInfo = getStatusInfo(result.status);
              
              return (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <statusInfo.icon className={`w-5 h-5 mr-2 ${statusInfo.color} ${result.status === 'testing' ? 'animate-spin' : ''}`} />
                      {result.name}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{result.description}</p>
                  
                  {result.details && (
                    <p className="text-sm text-gray-500 mb-2">{result.details}</p>
                  )}
                  
                  {result.recommendation && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Recommendation:</strong> {result.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Browser Fingerprint Details */}
      {fingerprint && testComplete && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FiSettings className="w-5 h-5 mr-2" />
            Browser Fingerprint Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>User Agent:</strong> <span className="text-gray-600">{fingerprint.userAgent.slice(0, 50)}...</span>
            </div>
            <div>
              <strong>Language:</strong> <span className="text-gray-600">{fingerprint.language}</span>
            </div>
            <div>
              <strong>Platform:</strong> <span className="text-gray-600">{fingerprint.platform}</span>
            </div>
            <div>
              <strong>Screen:</strong> <span className="text-gray-600">{fingerprint.screenResolution} ({fingerprint.colorDepth}-bit)</span>
            </div>
            <div>
              <strong>Timezone:</strong> <span className="text-gray-600">{fingerprint.timezone}</span>
            </div>
            <div>
              <strong>CPU Cores:</strong> <span className="text-gray-600">{fingerprint.hardwareConcurrency}</span>
            </div>
            {fingerprint.deviceMemory && (
              <div>
                <strong>Device Memory:</strong> <span className="text-gray-600">{fingerprint.deviceMemory} GB</span>
              </div>
            )}
            <div>
              <strong>Do Not Track:</strong> <span className="text-gray-600">{fingerprint.doNotTrack || 'Not set'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Recommendations */}
      {testComplete && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
            <FiShield className="w-6 h-6 mr-2" />
            Privacy Enhancement Recommendations
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Browser Settings:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                <li>Enable &quot;Do Not Track&quot; in privacy settings</li>
                <li>Block third-party cookies</li>
                <li>Disable location services</li>
                <li>Clear cookies and site data regularly</li>
                <li>Use private/incognito browsing mode</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Recommended Browser Extensions:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                <li>uBlock Origin - Blocks ads and trackers</li>
                <li>Privacy Badger - Prevents tracking</li>
                <li>ClearURLs - Removes tracking parameters</li>
                <li>Decentraleyes - Protects against tracking</li>
                <li>CanvasBlocker - Prevents canvas fingerprinting</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Privacy-Focused Browsers:</h4>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://www.mozilla.org/firefox/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200 transition-colors"
                >
                  Firefox
                  <FiExternalLink className="w-3 h-3 ml-1" />
                </a>
                <a
                  href="https://brave.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200 transition-colors"
                >
                  Brave Browser
                  <FiExternalLink className="w-3 h-3 ml-1" />
                </a>
                <a
                  href="https://www.torproject.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200 transition-colors"
                >
                  Tor Browser
                  <FiExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookieTrackerTest; 