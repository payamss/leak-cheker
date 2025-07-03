'use client';

import { useState, useEffect } from 'react';
import { PrivacyTestService, DetailedPrivacyTestResult, TechnicalReport, UserFriendlyReport } from '../../utils/privacy-tests';

export default function CookieTrackerTestPage() {
  const [detailedResult, setDetailedResult] = useState<DetailedPrivacyTestResult | null>(null);
  const [technicalReport, setTechnicalReport] = useState<TechnicalReport | null>(null);
  const [userFriendlyReport, setUserFriendlyReport] = useState<UserFriendlyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'recommendations'>('overview');
  const [showRawData, setShowRawData] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [jsonCopySuccess, setJsonCopySuccess] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const privacyTestService = PrivacyTestService.getInstance();
      
      // Run detailed test
      const result = await privacyTestService.runDetailedTest();
      setDetailedResult(result);
      
      // Generate both report formats
      const techReport = await privacyTestService.generateReport('technical') as TechnicalReport;
      const friendlyReport = await privacyTestService.generateReport('user-friendly') as UserFriendlyReport;
      
      setTechnicalReport(techReport);
      setUserFriendlyReport(friendlyReport);
    } catch (err) {
      setError('Failed to run privacy test. Please try again.');
      console.error('Privacy test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (format: 'json' | 'markdown' | 'html' | 'csv') => {
    if (!detailedResult) return;
    
    try {
      const privacyTestService = PrivacyTestService.getInstance();
      const exportData = await privacyTestService.exportReport(format);
      
      const blob = new Blob([exportData], { 
        type: format === 'json' ? 'application/json' : 
              format === 'html' ? 'text/html' : 
              format === 'csv' ? 'text/csv' : 'text/markdown'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `privacy-report-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleCopyJson = async () => {
    if (!detailedResult) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(detailedResult, null, 2));
      setJsonCopySuccess(true);
      setTimeout(() => setJsonCopySuccess(false), 1500);
    } catch {
      setJsonCopySuccess(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getRiskBadgeColor = (status: 'good' | 'warning' | 'risk') => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'risk': return 'bg-red-100 text-red-800';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🔒 Advanced Privacy & Cookie Test
            </h1>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">
                Comprehensive Privacy Analysis Suite
              </h2>
              <p className="text-blue-800 mb-4">
                Our advanced privacy testing suite performs deep analysis of your browser&apos;s privacy protection capabilities, 
                including cookie policies, fingerprinting resistance, hardware exposure, WebRTC IP leaks, and real-time tracking detection.
              </p>
              
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">🍪 Cookie Analysis</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Third-party cookies</li>
                    <li>• SameSite policies</li>
                    <li>• Storage capabilities</li>
                    <li>• Cross-site indicators</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">🎭 Fingerprinting</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Canvas fingerprinting</li>
                    <li>• WebGL analysis</li>
                    <li>• Font enumeration</li>
                    <li>• Plugin detection</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">🖥️ Hardware Exposure</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• CPU cores detection</li>
                    <li>• Memory analysis</li>
                    <li>• Screen properties</li>
                    <li>• Spoofing detection</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">📊 Professional Reports</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Executive summaries</li>
                    <li>• Technical details</li>
                    <li>• Export formats</li>
                    <li>• Implementation guides</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Score Dashboard */}
          {detailedResult && (
            <div className="mb-8">
              <div className={`rounded-lg border-2 p-6 ${getScoreBgColor(detailedResult.userFriendly.privacyScore)}`}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy Protection Score</h2>
                    <div className={`text-5xl font-bold ${getScoreColor(detailedResult.userFriendly.privacyScore)} mb-2`}>
                      {detailedResult.userFriendly.privacyScore}%
                    </div>
                    <p className="text-gray-700">{technicalReport?.summary.riskLevel.toUpperCase()} Risk Level</p>
                  </div>
                  <div className="text-right">
                    <div className="mb-4">
                      <span className="text-sm text-gray-600">Tests Passed: </span>
                      <span className="font-semibold text-green-600">{technicalReport?.summary.testsPassed}</span>
                      <span className="text-gray-600"> / </span>
                      <span className="font-semibold">{technicalReport?.summary.totalTests}</span>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={runTest}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
                      >
                        {isLoading ? 'Testing...' : '🔄 Run Test Again'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Risk Badges */}
                {userFriendlyReport && (
                  <div className="flex flex-wrap gap-3">
                    {userFriendlyReport.visualElements.riskBadges.map((badge, index) => (
                      <div
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBadgeColor(badge.status)}`}
                      >
                        {badge.icon} {badge.test}: {badge.status === 'good' ? 'Protected' : badge.status === 'warning' ? 'Partial' : 'At Risk'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Running comprehensive privacy analysis...</p>
              <p className="text-sm text-gray-500 mt-2">Testing cookies, fingerprinting, hardware exposure, and more...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <span className="text-red-500 text-xl mr-2">⚠️</span>
                <h3 className="font-semibold text-red-800">Test Failed</h3>
              </div>
              <p className="text-red-700 mb-3">{error}</p>
              <button
                onClick={runTest}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium"
              >
                🔄 Retry Test
              </button>
            </div>
          )}

          {/* Test Results Tabs */}
          {detailedResult && (
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'overview', label: '📊 Overview', count: null },
                    { id: 'technical', label: '🔬 Technical Details', count: null },
                    { id: 'recommendations', label: '🛡️ Recommendations', count: detailedResult.detailed.technicalRecommendations.length }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'overview' | 'technical' | 'recommendations')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                      {tab.count && (
                        <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Export Options */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">📥 Export Report</h3>
                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    onClick={() => setShowRawJson(!showRawJson)}
                    className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded text-sm font-medium"
                  >
                    {showRawJson ? 'Hide JSON' : 'Copy JSON'}
                  </button>
                  {showRawJson && (
                    <>
                      <button
                        onClick={handleCopyJson}
                        className="bg-blue-100 border border-blue-300 hover:bg-blue-200 px-3 py-1 rounded text-sm font-medium ml-2"
                      >
                        {jsonCopySuccess ? 'Copied!' : 'Copy to Clipboard'}
                      </button>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto mt-2 max-h-96">
                        {JSON.stringify(detailedResult, null, 2)}
                      </pre>
                    </>
                  )}
                  <button
                    onClick={() => exportReport('json')}
                    className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded text-sm font-medium"
                  >
                    Export JSON
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Executive Summary */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Executive Summary</h3>
                    <div className="prose text-gray-700">
                      {technicalReport?.summary.majorIssues.length === 0 ? (
                        <p className="text-green-700">
                          🎉 Excellent! Your browser configuration provides strong privacy protection with no major issues detected.
                        </p>
                      ) : (
                        <div>
                          <p className="mb-3">
                            Your privacy analysis revealed {technicalReport?.summary.majorIssues.length} area(s) for improvement:
                          </p>
                          <ul className="list-disc list-inside space-y-1">
                            {technicalReport?.summary.majorIssues.map((issue, index) => (
                              <li key={index} className="text-red-700">{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Privacy Test Results Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Third-Party Cookies */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">🍪 Third-Party Cookies</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          detailedResult.userFriendly.cookies.thirdPartyCookiesBlocked 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {detailedResult.userFriendly.cookies.thirdPartyCookiesBlocked ? '✅ BLOCKED' : '❌ ENABLED'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">
                        {detailedResult.userFriendly.cookies.thirdPartyCookiesBlocked 
                          ? 'Your browser effectively blocks third-party cookies, preventing cross-site tracking.' 
                          : 'Third-party cookies are enabled, allowing websites to track you across the internet.'}
                      </p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>SameSite=None: {detailedResult.userFriendly.cookies.sameSiteNoneBlocked ? 'Blocked ✅' : 'Allowed ❌'}</p>
                        <p>SameSite=Lax: {detailedResult.userFriendly.cookies.sameSiteLaxBlocked ? 'Blocked ✅' : 'Allowed ⚠️'}</p>
                        <p>SameSite=Strict: {detailedResult.userFriendly.cookies.sameSiteStrictBlocked ? 'Blocked ⚠️' : 'Allowed ✅'}</p>
                      </div>
                    </div>

                    {/* Canvas Fingerprinting */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">🎭 Canvas Fingerprinting</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          detailedResult.userFriendly.fingerprinting.canvasBlocked 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {detailedResult.userFriendly.fingerprinting.canvasBlocked ? '🛡️ BLOCKED' : '🎯 POSSIBLE'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">
                        {detailedResult.userFriendly.fingerprinting.canvasBlocked 
                          ? 'Canvas fingerprinting is blocked or randomized, protecting your identity.' 
                          : 'Canvas fingerprinting is possible, potentially creating a unique identifier.'}
                      </p>
                      <div className="text-sm text-gray-600">
                        <p>Blocking Method: {detailedResult.detailed.fingerprinting.testDetails.canvas.blockingMethod || 'None detected'}</p>
                        <p>Randomization: {detailedResult.detailed.fingerprinting.testDetails.canvas.randomizationDetected ? 'Active ✅' : 'None ❌'}</p>
                      </div>
                    </div>

                    {/* WebGL Fingerprinting */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">🔮 WebGL Fingerprinting</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          detailedResult.userFriendly.fingerprinting.webglBlocked 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {detailedResult.userFriendly.fingerprinting.webglBlocked ? '🔒 BLOCKED' : '🔓 POSSIBLE'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">
                        {detailedResult.userFriendly.fingerprinting.webglBlocked 
                          ? 'WebGL is disabled or blocked, preventing graphics card fingerprinting.' 
                          : 'WebGL is accessible, exposing detailed graphics hardware information.'}
                      </p>
                      <div className="text-sm text-gray-600">
                        <p>Context Available: {detailedResult.detailed.fingerprinting.testDetails.webgl.contextAvailable ? 'Yes ❌' : 'No ✅'}</p>
                        <p>Renderer: {detailedResult.detailed.fingerprinting.testDetails.webgl.renderer || 'Hidden ✅'}</p>
                        <p>Vendor: {detailedResult.detailed.fingerprinting.testDetails.webgl.vendor || 'Hidden ✅'}</p>
                      </div>
                    </div>

                    {/* Hardware Fingerprinting */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">🖥️ Hardware Exposure</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          detailedResult.detailed.hardware.fingerprintingRisk === 'low' 
                            ? 'bg-green-100 text-green-800' 
                            : detailedResult.detailed.hardware.fingerprintingRisk === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {detailedResult.detailed.hardware.fingerprintingRisk.toUpperCase()} RISK
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>CPU Cores:</span>
                          <span className={detailedResult.detailed.hardware.spoofingDetected.cpuCores ? 'text-green-600' : 'text-red-600'}>
                            {detailedResult.userFriendly.hardware.cpuCores} {detailedResult.detailed.hardware.spoofingDetected.cpuCores ? '(Spoofed ✅)' : '(Exposed ❌)'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Device Memory:</span>
                          <span className={detailedResult.detailed.hardware.spoofingDetected.deviceMemory ? 'text-green-600' : 'text-red-600'}>
                            {detailedResult.userFriendly.hardware.deviceMemory}GB {detailedResult.detailed.hardware.spoofingDetected.deviceMemory ? '(Spoofed ✅)' : '(Exposed ❌)'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Screen Resolution:</span>
                          <span className={detailedResult.detailed.hardware.spoofingDetected.screenResolution ? 'text-green-600' : 'text-red-600'}>
                            {detailedResult.userFriendly.hardware.screen.width}×{detailedResult.userFriendly.hardware.screen.height} {detailedResult.detailed.hardware.spoofingDetected.screenResolution ? '(Spoofed ✅)' : '(Exposed ❌)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* WebRTC Leak Detection */}
                    {detailedResult.userFriendly.webrtc && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">🌐 WebRTC IP Leaks</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            detailedResult.userFriendly.webrtc.webrtcBlocked 
                              ? 'bg-green-100 text-green-800' 
                              : detailedResult.userFriendly.webrtc.hasIPLeak
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {detailedResult.userFriendly.webrtc.webrtcBlocked ? '🔒 BLOCKED' : 
                             detailedResult.userFriendly.webrtc.hasIPLeak ? '🚨 LEAKING' : '⚠️ ENABLED'}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">
                          {detailedResult.userFriendly.webrtc.webrtcBlocked 
                            ? 'WebRTC is disabled, preventing IP address leaks.' 
                            : detailedResult.userFriendly.webrtc.hasIPLeak
                            ? `WebRTC is leaking ${detailedResult.userFriendly.webrtc.localIPs.length + detailedResult.userFriendly.webrtc.publicIPs.length} IP address(es).`
                            : 'WebRTC is enabled but no IP leaks detected.'}
                        </p>
                        {detailedResult.userFriendly.webrtc.hasIPLeak && (
                          <div className="text-sm text-gray-600 space-y-1">
                            {detailedResult.userFriendly.webrtc.localIPs.length > 0 && (
                              <p>Local IPs: {detailedResult.userFriendly.webrtc.localIPs.join(', ')}</p>
                            )}
                            {detailedResult.userFriendly.webrtc.publicIPs.length > 0 && (
                              <p className="text-red-600">Public IPs: {detailedResult.userFriendly.webrtc.publicIPs.join(', ')}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Real-time Tracking Detection */}
                    {detailedResult.userFriendly.tracking && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">🕵️ Active Tracking</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            detailedResult.userFriendly.tracking.trackingLevel === 'minimal' 
                              ? 'bg-green-100 text-green-800' 
                              : detailedResult.userFriendly.tracking.trackingLevel === 'moderate'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {detailedResult.userFriendly.tracking.trackingLevel.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">
                          {detailedResult.userFriendly.tracking.totalTrackers === 0 
                            ? 'No active trackers detected on this page.' 
                            : `${detailedResult.userFriendly.tracking.totalTrackers} active tracker(s) detected on this page.`}
                        </p>
                        {detailedResult.userFriendly.tracking.totalTrackers > 0 && (
                          <div className="text-sm text-gray-600 space-y-1">
                            {detailedResult.userFriendly.tracking.thirdPartyScripts.length > 0 && (
                              <p>Third-party Scripts: {detailedResult.userFriendly.tracking.thirdPartyScripts.length}</p>
                            )}
                            {detailedResult.userFriendly.tracking.socialWidgets.length > 0 && (
                              <p>Social Widgets: {detailedResult.userFriendly.tracking.socialWidgets.length}</p>
                            )}
                            {detailedResult.userFriendly.tracking.trackingPixels.length > 0 && (
                              <p>Tracking Pixels: {detailedResult.userFriendly.tracking.trackingPixels.length}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Browser Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🌐 Browser Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-gray-600">Browser:</span> {detailedResult.detailed.browser.name} {detailedResult.detailed.browser.version}</p>
                          <p><span className="text-gray-600">Engine:</span> {detailedResult.detailed.browser.browserEngine}</p>
                          <p><span className="text-gray-600">Platform:</span> {detailedResult.detailed.browser.platform}</p>
                          <p><span className="text-gray-600">Language:</span> {detailedResult.detailed.browser.language}</p>
                          <p><span className="text-gray-600">Do Not Track:</span> 
                            <span className={detailedResult.userFriendly.browser.doNotTrack ? 'text-green-600' : 'text-red-600'}>
                              {detailedResult.userFriendly.browser.doNotTrack ? ' Enabled ✅' : ' Disabled ❌'}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Font & Plugin Detection</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-gray-600">Fonts Detected:</span> {detailedResult.userFriendly.fingerprinting.fontsDetected.length}</p>
                          <p><span className="text-gray-600">Plugins Detected:</span> {detailedResult.userFriendly.fingerprinting.pluginsDetected.length}</p>
                          <p><span className="text-gray-600">Font Spoofing:</span> 
                            <span className={detailedResult.detailed.fingerprinting.testDetails.fonts.spoofingDetected ? 'text-green-600' : 'text-red-600'}>
                              {detailedResult.detailed.fingerprinting.testDetails.fonts.spoofingDetected ? ' Detected ✅' : ' None ❌'}
                            </span>
                          </p>
                          <p><span className="text-gray-600">Uniqueness Score:</span> {detailedResult.userFriendly.fingerprinting.uniquenessScore}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'technical' && detailedResult && (
                <div className="space-y-6">
                  {/* Score Breakdown */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">🎯 Privacy Score Breakdown</h3>
                    
                    {/* Component Cards Grid */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      {/* Browser Score */}
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">🌐</span>
                            <div>
                              <h4 className="font-semibold text-gray-900">Browser</h4>
                              <p className="text-sm text-gray-600">{detailedResult.detailed.scoreBreakdown.components.browser.score}/{detailedResult.detailed.scoreBreakdown.components.browser.max} points</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-blue-600">
                              {Math.round((detailedResult.detailed.scoreBreakdown.components.browser.score / detailedResult.detailed.scoreBreakdown.components.browser.max) * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(detailedResult.detailed.scoreBreakdown.components.browser.score / detailedResult.detailed.scoreBreakdown.components.browser.max) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-700">{detailedResult.detailed.scoreBreakdown.components.browser.reason}</p>
                      </div>

                      {/* Cookies Score */}
                      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">🍪</span>
                            <div>
                              <h4 className="font-semibold text-gray-900">Cookies</h4>
                              <p className="text-sm text-gray-600">{detailedResult.detailed.scoreBreakdown.components.cookies.score}/{detailedResult.detailed.scoreBreakdown.components.cookies.max} points</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-green-600">
                              {Math.round((detailedResult.detailed.scoreBreakdown.components.cookies.score / detailedResult.detailed.scoreBreakdown.components.cookies.max) * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(detailedResult.detailed.scoreBreakdown.components.cookies.score / detailedResult.detailed.scoreBreakdown.components.cookies.max) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-700">{detailedResult.detailed.scoreBreakdown.components.cookies.reason}</p>
                      </div>

                      {/* Fingerprinting Score */}
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">🎭</span>
                            <div>
                              <h4 className="font-semibold text-gray-900">Fingerprinting</h4>
                              <p className="text-sm text-gray-600">{detailedResult.detailed.scoreBreakdown.components.fingerprinting.score}/{detailedResult.detailed.scoreBreakdown.components.fingerprinting.max} points</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-purple-600">
                              {Math.round((detailedResult.detailed.scoreBreakdown.components.fingerprinting.score / detailedResult.detailed.scoreBreakdown.components.fingerprinting.max) * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(detailedResult.detailed.scoreBreakdown.components.fingerprinting.score / detailedResult.detailed.scoreBreakdown.components.fingerprinting.max) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-700">{detailedResult.detailed.scoreBreakdown.components.fingerprinting.reason}</p>
                      </div>

                      {/* Hardware Score */}
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">🖥️</span>
                            <div>
                              <h4 className="font-semibold text-gray-900">Hardware</h4>
                              <p className="text-sm text-gray-600">{detailedResult.detailed.scoreBreakdown.components.hardware.score}/{detailedResult.detailed.scoreBreakdown.components.hardware.max} points</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-orange-600">
                              {Math.round((detailedResult.detailed.scoreBreakdown.components.hardware.score / detailedResult.detailed.scoreBreakdown.components.hardware.max) * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-orange-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(detailedResult.detailed.scoreBreakdown.components.hardware.score / detailedResult.detailed.scoreBreakdown.components.hardware.max) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-700">{detailedResult.detailed.scoreBreakdown.components.hardware.reason}</p>
                      </div>
                    </div>

                    {/* Do Not Track Bonus */}
                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">🚫</span>
                          <div>
                            <h4 className="font-semibold text-gray-900">Do Not Track</h4>
                            <p className="text-sm text-gray-600">{detailedResult.detailed.scoreBreakdown.components.doNotTrack.score}/{detailedResult.detailed.scoreBreakdown.components.doNotTrack.max} points</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-indigo-600">
                            {Math.round((detailedResult.detailed.scoreBreakdown.components.doNotTrack.score / detailedResult.detailed.scoreBreakdown.components.doNotTrack.max) * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-indigo-200 rounded-full h-2 mt-3 mb-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(detailedResult.detailed.scoreBreakdown.components.doNotTrack.score / detailedResult.detailed.scoreBreakdown.components.doNotTrack.max) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-700">{detailedResult.detailed.scoreBreakdown.components.doNotTrack.reason}</p>
                    </div>

                    {/* Total Score Summary */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <span className="text-3xl mr-4">🎯</span>
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">Total Privacy Score</h4>
                            <p className="text-sm text-gray-600">{detailedResult.detailed.scoreBreakdown.total}/{detailedResult.detailed.scoreBreakdown.maxPossible} points</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-4xl font-bold ${getScoreColor(detailedResult.detailed.scoreBreakdown.percentage)}`}>
                            {detailedResult.detailed.scoreBreakdown.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full transition-all duration-500 ${
                            detailedResult.detailed.scoreBreakdown.percentage >= 80 ? 'bg-green-500' :
                            detailedResult.detailed.scoreBreakdown.percentage >= 60 ? 'bg-yellow-500' :
                            detailedResult.detailed.scoreBreakdown.percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${detailedResult.detailed.scoreBreakdown.percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Penalties and Bonuses */}
                    {(detailedResult.detailed.scoreBreakdown.penalties.length > 0 || detailedResult.detailed.scoreBreakdown.bonuses.length > 0) && (
                      <div className="grid md:grid-cols-2 gap-4 mt-6">
                        {/* Penalties */}
                        {detailedResult.detailed.scoreBreakdown.penalties.length > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h5 className="font-semibold text-red-800 mb-3 flex items-center">
                              <span className="mr-2">⚠️</span>
                              Privacy Penalties
                            </h5>
                            <ul className="space-y-2">
                              {detailedResult.detailed.scoreBreakdown.penalties.map((penalty, index) => (
                                <li key={index} className="flex justify-between text-sm">
                                  <span className="text-red-700">{penalty.reason}</span>
                                  <span className="font-medium text-red-800">{penalty.points}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Bonuses */}
                        {detailedResult.detailed.scoreBreakdown.bonuses.length > 0 && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h5 className="font-semibold text-green-800 mb-3 flex items-center">
                              <span className="mr-2">✅</span>
                              Privacy Bonuses
                            </h5>
                            <ul className="space-y-2">
                              {detailedResult.detailed.scoreBreakdown.bonuses.map((bonus, index) => (
                                <li key={index} className="flex justify-between text-sm">
                                  <span className="text-green-700">{bonus.reason}</span>
                                  <span className="font-medium text-green-800">+{bonus.points}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Advanced Fingerprinting Data */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🔬 Advanced Fingerprinting Analysis</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Browser Capabilities</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-gray-600">WebGL:</span> {detailedResult.metadata.browserCapabilities.webgl ? 'Supported' : 'Disabled'}</p>
                          <p><span className="text-gray-600">WebGL2:</span> {detailedResult.metadata.browserCapabilities.webgl2 ? 'Supported' : 'Not Available'}</p>
                          <p><span className="text-gray-600">Service Workers:</span> {detailedResult.metadata.browserCapabilities.serviceWorkers ? 'Supported' : 'Not Available'}</p>
                          <p><span className="text-gray-600">WebAssembly:</span> {detailedResult.metadata.browserCapabilities.webAssembly ? 'Supported' : 'Not Available'}</p>
                          <p><span className="text-gray-600">WebRTC:</span> {detailedResult.metadata.browserCapabilities.webRTC ? 'Supported' : 'Not Available'}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">System Information</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-gray-600">Timezone:</span> {detailedResult.detailed.fingerprinting.advancedFingerprinting.timezone}</p>
                          <p><span className="text-gray-600">Languages:</span> {detailedResult.detailed.fingerprinting.advancedFingerprinting.language.join(', ')}</p>
                          <p><span className="text-gray-600">Touch Support:</span> {detailedResult.detailed.fingerprinting.advancedFingerprinting.touchSupport ? 'Yes' : 'No'}</p>
                          <p><span className="text-gray-600">Color Gamut:</span> {detailedResult.detailed.fingerprinting.advancedFingerprinting.colorGamut || 'Unknown'}</p>
                          <p><span className="text-gray-600">HDR Support:</span> {detailedResult.detailed.fingerprinting.advancedFingerprinting.hdr ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Tool Signatures */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🛡️ Privacy Tool Signatures</h3>
                    {detailedResult.detailed.fingerprinting.privacyToolSignatures.length > 0 ? (
                      <ul className="space-y-2">
                        {detailedResult.detailed.fingerprinting.privacyToolSignatures.map((signature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <span className="text-green-500 mr-2">✓</span>
                            <span className="text-gray-700">{signature}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No privacy tool signatures detected</p>
                    )}
                  </div>

                  {/* Raw Data */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">🔬 Raw Technical Data</h3>
                      <button
                        onClick={() => setShowRawData(!showRawData)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {showRawData ? 'Hide' : 'Show'} Raw Data
                      </button>
                    </div>
                    
                    {showRawData && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Canvas Fingerprint</h4>
                          <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                            {detailedResult.rawData.canvasFingerprint || 'Not available'}
                          </pre>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">WebGL Fingerprint</h4>
                          <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                            {detailedResult.rawData.webglFingerprint || 'Not available'}
                          </pre>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Navigator Object</h4>
                          <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                            {JSON.stringify(detailedResult.rawData.navigatorObject, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'recommendations' && detailedResult && (
                <div className="space-y-6">
                  {/* Recommendations by Priority */}
                  {(() => {
                    const recs = detailedResult.detailed.technicalRecommendations;
                    if (!recs || recs.length === 0) {
                      return <div className="text-gray-600">No recommendations available. Your privacy settings are strong!</div>;
                    }
                    const priorities = [
                      { label: 'High Priority', key: 'critical', color: 'high' },
                      { label: 'Medium Priority', key: 'important', color: 'medium' },
                      { label: 'Low Priority', key: 'suggested', color: 'low' },
                      { label: 'Informational', key: 'informational', color: 'low' }
                    ] as const;
                    return priorities.map(priority => {
                      const group = recs.filter(r => r.category === priority.key);
                      if (group.length === 0) return null;
                      return (
                        <div key={priority.key} className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{priority.label}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(priority.color)}`}>
                              {priority.label.toUpperCase()}
                            </span>
                          </div>
                          <div className="space-y-4">
                            {group.map((rec, recIndex) => (
                              <div key={recIndex} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                                  <span className="text-sm text-green-600 font-medium">+{rec.impact.privacyGain}% privacy</span>
                                </div>
                                <p className="text-gray-700 mb-3">{rec.description}</p>
                                <div className="text-sm text-gray-600 mb-3">
                                  <strong>Technical Details:</strong> {rec.technicalDetails}
                                </div>
                                {/* Implementation Steps */}
                                {rec.implementation.browserSettings && (
                                  <div className="mb-3">
                                    <strong className="text-sm text-gray-900">Browser Settings:</strong>
                                    <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-gray-700">
                                      {rec.implementation.browserSettings.map((setting, settingIndex) => (
                                        <li key={settingIndex}>{setting}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {rec.implementation.extensions && (
                                  <div className="mb-3">
                                    <strong className="text-sm text-gray-900">Recommended Extensions:</strong>
                                    <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-gray-700">
                                      {rec.implementation.extensions.map((ext, extIndex) => (
                                        <li key={extIndex}>{ext}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {rec.implementation.advanced && (
                                  <div className="mb-3">
                                    <strong className="text-sm text-gray-900">Advanced Configuration:</strong>
                                    <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-gray-700">
                                      {rec.implementation.advanced.map((adv, advIndex) => (
                                        <li key={advIndex}>{adv}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {/* Impact Analysis */}
                                <div className="flex space-x-4 text-xs">
                                  <span className="bg-gray-100 px-2 py-1 rounded">
                                    Usability Impact: {rec.impact.usabilityImpact}
                                  </span>
                                  <span className="bg-gray-100 px-2 py-1 rounded">
                                    Breakage Risk: {rec.impact.breakageRisk}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 