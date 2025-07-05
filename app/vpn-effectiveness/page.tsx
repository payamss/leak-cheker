'use client';

import { useState, useEffect } from 'react';
import { VPNEffectivenessService, type VPNEffectivenessResult } from '../../utils/vpn-effectiveness';

const TABS = [
  { key: 'tech', label: 'Technical Data' },
  { key: 'compare', label: 'Comparison' },
  { key: 'suggestions', label: 'Suggestions' },
];

const VPNEffectivenessPage = () => {
  const [result, setResult] = useState<VPNEffectivenessResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tech' | 'compare' | 'suggestions'>('tech');
  const [baseline, setBaseline] = useState<any | null>(null);
  const [vpnTest, setVpnTest] = useState<any | null>(null);
  const [testing, setTesting] = useState<'baseline' | 'vpn' | null>(null);
  const [progress, setProgress] = useState<number>(0);

  // Run actual VPN effectiveness tests
  const runAllTests = async () => {
    setProgress(0);
    const vpnService = VPNEffectivenessService.getInstance();
    
    setProgress(20);
    const testResult = await vpnService.runComprehensiveVPNTest();
    setProgress(100);
    
    // Get public IP address separately
    let publicIP = 'Unknown';
    let ispInfo = 'Unknown';
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      if (!ipResponse.ok) throw new Error('Failed to fetch IP');
      const ipData = await ipResponse.json();
      publicIP = ipData.ip || 'Unknown';
      ispInfo = ipData.org || 'Unknown';
    } catch (error) {
      console.warn('Could not fetch IP:', error);
    }
    
    // Extract the actual data for comparison
    const actualData = {
      ip: publicIP,
      dns: [], // Will need to extract from DNS test details
      isp: ispInfo,
      geo: `${testResult.metadata?.estimatedLocation?.city || ''}, ${testResult.metadata?.estimatedLocation?.country || ''}`.trim().replace(/^,\s*/, '') || 'Unknown',
      // Section scores based on actual test results
      sections: {
        ip: { 
          score: testResult.categories?.ipProtection?.categoryScore || 0, 
          passed: testResult.categories?.ipProtection?.tests?.filter(t => t.status === 'pass').length || 0, 
          total: testResult.categories?.ipProtection?.tests?.length || 3, 
          issues: testResult.categories?.ipProtection?.tests?.filter(t => t.status === 'fail').map(t => t.description) || [] 
        },
        dns: { 
          score: testResult.categories?.dnsProtection?.categoryScore || 0, 
          passed: testResult.categories?.dnsProtection?.tests?.filter(t => t.status === 'pass').length || 0, 
          total: testResult.categories?.dnsProtection?.tests?.length || 2, 
          issues: testResult.categories?.dnsProtection?.tests?.filter(t => t.status === 'fail').map(t => t.description) || [] 
        },
        location: { 
          score: testResult.categories?.locationPrivacy?.categoryScore || 0, 
          passed: testResult.categories?.locationPrivacy?.tests?.filter(t => t.status === 'pass').length || 0, 
          total: testResult.categories?.locationPrivacy?.tests?.length || 2, 
          issues: testResult.categories?.locationPrivacy?.tests?.filter(t => t.status === 'fail').map(t => t.description) || [] 
        },
        advanced: { 
          score: testResult.categories?.advancedPrivacy?.categoryScore || 0, 
          passed: testResult.categories?.advancedPrivacy?.tests?.filter(t => t.status === 'pass').length || 0, 
          total: testResult.categories?.advancedPrivacy?.tests?.length || 2, 
          issues: testResult.categories?.advancedPrivacy?.tests?.filter(t => t.status === 'fail').map(t => t.description) || [] 
        }
      }
    };
    
    return actualData;
  };

  // Baseline test
  const runBaselineTest = async () => {
    setTesting('baseline');
    setVpnTest(null);
    const result = await runAllTests();
    setBaseline(result);
    setTesting(null);
  };

  // VPN test
  const runVPNTest = async () => {
    setTesting('vpn');
    const result = await runAllTests();
    setVpnTest(result);
    setTesting(null);
  };

  useEffect(() => {
    runBaselineTest();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('vpn_baseline');
    if (saved) {
      setBaseline(JSON.parse(saved));
    }
  }, []);

  const saveBaseline = (currentData: any) => {
    localStorage.setItem('vpn_baseline', JSON.stringify(currentData));
    setBaseline(currentData);
  };

  const clearBaseline = () => {
    localStorage.removeItem('vpn_baseline');
    setBaseline(null);
  };

  const compareToBaseline = (currentData: any) => {
    if (!baseline) return;
    let changes = [];
    if (baseline.ip !== currentData.ip) changes.push('Public IP');
    if (baseline.dns && currentData.dns && JSON.stringify(baseline.dns) !== JSON.stringify(currentData.dns)) changes.push('DNS Servers');
    if (baseline.isp !== currentData.isp) changes.push('ISP');
    if (baseline.geo !== currentData.geo) changes.push('Geolocation');
    if (changes.length > 0) {
      setResult({ ...currentData, vpnStatus: 'poor', overallScore: 0, maxPossibleScore: 100, summary: { testsPassed: 0, totalTests: 0, criticalIssues: changes.length } });
    } else {
      setResult({ ...currentData, vpnStatus: 'excellent', overallScore: 100, maxPossibleScore: 100, summary: { testsPassed: 0, totalTests: 0, criticalIssues: 0 } });
    }
  };

  const getStatusColor = (status: 'excellent' | 'good' | 'poor' | 'critical' | 'unknown') => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'poor': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTestStatusIcon = (status: 'pass' | 'fail' | 'warning' | 'unknown') => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'warning': return '⚠️';
      default: return '❓';
    }
  };

  const getTestStatusColor = (status: 'pass' | 'fail' | 'warning' | 'unknown') => {
    switch (status) {
      case 'pass': return 'text-green-700 bg-green-50 border-green-200';
      case 'fail': return 'text-red-700 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  // Heuristics status badge
  const heuristicsStatus = result && typeof result === 'object' && 'heuristicsStatus' in result && result.heuristicsStatus
    ? result.heuristicsStatus as 'vpn_detected' | 'no_vpn' | 'inconclusive'
    : 'inconclusive';
  const heuristicsBadge = {
    vpn_detected: { text: 'VPN Detected', color: 'bg-green-100 text-green-700' },
    no_vpn: { text: 'No VPN Detected', color: 'bg-red-100 text-red-700' },
    inconclusive: { text: 'Inconclusive', color: 'bg-yellow-100 text-yellow-700' }
  }[heuristicsStatus];

  // Data comparison table
  const DataComparison = ({ baseline, vpn }: { baseline: any, vpn: any }) => {
    if (!baseline || typeof baseline !== 'object' || !('ip' in baseline)) {
      return (
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-5 mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-3">Connection Data Comparison</h3>
          <div className="text-red-600">No baseline data available.</div>
        </div>
      );
    }
    return (
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-5 mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-3">Connection Data Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left px-2 py-2 border-b">Data Type</th>
                <th className="text-left px-2 py-2 border-b">Baseline (No VPN)</th>
                <th className="text-left px-2 py-2 border-b">VPN Test</th>
                <th className="text-left px-2 py-2 border-b">Changed?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 py-2 border-b font-medium">Public IP</td>
                <td className="px-2 py-2 border-b">{baseline.ip ?? '—'}</td>
                <td className="px-2 py-2 border-b">{vpn && vpn.ip ? vpn.ip : '—'}</td>
                <td className="px-2 py-2 border-b">
                  {vpn && vpn.ip && baseline.ip !== undefined && vpn.ip !== undefined && baseline.ip !== vpn.ip ? 
                    <span className="text-green-600 font-bold">✓ Changed</span> : 
                    <span className="text-red-600">✗ Same</span>
                  }
                </td>
              </tr>
              <tr>
                <td className="px-2 py-2 border-b font-medium">ISP</td>
                <td className="px-2 py-2 border-b">{baseline.isp ?? '—'}</td>
                <td className="px-2 py-2 border-b">{vpn && vpn.isp ? vpn.isp : '—'}</td>
                <td className="px-2 py-2 border-b">
                  {vpn && vpn.isp && baseline.isp !== undefined && vpn.isp !== undefined && baseline.isp !== vpn.isp ? 
                    <span className="text-green-600 font-bold">✓ Changed</span> : 
                    <span className="text-red-600">✗ Same</span>
                  }
                </td>
              </tr>
              <tr>
                <td className="px-2 py-2 border-b font-medium">Location</td>
                <td className="px-2 py-2 border-b">{baseline.geo ?? '—'}</td>
                <td className="px-2 py-2 border-b">{vpn && vpn.geo ? vpn.geo : '—'}</td>
                <td className="px-2 py-2 border-b">
                  {vpn && vpn.geo && baseline.geo !== undefined && vpn.geo !== undefined && baseline.geo !== vpn.geo ? 
                    <span className="text-green-600 font-bold">✓ Changed</span> : 
                    <span className="text-red-600">✗ Same</span>
                  }
                </td>
              </tr>
              <tr>
                <td className="px-2 py-2 font-medium">DNS Servers</td>
                <td className="px-2 py-2">{Array.isArray(baseline.dns) ? baseline.dns.join(', ') : baseline.dns ?? '—'}</td>
                <td className="px-2 py-2">{vpn && vpn.dns ? (Array.isArray(vpn.dns) ? vpn.dns.join(', ') : vpn.dns) : '—'}</td>
                <td className="px-2 py-2">
                  {vpn && vpn.dns && baseline.dns !== undefined && vpn.dns !== undefined && JSON.stringify(baseline.dns) !== JSON.stringify(vpn.dns) ? 
                    <span className="text-green-600 font-bold">✓ Changed</span> : 
                    <span className="text-red-600">✗ Same</span>
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Section comparison UI (updated to use sections from actual data)
  const SectionComparison = ({ section, baseline, vpn }: { section: string, baseline: any, vpn: any }) => {
    if (!baseline || typeof baseline !== 'object') {
      return (
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-5 mb-4">
          <h4 className="text-base sm:text-lg font-semibold text-blue-700 mb-2 capitalize">{section.replace(/_/g, ' ')} Protection</h4>
          <div className="text-red-600">No baseline data for this section.</div>
        </div>
      );
    }
    return (
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-5 mb-4">
        <h4 className="text-base sm:text-lg font-semibold text-blue-700 mb-2 capitalize">{section.replace(/_/g, ' ')} Protection</h4>
        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
          <div>
            <div className="font-semibold text-gray-700">Baseline</div>
            <div className="mb-1">Score: <span className="font-bold">{baseline.score ?? '—'}%</span></div>
            <div className="mb-1">{baseline.passed ?? '—'}/{baseline.total ?? '—'} tests passed</div>
            {Array.isArray(baseline.issues) && baseline.issues.length > 0 && (
              <ul className="list-disc list-inside text-red-600">
                {baseline.issues.map((issue: string, i: number) => <li key={i}>{issue}</li>)}
              </ul>
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-700">VPN</div>
            {vpn ? (
              <>
                <div className="mb-1">Score: <span className="font-bold">{vpn.score ?? '—'}%</span></div>
                <div className="mb-1">{vpn.passed ?? '—'}/{vpn.total ?? '—'} tests passed</div>
                {Array.isArray(vpn.issues) && vpn.issues.length > 0 && (
                  <ul className="list-disc list-inside text-red-600">
                    {vpn.issues.map((issue: string, i: number) => <li key={i}>{issue}</li>)}
                  </ul>
                )}
                <div className="mt-1 font-semibold">
                  {typeof vpn.score === 'number' && typeof baseline.score === 'number' ? (
                    vpn.score > baseline.score ? <span className="text-green-700">Improved</span>
                      : vpn.score < baseline.score ? <span className="text-red-700">Worse</span>
                      : <span className="text-gray-700">No Change</span>
                  ) : null}
                </div>
              </>
            ) : <span className="text-gray-500">Not tested</span>}
          </div>
        </div>
      </div>
    );
  };

  // Step 1: Baseline
  const Step1 = () => (
    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4 max-w-xl mx-auto">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">Step 1: Test Your Baseline (VPN OFF)</h3>
      <p className="text-sm text-blue-700 mb-3">
        First, we need to see your real IP, DNS, and location <b>without VPN</b>.<br/>
        <span className="block mt-2 text-xs text-blue-900">This will be your baseline. After you enable your VPN, we'll test again and show you exactly what changed—so you can see if your VPN is really protecting you.</span>
      </p>
      <button onClick={runBaselineTest} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold">
        Test Baseline (VPN Off)
      </button>
      {testing === 'baseline' && (
        <div className="mt-4">
          <div className="text-blue-700 font-semibold mb-2">Running baseline test...</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );

  // Step 2: VPN
  const Step2 = () => (
    <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4 max-w-xl mx-auto">
      <h3 className="text-lg font-semibold text-green-800 mb-2">Step 2: Test With VPN (VPN ON)</h3>
      <p className="text-sm text-green-700 mb-3">
        Now turn <b>ON</b> your VPN and test again to compare the results.<br/>
        <span className="block mt-2 text-xs text-green-900">We'll show you a side-by-side comparison of your connection details and privacy protections before and after VPN.</span>
      </p>
      <button onClick={runVPNTest} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold">
        Test with VPN
      </button>
      {testing === 'vpn' && (
        <div className="mt-4">
          <div className="text-green-700 font-semibold mb-2">Running VPN test...</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );

  // Tab bar UI
  const renderTabBar = () => (
    <div className="flex space-x-2 mb-4 border-b border-gray-200">
      {TABS.map(tab => (
        <button
          key={tab.key}
          className={`px-4 py-2 font-semibold rounded-t-md focus:outline-none transition-colors duration-150 ${activeTab === tab.key ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600' : 'bg-gray-50 text-gray-600 hover:bg-blue-50'}`}
          onClick={() => setActiveTab(tab.key as any)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  // Technical Data Tab Content
  const TechnicalDataTab = () => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold text-blue-700 mb-2">Technical Data</h3>
      {baseline && vpnTest ? (
        <>
          <div className="mb-2 font-semibold text-blue-800">Baseline (No VPN):</div>
          <div className="mb-2"><span className="font-semibold">Public IP:</span> {baseline.ip ?? '—'}</div>
          <div className="mb-2"><span className="font-semibold">ISP:</span> {baseline.isp ?? '—'}</div>
          <div className="mb-2"><span className="font-semibold">Location:</span> {baseline.geo ?? '—'}</div>
          <div className="mb-2"><span className="font-semibold">DNS Servers:</span> {Array.isArray(baseline.dns) ? baseline.dns.join(', ') : baseline.dns ?? '—'}</div>
          <div className="mt-4 font-semibold text-green-800">VPN Test:</div>
          <div className="mb-2"><span className="font-semibold">Public IP:</span> {vpnTest.ip ?? '—'}</div>
          <div className="mb-2"><span className="font-semibold">ISP:</span> {vpnTest.isp ?? '—'}</div>
          <div className="mb-2"><span className="font-semibold">Location:</span> {vpnTest.geo ?? '—'}</div>
          <div className="mb-2"><span className="font-semibold">DNS Servers:</span> {Array.isArray(vpnTest.dns) ? vpnTest.dns.join(', ') : vpnTest.dns ?? '—'}</div>
        </>
      ) : (
        <div className="text-gray-500">No technical data available. Please complete both tests.</div>
      )}
    </div>
  );

  // Comparison Tab Content
  const ComparisonTab = () => (
    <>
      {baseline && vpnTest ? (
        <>
          {/* Key VPN Effectiveness Indicators */}
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Key VPN Effectiveness Indicators</h4>
            <ul className="space-y-1 text-sm">
              <li>
                {baseline.ip !== vpnTest.ip
                  ? <span className="text-green-700 font-bold">✔</span>
                  : <span className="text-red-700 font-bold">✗</span>}
                <span className="ml-2">Public IP changed</span>
              </li>
              <li>
                {JSON.stringify(baseline.dns) !== JSON.stringify(vpnTest.dns)
                  ? <span className="text-green-700 font-bold">✔</span>
                  : <span className="text-red-700 font-bold">✗</span>}
                <span className="ml-2">DNS resolvers changed</span>
              </li>
              <li>
                {baseline.geo !== vpnTest.geo
                  ? <span className="text-green-700 font-bold">✔</span>
                  : <span className="text-yellow-700 font-bold">~</span>}
                <span className="ml-2">Geolocation changed</span>
              </li>
              <li>
                {typeof baseline.webrtcLeakSuppressed !== 'undefined' && typeof vpnTest.webrtcLeakSuppressed !== 'undefined' ? (
                  vpnTest.webrtcLeakSuppressed
                    ? <span className="text-green-700 font-bold">✔</span>
                    : <span className="text-red-700 font-bold">✗</span>
                ) : <span className="text-gray-500 font-bold">?</span>}
                <span className="ml-2">WebRTC leak suppressed</span>
              </li>
            </ul>
          </div>
          <DataComparison baseline={baseline} vpn={vpnTest} />
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-3">Protection Analysis by Category</h3>
            {['ip', 'dns', 'location', 'advanced'].map(section => (
              <SectionComparison
                key={section}
                section={section}
                baseline={baseline.sections && baseline.sections[section] ? baseline.sections[section] : undefined}
                vpn={vpnTest && vpnTest.sections && vpnTest.sections[section] ? vpnTest.sections[section] : undefined}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-gray-500">No comparison available. Please complete both tests.</div>
      )}
    </>
  );

  // Suggestions Tab Content
  const SuggestionsTab = () => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold text-blue-700 mb-2">Suggestions & Recommendations</h3>
      {baseline && vpnTest ? (
        <ul className="list-disc list-inside text-sm text-gray-700">
          {/* Example: You can replace with real recommendations from your testResult if available */}
          <li>Use a reputable VPN provider for better privacy.</li>
          <li>Check your DNS settings to avoid leaks.</li>
          <li>Enable WebRTC leak protection in your browser.</li>
          <li>Compare your IP and DNS before and after VPN activation.</li>
        </ul>
      ) : (
        <div className="text-gray-500">No suggestions available. Please complete both tests.</div>
      )}
    </div>
  );

  // Main render
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-4 sm:mb-6 text-center">VPN Effectiveness Dashboard</h2>
      {/* Step 1 only if no baseline */}
      {!baseline && <Step1 />}
      {/* Step 2 only if baseline exists and no vpnTest yet */}
      {baseline && !vpnTest && <Step2 />}
      {/* Tabs only if both tests are done */}
      {baseline && vpnTest && (
        <>
          {renderTabBar()}
          {activeTab === 'tech' && <TechnicalDataTab />}
          {activeTab === 'compare' && <ComparisonTab />}
          {activeTab === 'suggestions' && <SuggestionsTab />}
        </>
      )}
      {/* Reset Button always available if any test is done */}
      {(baseline || vpnTest) && (
        <button onClick={() => { setBaseline(null); setVpnTest(null); }} className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded mt-4 w-full">
          Reset and Start Over
        </button>
      )}
    </div>
  );
};

export default VPNEffectivenessPage; 