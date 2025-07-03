'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FiShield, 
  FiGlobe, 
  FiWifi, 
  FiRadio, 
  FiMapPin, 
  FiDatabase, 
  FiLock, 
  FiZap, 
  FiTrendingUp, 
  FiActivity,
  FiArrowRight,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo
} from 'react-icons/fi';

const testCategories = [
  {
    id: 'network-security',
    title: 'Network Security',
    description: 'Comprehensive network vulnerability assessment',
    icon: FiShield,
    color: 'blue',
    tests: [
      { name: 'IP Leak Detection', href: '/ip-leaks', icon: FiGlobe, description: 'Check for IP address exposure' },
      { name: 'DNS Leak Testing', href: '/dns-leaks', icon: FiWifi, description: 'Test DNS server leakage' },
      { name: 'WebRTC Exposure', href: '/webrtc-leaks', icon: FiRadio, description: 'Detect WebRTC IP exposure' }
    ]
  },
  {
    id: 'privacy-analysis',
    title: 'Privacy Analysis',
    description: 'Advanced privacy protection evaluation',
    icon: FiDatabase,
    color: 'green',
    tests: [
      { name: 'Geolocation Privacy', href: '/geo-location', icon: FiMapPin, description: 'Location privacy testing' },
      { name: 'Cookie & Tracker', href: '/cookie-tracker-test', icon: FiDatabase, description: 'Privacy & tracking analysis' },
      { name: 'VPN Effectiveness', href: '/vpn-effectiveness', icon: FiLock, description: 'Comprehensive VPN security analysis' }
    ]
  },
  {
    id: 'performance-testing',
    title: 'Performance Testing',
    description: 'Connection speed and quality analysis',
    icon: FiZap,
    color: 'purple',
    tests: [
      { name: 'Internet Speed Test', href: '/internet-speed-test', icon: FiZap, description: 'Internet speed testing' },
      { name: 'Connection Quality', href: '/internet-speed-test', icon: FiActivity, description: 'Network performance metrics' },
      { name: 'VPN Performance', href: '/vpn-effectiveness', icon: FiTrendingUp, description: 'VPN speed impact analysis' }
    ]
  },
  {
    id: 'threat-intelligence',
    title: 'Threat Intelligence',
    description: 'Security threat detection and analysis',
    icon: FiAlertTriangle,
    color: 'red',
    tests: [
      { name: 'Dark Web Exposure', href: '/dark-web-exposure', icon: FiShield, description: 'Threat intelligence scan' },
      { name: 'Security Reputation', href: '/dark-web-exposure', icon: FiCheckCircle, description: 'IP reputation check' },
      { name: 'Malware Detection', href: '/dark-web-exposure', icon: FiAlertTriangle, description: 'Malware threat analysis' }
    ]
  }
];

const colorSchemes = {
  blue: {
    bg: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-600',
    accent: 'text-blue-800',
    hover: 'hover:border-blue-300 hover:shadow-blue-100'
  },
  green: {
    bg: 'from-green-50 to-green-100',
    border: 'border-green-200',
    text: 'text-green-600',
    accent: 'text-green-800',
    hover: 'hover:border-green-300 hover:shadow-green-100'
  },
  purple: {
    bg: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    text: 'text-purple-600',
    accent: 'text-purple-800',
    hover: 'hover:border-purple-300 hover:shadow-purple-100'
  },
  red: {
    bg: 'from-red-50 to-red-100',
    border: 'border-red-200',
    text: 'text-red-600',
    accent: 'text-red-800',
    hover: 'hover:border-red-300 hover:shadow-red-100'
  }
};

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>
        <div className="relative px-6 py-12 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-full shadow-lg">
                <FiShield className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Security <span className="text-blue-600">Suite</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Comprehensive security testing suite to protect your digital privacy and identify vulnerabilities in your network configuration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cookie-tracker-test"
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Start Privacy Test
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              <Link
                href="/vpn-effectiveness"
                className="inline-flex items-center px-8 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Test VPN Effectiveness
                <FiLock className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Tests</p>
                  <p className="text-3xl font-bold text-gray-900">12+</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiShield className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Privacy Checks</p>
                  <p className="text-3xl font-bold text-gray-900">25+</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Threat Detection</p>
                  <p className="text-3xl font-bold text-gray-900">Real-time</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <FiAlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Test Categories */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Security Test Categories</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Comprehensive testing across multiple security domains to ensure complete protection
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {testCategories.map((category) => {
                const Icon = category.icon;
                const colors = colorSchemes[category.color as keyof typeof colorSchemes];
                
                return (
                  <div
                    key={category.id}
                    className={`bg-gradient-to-r ${colors.bg} border ${colors.border} rounded-xl p-6 shadow-lg transition-all duration-300 ${colors.hover}`}
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-white rounded-lg shadow-sm mr-4">
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${colors.accent}`}>{category.title}</h3>
                        <p className="text-gray-600 text-sm">{category.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {category.tests.map((test) => {
                        const TestIcon = test.icon;
                        return (
                          <Link
                            key={test.name}
                            href={test.href}
                            className="flex items-center justify-between p-3 bg-white bg-opacity-70 rounded-lg hover:bg-opacity-100 transition-all duration-200 group"
                          >
                            <div className="flex items-center">
                              <TestIcon className={`w-4 h-4 ${colors.text} mr-3`} />
                              <div>
                                <p className="font-medium text-gray-900">{test.name}</p>
                                <p className="text-xs text-gray-600">{test.description}</p>
                              </div>
                            </div>
                            <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick Security Assessment</h3>
              <p className="text-gray-600">
                Get instant insights into your security posture with our most popular tests
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/ip-leaks"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                <FiGlobe className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-900">IP Leak Test</span>
                <span className="text-sm text-gray-500">Quick check</span>
              </Link>
              
              <Link
                href="/dns-leaks"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-200 group"
              >
                <FiWifi className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-900">DNS Leak Test</span>
                <span className="text-sm text-gray-500">2-3 minutes</span>
              </Link>
              
              <Link
                href="/cookie-tracker-test"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
              >
                <FiDatabase className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-900">Privacy Test</span>
                <span className="text-sm text-gray-500">Comprehensive</span>
              </Link>
              
              <Link
                href="/vpn-effectiveness"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all duration-200 group"
              >
                <FiLock className="w-8 h-8 text-red-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-900">VPN Test</span>
                <span className="text-sm text-gray-500">Full analysis</span>
              </Link>
            </div>
          </div>

          {/* Security Tips */}
          <div className="mt-16 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-8">
            <div className="flex items-start">
              <div className="p-2 bg-yellow-100 rounded-lg mr-4">
                <FiInfo className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-800 mb-2">🛡️ Security Best Practices</h3>
                <div className="text-yellow-700 space-y-2">
                  <p>• Run security tests regularly to maintain optimal protection</p>
                  <p>• Use VPN services for enhanced privacy and security</p>
                  <p>• Keep your browser and security software updated</p>
                  <p>• Review and adjust privacy settings based on test results</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
