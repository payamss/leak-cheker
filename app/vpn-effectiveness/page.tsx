'use client';

import { useState, useEffect } from 'react';
import { VPNEffectivenessService, type VPNEffectivenessResult } from '../../utils/vpn-effectiveness';

export default function VPNEffectivenessDashboard() {
  const [result, setResult] = useState<VPNEffectivenessResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'recommendations'>('overview');

  const runVPNTest = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const vpnService = VPNEffectivenessService.getInstance();
      const testResult = await vpnService.runComprehensiveVPNTest();
      setResult(testResult);
    } catch (err) {
      setError('Failed to run VPN effectiveness test. Please try again.');
      console.error('VPN test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runVPNTest();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🛡️ VPN Effectiveness Dashboard
            </h1>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">
                Comprehensive VPN Security Assessment
              </h2>
              <p className="text-blue-800 mb-4">
                Evaluate your VPN&apos;s effectiveness across multiple security dimensions including IP protection, 
                DNS leak prevention, location privacy, and advanced privacy features.
              </p>
              
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">🔒 IP Protection</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• WebRTC leak detection</li>
                    <li>• Public IP masking</li>
                    <li>• IPv6 leak prevention</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">🌐 DNS Security</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• DNS leak testing</li>
                    <li>• DNS over HTTPS</li>
                    <li>• Server verification</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">📍 Location Privacy</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Geolocation blocking</li>
                    <li>• Timezone consistency</li>
                    <li>• Location spoofing</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">🔐 Advanced Privacy</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Fingerprint protection</li>
                    <li>• Tracking prevention</li>
                    <li>• Browser security</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          {result && (
            <div className={`rounded-lg border-2 p-6 ${getStatusColor(result.vpnStatus)}`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">VPN Effectiveness Score</h2>
                  <div className="text-5xl font-bold mb-2">
                    {Math.round((result.overallScore / result.maxPossibleScore) * 100)}%
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold">{result.overallGrade}</span>
                    <span className="text-lg capitalize">{result.vpnStatus} Protection</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">Tests Passed: </span>
                    <span className="font-semibold text-green-600">{result.summary.testsPassed}</span>
                    <span className="text-gray-600"> / </span>
                    <span className="font-semibold">{result.summary.totalTests}</span>
                  </div>
                  {result.summary.criticalIssues > 0 && (
                    <div className="mb-4">
                      <span className="text-sm text-red-600">Critical Issues: </span>
                      <span className="font-semibold text-red-700">{result.summary.criticalIssues}</span>
                    </div>
                  )}
                  <button
                    onClick={runVPNTest}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
                  >
                    {isLoading ? 'Testing...' : '🔄 Run Test Again'}
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-300 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${
                    result.vpnStatus === 'excellent' ? 'bg-green-500' :
                    result.vpnStatus === 'good' ? 'bg-blue-500' :
                    result.vpnStatus === 'poor' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.round((result.overallScore / result.maxPossibleScore) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Running comprehensive VPN effectiveness analysis...</p>
            <p className="text-sm text-gray-500 mt-2">Testing IP protection, DNS security, location privacy, and more...</p>
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
              onClick={runVPNTest}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium"
            >
              🔄 Retry Test
            </button>
          </div>
        )}

        {/* Results Tabs */}
        {result && (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: '📊 Overview' },
                  { id: 'categories', label: '🔍 Test Categories' },
                  { id: 'recommendations', label: '💡 Recommendations' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'overview' | 'categories' | 'recommendations')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Category Overview Cards */}
                {Object.entries(result.categories).map(([key, category]) => {
                  const percentage = Math.round((category.categoryScore / category.maxCategoryScore) * 100);
                  const hasIssues = category.criticalIssues > 0;
                  
                  return (
                    <div key={key} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-900">{category.categoryName}</h3>
                        <span className={`text-2xl font-bold ${hasIssues ? 'text-red-600' : percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {percentage}%
                        </span>
                      </div>
                      
                      <div className={`w-full rounded-full h-2 mb-3 ${hasIssues ? 'bg-red-200' : 'bg-gray-200'}`}>
                        <div 
                          className={`h-2 rounded-full ${hasIssues ? 'bg-red-500' : percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p>{category.tests.filter(t => t.status === 'pass').length}/{category.tests.length} tests passed</p>
                        {category.criticalIssues > 0 && (
                          <p className="text-red-600 font-medium">{category.criticalIssues} critical issue(s)</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="space-y-6">
                {Object.entries(result.categories).map(([key, category]) => (
                  <div key={key} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{category.categoryName}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-700">
                          {category.categoryScore}/{category.maxCategoryScore}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.round((category.categoryScore / category.maxCategoryScore) * 100)}% effective
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {category.tests.map((test, index) => (
                        <div key={index} className={`border rounded-lg p-4 ${getTestStatusColor(test.status)}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <span className="text-xl mr-2">{getTestStatusIcon(test.status)}</span>
                              <h4 className="font-medium">{test.testName}</h4>
                              {test.critical && (
                                <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                  Critical
                                </span>
                              )}
                            </div>
                            <span className="font-semibold">
                              {test.score}/{test.maxScore}
                            </span>
                          </div>
                          
                          <p className="text-sm mb-2">{test.description}</p>
                          <p className="text-xs text-gray-600 mb-2">{test.details}</p>
                          
                          {test.recommendation && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                              <strong>Recommendation:</strong> {test.recommendation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div className="space-y-6">
                {/* Immediate Actions */}
                {result.recommendations.immediate.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">🚨</span>
                      Immediate Actions Required
                    </h3>
                    <ul className="space-y-2">
                      {result.recommendations.immediate.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          <span className="text-red-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Important Improvements */}
                {result.recommendations.important.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">⚠️</span>
                      Important Improvements
                    </h3>
                    <ul className="space-y-2">
                      {result.recommendations.important.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          <span className="text-yellow-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Enhancements */}
                {result.recommendations.suggested.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">💡</span>
                      Suggested Enhancements
                    </h3>
                    <ul className="space-y-2">
                      {result.recommendations.suggested.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span className="text-blue-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* VPN Detection Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 VPN Detection Results</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">VPN Status:</p>
                      <p className={`font-medium ${result.metadata.vpnDetected ? 'text-green-600' : 'text-red-600'}`}>
                        {result.metadata.vpnDetected ? '✅ VPN Detected' : '❌ No VPN Detected'}
                      </p>
                    </div>
                    {result.metadata.estimatedLocation && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Apparent Location:</p>
                        <p className="font-medium text-gray-800">
                          {result.metadata.estimatedLocation.city}, {result.metadata.estimatedLocation.country}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 