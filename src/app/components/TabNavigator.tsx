'use client';

import React, { useState } from 'react';
import DNSLeakTest from './DNSLeakTest';
import WebRTCLeakTest from './WebRTCLeakTest';
import GeoLocationTest from './GeoLocationTest';
import Overview from './Overview';
import IPLeaksTest from './IPLeaksTest';

const TabNavigator = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Define available tabs
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'ip-leaks', label: 'IP Leaks Test' },
    { id: 'dns-leaks', label: 'DNS Leak Test' },
    { id: 'webrtc-leaks', label: 'WebRTC Leak Test' },
    { id: 'geo-location', label: 'Geolocation Test' },
  ];

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'ip-leaks':
        return <IPLeaksTest />;
      case 'dns-leaks':
        return <DNSLeakTest />;
      case 'webrtc-leaks':
        return <WebRTCLeakTest />;
      case 'geo-location':
        return <GeoLocationTest />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Tabs */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-5 text-sm font-medium border-b-2 ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-600 hover:text-blue-500 hover:border-blue-500'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Tab Content */}
      <div className="p-6">{renderTabContent()}</div>
    </div>
  );
};

export default TabNavigator;
