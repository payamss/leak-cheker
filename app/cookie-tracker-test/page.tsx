'use client';

import { useState, useEffect } from 'react';
import { PrivacyTestService, PrivacyTestResult } from '../../utils/privacy-tests';

export default function CookieTrackerTestPage() {
  const [testResult, setTestResult] = useState<PrivacyTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const privacyTestService = PrivacyTestService.getInstance();
      const result = await privacyTestService.runCompleteTest();
      setTestResult(result);
    } catch (err) {
      setError('Failed to run privacy test. Please try again.');
      console.error('Privacy test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Excellent privacy protection';
    if (score >= 60) return 'Good privacy protection';
    if (score >= 40) return 'Moderate privacy protection';
    if (score >= 20) return 'Poor privacy protection';
    return 'Your privacy is at serious risk';
  };

  const getRiskLevel = (isBlocked: boolean, invertLogic = false) => {
    const blocked = invertLogic ? !isBlocked : isBlocked;
    return blocked ? 'Good' : 'Privacy Risk';
  };

  const getRiskColor = (isBlocked: boolean, invertLogic = false) => {
    const blocked = invertLogic ? !isBlocked : isBlocked;
    return blocked ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Cookie & Tracker Test
            </h1>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">
                About Cookie & Tracker Testing
              </h2>
              <p className="text-blue-800 mb-4">
                This comprehensive privacy test analyzes how your browser handles cookies, tracking, and fingerprinting. 
                It helps you understand your digital privacy exposure and provides actionable recommendations.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Cookie Analysis</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Third-party cookie detection</li>
                    <li>• Local storage capabilities</li>
                    <li>• Session storage testing</li>
                    <li>• Cookie policy compliance</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Fingerprinting Tests</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Browser fingerprint uniqueness</li>
                    <li>• Canvas fingerprinting detection</li>
                    <li>• WebGL fingerprinting analysis</li>
                    <li>• Font and plugin enumeration</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Privacy Protection Guidance</h3>
                  <p className="text-blue-700">
                    Based on your test results, you'll receive personalized recommendations for browser settings, 
                    privacy extensions, and alternative browsers to enhance your digital privacy and reduce tracking.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This tool performs client-side tests only and does not collect or store any personal data. 
                  All analysis is done locally in your browser for maximum privacy.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Score */}
          {testResult && (
            <div className="text-center mb-8">
              <div className="inline-block bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Privacy Protection Score:</h2>
                <div className={`text-6xl font-bold ${getScoreColor(testResult.privacyScore)} mb-2`}>
                  {testResult.privacyScore}%
                </div>
                <p className="text-gray-600 mb-4">{getScoreDescription(testResult.privacyScore)}</p>
                <button
                  onClick={runTest}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Running Test...' : 'Run Test Again'}
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Running comprehensive privacy test...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
              <button
                onClick={runTest}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Test Results */}
          {testResult && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Test Results</h2>
              
              {/* Third-Party Cookies */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Third-Party Cookies</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    testResult.cookies.thirdPartyCookiesBlocked 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {getRiskLevel(testResult.cookies.thirdPartyCookiesBlocked)}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">
                  {testResult.cookies.thirdPartyCookiesBlocked 
                    ? 'Third-party cookies are blocked' 
                    : 'Third-party cookies are enabled'}
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  Your browser {testResult.cookies.sameSiteNoneBlocked ? 'blocks' : 'accepts'} SameSite=None cookies, 
                  which {testResult.cookies.sameSiteNoneBlocked ? 'prevents' : 'can be used for'} cross-site tracking. 
                  Regular: {!testResult.cookies.sameSiteNoneBlocked ? 'true' : 'false'}, 
                  Lax: {!testResult.cookies.sameSiteLaxBlocked ? 'true' : 'false'}, 
                  Strict: {!testResult.cookies.sameSiteStrictBlocked ? 'true' : 'false'}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Recommendation:</strong> {testResult.cookies.thirdPartyCookiesBlocked 
                    ? 'Great! Keep third-party cookies disabled for maximum privacy.' 
                    : 'Disable third-party cookies in your browser settings for better privacy.'}
                </p>
              </div>

              {/* Do Not Track Header */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Do Not Track Header</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    testResult.browser.doNotTrack 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {getRiskLevel(testResult.browser.doNotTrack)}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">
                  {testResult.browser.doNotTrack 
                    ? 'Do Not Track is enabled' 
                    : 'Do Not Track is disabled'}
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  {testResult.browser.doNotTrack 
                    ? 'Your browser sends the Do Not Track header, requesting not to be tracked.' 
                    : 'Your browser does not send the Do Not Track header.'}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Recommendation:</strong> {testResult.browser.doNotTrack 
                    ? 'Excellent! Keep Do Not Track enabled.' 
                    : 'Enable Do Not Track in your browser privacy settings.'}
                </p>
              </div>

              {/* Browser Fingerprinting */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Browser Fingerprinting</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    testResult.fingerprinting.uniquenessScore < 50 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {testResult.fingerprinting.uniquenessScore < 50 ? 'Good' : 'Privacy Risk'}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">
                  Browser uniqueness score: {testResult.fingerprinting.uniquenessScore}%
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  Detected browser: {testResult.browser.name}. Your browser has a {
                    testResult.fingerprinting.uniquenessScore > 80 ? 'highly unique' : 
                    testResult.fingerprinting.uniquenessScore > 50 ? 'somewhat unique' : 'relatively common'
                  } fingerprint, making you {
                    testResult.fingerprinting.uniquenessScore > 80 ? 'easily trackable' : 
                    testResult.fingerprinting.uniquenessScore > 50 ? 'moderately trackable' : 'harder to track'
                  }. Screen: {testResult.hardware.screen.width}x{testResult.hardware.screen.height}, 
                  Cores: {testResult.hardware.cpuCores}, Memory: {testResult.hardware.deviceMemory}GB
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Recommendation:</strong> {testResult.fingerprinting.uniquenessScore > 70 
                    ? 'Consider using privacy-focused browser settings or extensions.' 
                    : 'Good! Your fingerprint is relatively common.'}
                </p>
              </div>

              {/* Local Storage */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Local Storage</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    testResult.cookies.localStorageBlocked 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {testResult.cookies.localStorageBlocked ? 'Good' : 'Warning'}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">
                  {testResult.cookies.localStorageBlocked 
                    ? 'Local storage is blocked' 
                    : 'Local storage is available'}
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  {testResult.cookies.localStorageBlocked 
                    ? 'Local storage is properly blocked, preventing persistent tracking.' 
                    : 'Local storage can be used to track you across browser sessions.'}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Recommendation:</strong> {testResult.cookies.localStorageBlocked 
                    ? 'Perfect! Local storage blocking is active.' 
                    : 'Consider disabling local storage or using private browsing mode.'}
                </p>
              </div>

              {/* Canvas Fingerprinting */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Canvas Fingerprinting</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    testResult.fingerprinting.canvasBlocked 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {getRiskLevel(testResult.fingerprinting.canvasBlocked)}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">
                  {testResult.fingerprinting.canvasBlocked 
                    ? 'Canvas fingerprinting is blocked' 
                    : 'Canvas fingerprinting possible'}
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  {testResult.fingerprinting.canvasBlocked 
                    ? 'Canvas fingerprinting is properly blocked or randomized.' 
                    : 'Your browser allows canvas fingerprinting, which creates a unique identifier.'}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Recommendation:</strong> {testResult.fingerprinting.canvasBlocked 
                    ? 'Excellent! Canvas protection is working.' 
                    : 'Use a browser extension to block canvas fingerprinting.'}
                </p>
              </div>

              {/* WebGL Fingerprinting */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">WebGL Fingerprinting</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    testResult.fingerprinting.webglBlocked 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {getRiskLevel(testResult.fingerprinting.webglBlocked)}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">
                  {testResult.fingerprinting.webglBlocked 
                    ? 'WebGL fingerprinting is blocked' 
                    : 'WebGL fingerprinting possible'}
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  WebGL fingerprinting is {testResult.fingerprinting.webglBlocked ? 'blocked or restricted' : 'available for tracking'}.
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Recommendation:</strong> {testResult.fingerprinting.webglBlocked 
                    ? 'Great! WebGL fingerprinting protection is active.' 
                    : 'Consider disabling WebGL in your browser settings.'}
                </p>
              </div>

              {/* Font Detection */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Font Detection</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    testResult.fingerprinting.fontsDetected.length < 10 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {testResult.fingerprinting.fontsDetected.length < 10 ? 'Good' : 'Privacy Risk'}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">
                  {testResult.fingerprinting.fontsDetected.length} fonts detected
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  {testResult.fingerprinting.fontsDetected.length < 10 
                    ? 'Font enumeration is limited, providing better privacy.' 
                    : 'Many fonts are available for fingerprinting, making you more unique.'}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Recommendation:</strong> {testResult.fingerprinting.fontsDetected.length < 10 
                    ? 'Excellent! Font enumeration is properly limited.' 
                    : 'Consider using a browser that limits font enumeration.'}
                </p>
              </div>

              {/* Plugin Detection */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Plugin Detection</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    testResult.fingerprinting.pluginsDetected.length < 3 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {testResult.fingerprinting.pluginsDetected.length < 3 ? 'Good' : 'Privacy Risk'}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">
                  {testResult.fingerprinting.pluginsDetected.length} plugins detected
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  {testResult.fingerprinting.pluginsDetected.length > 0 && (
                    <>Detected plugins: {testResult.fingerprinting.pluginsDetected.slice(0, 3).join(', ')}
                    {testResult.fingerprinting.pluginsDetected.length > 3 && '...'}</>
                  )}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Recommendation:</strong> {testResult.fingerprinting.pluginsDetected.length < 3 
                    ? 'Good! Plugin enumeration is limited.' 
                    : 'Consider disabling unnecessary browser plugins.'}
                </p>
              </div>

              {/* Browser Fingerprint Analysis */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Browser Fingerprint Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>User Agent:</strong> {testResult.browser.userAgent.substring(0, 50)}...</p>
                    <p><strong>Language:</strong> {testResult.browser.language}</p>
                    <p><strong>Platform:</strong> {testResult.browser.platform}</p>
                    <p><strong>Screen:</strong> {testResult.hardware.screen.width}x{testResult.hardware.screen.height} ({testResult.hardware.screen.colorDepth}-bit)</p>
                  </div>
                  <div>
                    <p><strong>Timezone:</strong> {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
                    <p><strong>CPU Cores:</strong> {testResult.hardware.cpuCores}</p>
                    <p><strong>Device Memory:</strong> {testResult.hardware.deviceMemory} GB</p>
                    <p><strong>Do Not Track:</strong> {testResult.browser.doNotTrack ? '1' : 'Not set'}</p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Privacy Enhancement Recommendations</h3>
                
                {testResult.recommendations.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-blue-800 mb-2">Personalized Recommendations:</h4>
                    <ul className="space-y-2">
                      {testResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span className="text-blue-800">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-3">Browser Settings:</h4>
                    <ul className="space-y-2 text-blue-700">
                      <li>Enable "Do Not Track" in privacy settings</li>
                      <li>Block third-party cookies</li>
                      <li>Disable location services</li>
                      <li>Clear cookies and site data regularly</li>
                      <li>Use private/incognito browsing mode</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-3">Recommended Browser Extensions:</h4>
                    <ul className="space-y-2 text-blue-700">
                      <li>uBlock Origin - Blocks ads and trackers</li>
                      <li>Privacy Badger - Prevents tracking</li>
                      <li>ClearURLs - Removes tracking parameters</li>
                      <li>Decentraleyes - Protects against tracking</li>
                      <li>CanvasBlocker - Prevents canvas fingerprinting</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-3">Privacy-Focused Browsers:</h4>
                    <ul className="space-y-2 text-blue-700">
                      <li>Firefox</li>
                      <li>Brave Browser</li>
                      <li>Tor Browser</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 