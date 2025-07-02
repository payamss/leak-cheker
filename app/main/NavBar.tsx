'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation'; // Correct hook for app directory routing
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname(); // Get the current path
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { id: 'ip-leaks', label: 'IP Leaks', href: '/ip-leaks' },
    { id: 'dns-leaks', label: 'DNS Leaks', href: '/dns-leaks' },
    { id: 'webrtc-leaks', label: 'WebRTC Leaks', href: '/webrtc-leaks' },
    { id: 'geo-location', label: 'Geolocation', href: '/geo-location' },
    { id: 'dark-web-exposure', label: 'Dark Web Exposure', href: '/dark-web-exposure' },
    { id: 'cookie-tracker-test', label: 'Cookie & Tracker', href: '/cookie-tracker-test' },
  ];

  return (
    <div className=" bg-gray-100">
      <header className="w-full bg-white shadow-md py-4">
        <div className="container mx-auto flex items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/logo.png"
              alt="Feed Fresh Logo"
              className="h-12 w-12"
              width={48}
              height={48}
            />
            <div className="relative">
              <h1 className="text-xl font-bold text-blue-600">
                Security Risk Checker
                <span className="absolute -top-3 right-[-0.7rem] text-xs text-blue-600">
                  .de
                </span>
              </h1>
            </div>
          </Link>

          {/* Hamburger Menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden text-gray-600 focus:outline-none"
          >
            <Image
              src="/images/menu.svg"
              alt="menu"
              className="h-6 w-6"
              width={24}
              height={24}
            />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex space-x-4">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`py-2 px-4 text-sm font-medium rounded ${pathname === tab.href
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-blue-500 hover:bg-gray-100'
                  }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="sm:hidden flex flex-col space-y-2 px-4 pb-4">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`py-2 px-4 text-sm font-medium rounded ${pathname === tab.href
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-blue-500 hover:bg-gray-100'
                  }`}
                onClick={() => setMenuOpen(false)} // Close menu on tab click
              >
                {tab.label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </div>
  );
}
