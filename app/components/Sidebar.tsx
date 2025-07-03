'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  FiHome, 
  FiGlobe, 
  FiWifi, 
  FiRadio, 
  FiMapPin, 
  FiShield, 
  FiDatabase, 
  FiMenu, 
  FiX, 
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiZap,
  FiLock
} from 'react-icons/fi';

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
};

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Overview',
    href: '/',
    icon: FiHome,
    description: 'Security test dashboard'
  },
  {
    id: 'ip-leaks',
    label: 'IP Leaks',
    href: '/ip-leaks',
    icon: FiGlobe,
    description: 'Check for IP address exposure'
  },
  {
    id: 'dns-leaks',
    label: 'DNS Leaks',
    href: '/dns-leaks',
    icon: FiWifi,
    description: 'Test DNS server leakage'
  },
  {
    id: 'webrtc-leaks',
    label: 'WebRTC Leaks',
    href: '/webrtc-leaks',
    icon: FiRadio,
    description: 'Detect WebRTC IP exposure'
  },
  {
    id: 'geo-location',
    label: 'Geolocation',
    href: '/geo-location',
    icon: FiMapPin,
    description: 'Location privacy testing'
  },
  {
    id: 'dark-web-exposure',
    label: 'Dark Web Exposure',
    href: '/dark-web-exposure',
    icon: FiShield,
    description: 'Threat intelligence scan'
  },
  {
    id: 'cookie-tracker-test',
    label: 'Cookie & Tracker',
    href: '/cookie-tracker-test',
    icon: FiDatabase,
    description: 'Privacy & tracking analysis'
  },
  {
    id: 'vpn-effectiveness',
    label: 'VPN Effectiveness',
    href: '/vpn-effectiveness',
    icon: FiLock,
    description: 'Comprehensive VPN security analysis'
  },
  {
    id: 'internet-speed-test',
    label: 'Speed Test',
    href: '/internet-speed-test',
    icon: FiZap,
    description: 'Internet speed testing'
  },
  {
    id: 'privacy-policy',
    label: 'Privacy Policy',
    href: '/privacy-policy',
    icon: FiFileText,
    description: 'Terms and privacy'
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-md shadow-lg"
      >
        {isMobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-full bg-gray-900 text-white shadow-xl z-40 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!isCollapsed && (
            <Link href="/" className="flex items-center space-x-3" onClick={closeMobileMenu}>
              <Image
                src="/images/logo.png"
                alt="Security Risk Checker Logo"
                className="h-8 w-8 rounded"
                width={32}
                height={32}
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-blue-400">Security Risk</span>
                <span className="text-xs text-gray-300">Checker.de</span>
              </div>
            </Link>
          )}
          
          {isCollapsed && (
            <Link href="/" className="flex justify-center w-full" onClick={closeMobileMenu}>
              <Image
                src="/images/logo.png"
                alt="Logo"
                className="h-8 w-8 rounded"
                width={32}
                height={32}
              />
            </Link>
          )}

          {/* Collapse Toggle - Hidden on Mobile */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:block text-gray-400 hover:text-white transition-colors p-1 rounded"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`
                    flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-400'}`} />
                  
                  {!isCollapsed && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-gray-400 group-hover:text-gray-300">
                        {item.description}
                      </span>
                    </div>
                  )}
                  
                  {isActive && !isCollapsed && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4">
          {!isCollapsed ? (
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Security Test Suite</p>
                              <p className="text-xs text-gray-500">v1.2.1</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-1 bg-gray-600 rounded" />
            </div>
          )}
        </div>
      </div>
    </>
  );
} 