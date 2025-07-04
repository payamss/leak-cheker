/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useEffect } from 'react';
import { VPNEffectivenessService} from '../../utils/vpn-effectiveness';
import { fetchDNSServers } from '../../utils/dnsTestApi';
import Image from 'next/image';

const TABS = [
  { key: 'tech', label: 'Technical Data' },
  { key: 'compare', label: 'Comparison' },
  { key: 'suggestions', label: 'Suggestions' },
];

const VPNEffectivenessPage = () => {
  const [activeTab, setActiveTab] = useState<'tech' | 'compare' | 'suggestions'>('tech');
  const [baseline, setBaseline] = useState<any | null>(null);
  const [vpnTest, setVpnTest] = useState<any | null>(null);
  const [testing, setTesting] = useState<'baseline' | 'vpn' | null>(null);
  const [progress, setProgress] = useState<number>(0);

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

  // Run actual VPN effectiveness tests
  const runAllTests = async () => {
    setProgress(0);
    const vpnService = VPNEffectivenessService.getInstance();
    
    setProgress(20);
    const testResult = await vpnService.runComprehensiveVPNTest();
    setProgress(40);
    // Get public IP address and details from ipwhois
    let ipData = {
      ip: 'Unknown',
      org: 'Unknown',
      isp: 'Unknown',
      country: 'Unknown',
      country_code: '',
      region: 'Unknown',
      city: 'Unknown',
      asn: 'Unknown',
      timezone: 'Unknown',
      country_flag: '',
      latitude: null,
      longitude: null,
    };
    try {
      const ipResponse = await fetch('https://ipwhois.app/json/');
      if (!ipResponse.ok) throw new Error('Failed to fetch IP');
      const ipJson = await ipResponse.json();
      ipData = {
        ip: ipJson.ip || 'Unknown',
        org: ipJson.org || 'Unknown',
        isp: ipJson.isp || 'Unknown',
        country: ipJson.country || 'Unknown',
        country_code: ipJson.country_code || '',
        region: ipJson.region || 'Unknown',
        city: ipJson.city || 'Unknown',
        asn: ipJson.asn || 'Unknown',
        timezone: ipJson.timezone || 'Unknown',
        country_flag: ipJson.country_flag || '',
        latitude: ipJson.latitude ?? null,
        longitude: ipJson.longitude ?? null,
      };
    } catch (error) {
      console.warn('Could not fetch IP:', error);
    }
    setProgress(60);
    // Fetch DNS servers (parallel to DNS Leak Test logic)
    let detectedDNSServers: string[] = [];
    try {
      const fetchPromises = dnsTestEndpoints.map(async (endpoint) => {
        try {
          const data = await fetchDNSServers(endpoint);
          if (data && typeof data === 'object') {
            // Try to extract IP from various possible fields
            const ipString = data.ip || data.query || data.ipAddress || data.ip_addr || data;
            return ipString || null;
          }
          return null;
        } catch (err) {
          console.warn('Failed to detect DNS servers:', err);
          return null;
        }
      });
      const results = await Promise.all(fetchPromises);
      detectedDNSServers = results.filter((ip): ip is string => !!ip && typeof ip === 'string');
    } catch (err) {
      console.warn('Failed to detect DNS servers:', err);
    }
    setProgress(80);
    // Group subtests by category
    const groupTestsByCategory = (tests: any[]) => {
      const grouped: Record<string, any[]> = { ip: [], dns: [], location: [], advanced: [] };
      tests.forEach(test => {
        const name = test.testName.toLowerCase();
        if (name.includes('webrtc') || name.includes('public ip') || name.includes('ipv6')) grouped.ip.push(test);
        else if (name.includes('dns')) grouped.dns.push(test);
        else if (name.includes('location')) grouped.location.push(test);
        else grouped.advanced.push(test);
      });
      return grouped;
    };
    const allTests = [
      ...(testResult.categories?.ipProtection?.tests || []),
      ...(testResult.categories?.dnsProtection?.tests || []),
      ...(testResult.categories?.locationPrivacy?.tests || []),
      ...(testResult.categories?.advancedPrivacy?.tests || []),
    ];
    const grouped = groupTestsByCategory(allTests);
    // Extract the actual data for comparison
    const actualData = {
      ...ipData,
      dns: detectedDNSServers,
      geo: `${testResult.metadata?.estimatedLocation?.city || ''}, ${testResult.metadata?.estimatedLocation?.country || ''}`.trim().replace(/^,\s*/, '') || 'Unknown',
      sections: {
        ip: {
          score: testResult.categories?.ipProtection?.categoryScore || 0,
          passed: testResult.categories?.ipProtection?.tests?.filter(t => t.status === 'pass').length || 0,
          total: testResult.categories?.ipProtection?.tests?.length || 3,
          issues: testResult.categories?.ipProtection?.tests?.filter(t => t.status === 'fail').map(t => t.description) || [],
          tests: grouped.ip
        },
        dns: {
          score: testResult.categories?.dnsProtection?.categoryScore || 0,
          passed: testResult.categories?.dnsProtection?.tests?.filter(t => t.status === 'pass').length || 0,
          total: testResult.categories?.dnsProtection?.tests?.length || 2,
          issues: testResult.categories?.dnsProtection?.tests?.filter(t => t.status === 'fail').map(t => t.description) || [],
          tests: grouped.dns
        },
        location: {
          score: testResult.categories?.locationPrivacy?.categoryScore || 0,
          passed: testResult.categories?.locationPrivacy?.tests?.filter(t => t.status === 'pass').length || 0,
          total: testResult.categories?.locationPrivacy?.tests?.length || 2,
          issues: testResult.categories?.locationPrivacy?.tests?.filter(t => t.status === 'fail').map(t => t.description) || [],
          tests: grouped.location
        },
        advanced: {
          score: testResult.categories?.advancedPrivacy?.categoryScore || 0,
          passed: testResult.categories?.advancedPrivacy?.tests?.filter(t => t.status === 'pass').length || 0,
          total: testResult.categories?.advancedPrivacy?.tests?.length || 2,
          issues: testResult.categories?.advancedPrivacy?.tests?.filter(t => t.status === 'fail').map(t => t.description) || [],
          tests: grouped.advanced
        }
      }
    };
    
    setProgress(100);
    
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
    const saved = localStorage.getItem('vpn_baseline');
    if (saved) {
      setBaseline(JSON.parse(saved));
    }
  }, []);

  // Category explanations
  const CATEGORY_EXPLANATIONS: Record<string, string> = {
    ip: 'Checks if your real IP address is exposed (e.g., via WebRTC) or if your VPN is masking it.',
    dns: 'Checks if your DNS queries are private or if your real DNS servers are exposed (DNS leak).',
    location: 'Checks if your real location (country, city) can be determined despite VPN.',
    advanced: 'Checks for advanced privacy issues (e.g., fingerprinting, tracking, etc.).',
  };

  // Verdict helpers
  const getCategoryVerdict = (score: number, passed: number, total: number) => {
    if (score >= 90 || passed === total) return { verdict: 'Protected', icon: '✔', color: 'text-green-700 bg-green-100 border-green-300' };
    if (score >= 50 || passed > 0) return { verdict: 'Partially Protected', icon: '⚠️', color: 'text-yellow-700 bg-yellow-100 border-yellow-300' };
    return { verdict: 'Not Protected', icon: '✗', color: 'text-red-700 bg-red-100 border-red-300' };
  };

  // Improved/Worse/No Change badge
  const getChangeBadge = (baselineScore: number, vpnScore: number) => {
    if (vpnScore > baselineScore) return <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700 border border-green-300">↑ Improved</span>;
    if (vpnScore < baselineScore) return <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-300">↓ Worse</span>;
    return <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">No Change</span>;
  };

  // Key issue/success summary
  const getSummary = (section: string, data: any) => {
    if (!data) return null;
    if (data.issues && data.issues.length > 0) {
      return (
        <div className="text-red-700 text-xs mt-1">
          {data.issues.slice(0, 2).map((issue: string, i: number) => <div key={i}>• {issue}</div>)}
        </div>
      );
    }
    if (data.passed === data.total) {
      return <div className="text-green-700 text-xs mt-1">All tests passed. No leaks or exposures detected.</div>;
    }
    if (data.passed > 0) {
      return <div className="text-yellow-700 text-xs mt-1">Some tests passed, but some issues remain.</div>;
    }
    return <div className="text-gray-700 text-xs mt-1">No tests passed. High risk of exposure.</div>;
  };

  // Quick tip for failed/partial
  const getQuickTip = (section: string, data: any) => {
    if (!data) return null;
    if (data.passed === data.total) return null;
    const tips: Record<string, string> = {
      ip: 'Tip: Enable WebRTC leak protection in your browser or VPN. See Suggestions.',
      dns: 'Tip: Enable DNS leak protection in your VPN or use secure DNS servers. See Suggestions.',
      location: 'Tip: Use a VPN server in a different country/city for better location privacy. See Suggestions.',
      advanced: 'Tip: Enable all privacy features in your VPN and browser. See Suggestions.',
    };
    return <div className="text-blue-700 text-xs mt-1">{tips[section]}</div>;
  };

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
    const row = (label: string, b: any, v: any, changed: boolean, extra?: any) => (
      <tr>
        <td className="px-2 py-2 border-b font-medium">{label}</td>
        <td className="px-2 py-2 border-b">{b ?? '—'}{extra?.bFlag}</td>
        <td className="px-2 py-2 border-b">{v ?? '—'}{extra?.vFlag}</td>
        <td className="px-2 py-2 border-b">
          {changed ? <span className="text-green-600 font-bold">✓ Changed</span> : <span className="text-red-600">✗ Same</span>}
        </td>
      </tr>
    );
    return (
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-5 mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-3">Connection Data Comparison</h3>
        <div className="overflow-x-auto w-full">
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
              {row('Public IP', baseline.ip, vpn?.ip, baseline.ip !== vpn?.ip)}
              {row('Country', baseline.country, vpn?.country, baseline.country !== vpn?.country, {
                bFlag: baseline.country_flag ? <Image src={baseline.country_flag} alt="flag" width={20} height={14} className="inline w-5 ml-1 align-middle" /> : null,
                vFlag: vpn?.country_flag ? <Image src={vpn.country_flag} alt="flag" width={20} height={14} className="inline w-5 ml-1 align-middle" /> : null
              })}
              {row('Region', baseline.region, vpn?.region, baseline.region !== vpn?.region)}
              {row('City', baseline.city, vpn?.city, baseline.city !== vpn?.city)}
              {row('ASN', baseline.asn, vpn?.asn, baseline.asn !== vpn?.asn)}
              {row('Org', baseline.org, vpn?.org, baseline.org !== vpn?.org)}
              {row('ISP', baseline.isp, vpn?.isp, baseline.isp !== vpn?.isp)}
              {row('Timezone', baseline.timezone, vpn?.timezone, baseline.timezone !== vpn?.timezone)}
              {row('Location (lat,lon)', `${baseline.latitude},${baseline.longitude}`, `${vpn?.latitude},${vpn?.longitude}`, baseline.latitude !== vpn?.latitude || baseline.longitude !== vpn?.longitude)}
              {row('DNS Servers', Array.isArray(baseline.dns) ? baseline.dns.join(', ') : baseline.dns, Array.isArray(vpn?.dns) ? vpn.dns.join(', ') : vpn?.dns, JSON.stringify(baseline.dns) !== JSON.stringify(vpn?.dns))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Expandable test result component
  const ExpandableTestResult = ({ test }: { test: any }) => {
    const [open, setOpen] = useState(false);
    if (!test) return null;
    const statusIcon = test.status === 'pass' ? '✔' : test.status === 'fail' ? '✗' : '⚠️';
    const statusColor = test.status === 'pass' ? 'text-green-700' : test.status === 'fail' ? 'text-red-700' : 'text-yellow-700';
    return (
      <div className="mb-1 border rounded bg-gray-50">
        <button
          className="w-full flex items-center justify-between px-2 py-2 text-left focus:outline-none active:bg-gray-100"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="flex items-center">
            <span className={`mr-2 font-bold ${statusColor}`}>{statusIcon}</span>
            <span className="font-semibold text-gray-800">{test.testName}</span>
          </span>
          <span className="text-xs text-gray-500">{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <div className="px-3 pb-2 pt-1 text-xs text-gray-700">
            <div className="mb-1"><span className="font-semibold">What it checks:</span> {test.description}</div>
            <div className="mb-1"><span className="font-semibold">Result:</span> <span className={statusColor}>{test.status === 'pass' ? 'Passed' : test.status === 'fail' ? 'Failed' : 'Warning'}</span></div>
            {test.details && <div className="mb-1"><span className="font-semibold">Details:</span> {test.details}</div>}
            {test.status === 'fail' && test.recommendation && (
              <div className="text-blue-700 mt-1">Tip: {test.recommendation}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Section comparison UI (improved with explanation and expandable tests)
  const SectionComparison = ({ section, baseline, vpn }: { section: string, baseline: any, vpn: any }) => {
    const explanation = CATEGORY_EXPLANATIONS[section] || '';
    const verdictBaseline = baseline ? getCategoryVerdict(baseline.score, baseline.passed, baseline.total) : null;
    const verdictVPN = vpn ? getCategoryVerdict(vpn.score, vpn.passed, vpn.total) : null;
    // Special handling for WebRTC leaks in IP Protection
    const renderWebRTCLeak = (data: any, label: string) => {
      if (!data || !data.details) return null;
      if (data.details.includes('WebRTC leaked')) {
        // Extract leaked IPs from details string
        const match = data.details.match(/WebRTC leaked (\d+) IP address\(es\): (.+)/);
        const ips = match && match[2] ? match[2].split(',').map((ip: string) => ip.trim()) : [];
        return (
          <div className="mt-1 text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
            <span className="font-semibold">{label} WebRTC Leak:</span><br />
            {ips.length > 0 ? (
              <>
                <span>Leaked IP{ips.length > 1 ? 's' : ''}: </span>
                <span className="font-mono">{ips.join(', ')}</span>
              </>
            ) : (
              <span>WebRTC leak detected, but no IPs parsed.</span>
            )}
          </div>
        );
      }
      return null;
    };
    // Explanation for IP Protection
    const ipProtectionExplanation = section === 'ip' ? (
      <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
        <b>What is IP Protection?</b><br />
        This test checks if your real IP address is visible to websites, either directly or through browser features like WebRTC. <br />
        <b>Baseline (VPN Off):</b> Your real IP is usually visible (not protected). This is your starting point for comparison.<br />
        <b>VPN:</b> Your real IP should be hidden (protected). If it is still visible, your VPN or browser is leaking your IP.
      </div>
    ) : null;
    // Get subtests for expandable display (if available)
    const getSubtests = (data: any) => {
      if (!data) return [];
      if (Array.isArray(data.tests)) return data.tests;
      if (Array.isArray(data.subtests)) return data.subtests;
      return [];
    };
    // Try to get subtests from details (for IP, DNS, etc.)
    // For now, fallback: if not available, show main test as one subtest
    const baselineSubtests = getSubtests(baseline).length ? getSubtests(baseline) : baseline && baseline.tests ? baseline.tests : baseline ? [baseline] : [];
    const vpnSubtests = getSubtests(vpn).length ? getSubtests(vpn) : vpn && vpn.tests ? vpn.tests : vpn ? [vpn] : [];
    return (
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-5 mb-4 border border-gray-200">
        {ipProtectionExplanation}
        <div className="flex items-center mb-1">
          <h4 className="text-base sm:text-lg font-semibold text-blue-700 mr-2 capitalize">{section.replace(/_/g, ' ')} Protection</h4>
          {vpn && baseline && getChangeBadge(baseline.score, vpn.score)}
        </div>
        <div className="text-xs text-gray-600 mb-2">{explanation}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold border mr-2 ${verdictBaseline?.color}`}>{verdictBaseline?.icon} {verdictBaseline?.verdict}</span>
              <span className="font-semibold text-gray-700">Baseline</span>
            </div>
            <div className="mb-1">Score: <span className="font-bold">{baseline?.score ?? '—'}%</span></div>
            <div className="mb-1">{baseline?.passed ?? '—'}/{baseline?.total ?? '—'} tests passed</div>
            {getSummary(section, baseline)}
            {getQuickTip(section, baseline)}
            {section === 'ip' && renderWebRTCLeak(baseline, 'Baseline')}
            {/* Expandable subtests */}
            <div className="mt-2">
              {baselineSubtests.map((test: any, i: number) => (
                <ExpandableTestResult key={i} test={test} />
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold border mr-2 ${verdictVPN?.color}`}>{verdictVPN?.icon} {verdictVPN?.verdict}</span>
              <span className="font-semibold text-gray-700">VPN</span>
            </div>
            <div className="mb-1">Score: <span className="font-bold">{vpn?.score ?? '—'}%</span></div>
            <div className="mb-1">{vpn?.passed ?? '—'}/{vpn?.total ?? '—'} tests passed</div>
            {getSummary(section, vpn)}
            {getQuickTip(section, vpn)}
            {section === 'ip' && renderWebRTCLeak(vpn, 'VPN')}
            {/* Expandable subtests */}
            <div className="mt-2">
              {vpnSubtests.map((test: any, i: number) => (
                <ExpandableTestResult key={i} test={test} />
              ))}
            </div>
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
        <span className="block mt-2 text-xs text-blue-900">This will be your baseline. After you enable your VPN, we&rsquo;ll test again and show you exactly what changed—so you can see if your VPN is really protecting you.</span>
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
        <span className="block mt-2 text-xs text-green-900">We&apos;ll show you a side-by-side comparison of your connection details and privacy protections before and after VPN.</span>
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
    <div className="flex flex-wrap space-x-2 mb-4 border-b border-gray-200 overflow-x-auto">
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
                {baseline.country !== vpnTest.country
                  ? <span className="text-green-700 font-bold">✔</span>
                  : <span className="text-red-700 font-bold">✗</span>}
                <span className="ml-2">Country changed</span>
              </li>
              <li>
                {baseline.region !== vpnTest.region
                  ? <span className="text-green-700 font-bold">✔</span>
                  : <span className="text-yellow-700 font-bold">~</span>}
                <span className="ml-2">Region changed</span>
              </li>
              <li>
                {baseline.city !== vpnTest.city
                  ? <span className="text-green-700 font-bold">✔</span>
                  : <span className="text-yellow-700 font-bold">~</span>}
                <span className="ml-2">City changed</span>
              </li>
              <li>
                {baseline.asn !== vpnTest.asn
                  ? <span className="text-green-700 font-bold">✔</span>
                  : <span className="text-red-700 font-bold">✗</span>}
                <span className="ml-2">ASN changed</span>
              </li>
              <li>
                {baseline.org !== vpnTest.org
                  ? <span className="text-green-700 font-bold">✔</span>
                  : <span className="text-red-700 font-bold">✗</span>}
                <span className="ml-2">Org changed</span>
              </li>
              <li>
                {baseline.isp !== vpnTest.isp
                  ? <span className="text-green-700 font-bold">✔</span>
                  : <span className="text-red-700 font-bold">✗</span>}
                <span className="ml-2">ISP changed</span>
              </li>
              <li>
                {baseline.timezone !== vpnTest.timezone
                  ? <span className="text-green-700 font-bold">✔</span>
                  : <span className="text-yellow-700 font-bold">~</span>}
                <span className="ml-2">Timezone changed</span>
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
  const SuggestionsTab = () => {
    if (!(baseline && vpnTest)) {
      return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Suggestions & Recommendations</h3>
          <div className="text-gray-500">No suggestions available. Please complete both tests.</div>
        </div>
      );
    }
    // Dynamic suggestions based on comparison
    const suggestions: string[] = [];
    // IP
    if (baseline.ip === vpnTest.ip) {
      suggestions.push('Your public IP did not change after enabling the VPN. This means your VPN is not masking your IP address. Try reconnecting to a different VPN server or contact your VPN provider.');
    } else {
      suggestions.push('Your public IP changed after enabling the VPN. This is a good sign that your VPN is working.');
    }
    // Country
    if (baseline.country === vpnTest.country) {
      suggestions.push('Your country did not change. If you expect to appear in a different country, try selecting a different VPN server location.');
    } else {
      suggestions.push('Your country changed after enabling the VPN. This means your VPN is successfully changing your apparent location.');
    }
    // ASN
    if (baseline.asn === vpnTest.asn) {
      suggestions.push('Your ASN (network provider) did not change. This may indicate your VPN is not routing traffic through a different network. Consider switching VPN servers or providers.');
    } else {
      suggestions.push('Your ASN changed, indicating your VPN is routing traffic through a different network.');
    }
    // Org
    if (baseline.org === vpnTest.org) {
      suggestions.push('Your organization did not change. This may mean your VPN is not fully masking your network identity.');
    } else {
      suggestions.push('Your organization changed, which is expected when using a VPN.');
    }
    // ISP
    if (baseline.isp === vpnTest.isp) {
      suggestions.push('Your ISP did not change. This may mean your VPN is not fully masking your network identity.');
    } else {
      suggestions.push('Your ISP changed, which is expected when using a VPN.');
    }
    // Region/City
    if (baseline.region === vpnTest.region && baseline.city === vpnTest.city) {
      suggestions.push('Your region and city did not change. If you expect to appear in a different location, try a different VPN server.');
    } else {
      suggestions.push('Your region or city changed, which is expected when using a VPN.');
    }
    // Timezone
    if (baseline.timezone === vpnTest.timezone) {
      suggestions.push('Your timezone did not change. Some websites may use this to detect VPN usage. Consider using a VPN with timezone spoofing.');
    } else {
      suggestions.push('Your timezone changed, which helps mask your real location.');
    }
    // DNS
    if (JSON.stringify(baseline.dns) === JSON.stringify(vpnTest.dns)) {
      suggestions.push('Your DNS resolvers did not change. This may indicate a DNS leak. Enable DNS leak protection in your VPN or use secure DNS servers.');
    } else {
      suggestions.push('Your DNS resolvers changed, which is a good sign that your VPN is protecting DNS queries.');
    }
    // WebRTC
    if (typeof baseline.webrtcLeakSuppressed !== 'undefined' && typeof vpnTest.webrtcLeakSuppressed !== 'undefined') {
      if (!vpnTest.webrtcLeakSuppressed) {
        suggestions.push('WebRTC leaks are not suppressed. Enable WebRTC leak protection in your browser or VPN.');
      } else {
        suggestions.push('WebRTC leaks are suppressed.');
      }
    }
    // General
    suggestions.push('For best privacy, always use a reputable VPN provider, enable all privacy features, and periodically test your connection.');
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="text-lg font-semibold text-blue-700 mb-2">Suggestions & Recommendations</h3>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          {suggestions.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>
    );
  };

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
        <button
          onClick={() => {
            setBaseline(null);
            setVpnTest(null);
            // Clear any related localStorage data
            localStorage.removeItem('vpn_baseline');
            localStorage.removeItem('vpn_test');
          }}
          className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded mt-4 w-full max-w-xs mx-auto block"
        >
          Reset and Start Over
        </button>
      )}
    </div>
  );
};

export default VPNEffectivenessPage; 