'use client';

import React, { useState } from 'react';
import Overview from './Overview';
import IPLeaksTest from './IPLeaksTest';
import DNSLeakTest from './DNSLeakTest';
import WebRTCLeakTest from './WebRTCLeakTest';
import GeoLocationTest from './GeoLocationTest';

const TabNavigator = () => {
  const [activeTab, setActiveTab] = useState('ip-leaks')
  const [menuOpen, setMenuOpen] = useState(false);

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
      {/* Header and Hamburger Menu */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="text-2xl font-bold text-blue-500">Security Tests</div>

            {/* Hamburger Menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden text-gray-600 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop Tabs */}
            <div className="hidden sm:flex space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-4 text-sm font-medium rounded ${activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-blue-500 hover:bg-gray-100'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="sm:hidden flex flex-col space-y-2 pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMenuOpen(false); // Close menu on tab click
                  }}
                  className={`py-2 px-4 text-sm font-medium rounded ${activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-blue-500 hover:bg-gray-100'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">{renderTabContent()}</div>
    </div>
  );
};

export default TabNavigator;
