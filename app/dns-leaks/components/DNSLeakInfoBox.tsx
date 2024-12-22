import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const DNSLeakInfoBox = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-5 mb-4 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg shadow-sm transition-all duration-300">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded-lg px-4 py-3 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="text-xl font-semibold text-gray-700">
          What is a DNS Leak?
        </h4>
        <div className="transition-transform duration-300">
          {isOpen ? (
            <FiChevronUp className="w-6 h-6 text-gray-500 rotate-180" />
          ) : (
            <FiChevronDown className="w-6 h-6 text-gray-500" />
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      <div
        className={`mt-4 overflow-hidden transition-max-height duration-500 ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        {/* Description */}
        <div className="text-gray-700 text-sm leading-relaxed">
          <p className="mb-4">
            A DNS Leak occurs when your DNS queries are sent to unintended DNS
            servers—often the default servers provided by your ISP—rather than
            private or VPN-provided servers. This exposes your browsing activity
            to your ISP or third parties, undermining your online privacy and
            security.
          </p>

          {/* Divider */}
          <hr className="my-4 border-gray-200" />

          {/* Reasons */}
          <p className="font-semibold text-gray-800 text-base">🔍 Why DNS Leaks Happen</p>
          <ul className="list-disc list-inside space-y-2 mt-2 text-gray-600">
            <li>
              <strong>Improper VPN Configuration:</strong> Misconfigured VPNs may not force DNS
              traffic through the secure VPN tunnel.
            </li>
            <li>
              <strong>IPv6 Leaks:</strong> VPNs that only handle IPv4 may leak IPv6 traffic if your
              ISP supports IPv6.
            </li>
            <li>
              <strong>Public Wi-Fi:</strong> Public networks can override your DNS settings to use
              their servers.
            </li>
            <li>
              <strong>Manual DNS Configuration:</strong> Manually set DNS servers may bypass your
              VPN&apos;s protection.
            </li>
            <li>
              <strong>Split Tunneling:</strong> This feature allows some traffic to bypass the VPN,
              leading to DNS leaks.
            </li>
            <li>
              <strong>Browser-Specific Behavior:</strong> Some browsers use their own DNS resolvers,
              ignoring system settings.
            </li>
          </ul>

          {/* Divider */}
          <hr className="my-4 border-gray-200" />

          {/* Privacy Impact */}
          <p className="font-semibold text-gray-800 text-base mb-2">
            Why is DNS Leak a Privacy Issue?
          </p>
          <p className="mb-4">
            DNS leaks can expose your internet activity, including the websites
            you visit, your IP address, and your location. Since DNS queries
            include timestamps, geolocation, and your browsing history, leaks
            enable DNS providers or unauthorized third parties to log, analyze,
            and even manipulate your activity.
          </p>

          {/* How to Detect */}
          <p className="font-semibold text-gray-800 text-base mb-2">
            How to Detect a DNS Leak
          </p>
          <p className="mb-4">
            The most reliable way to detect a DNS leak is by using a DNS leak
            testing tool, like the one you’re using now. It compares your DNS
            server&apos;s details with the expected values to flag any
            discrepancies.
          </p>

          {/* Divider */}
          <hr className="my-4 border-gray-200" />

          {/* Prevention Tips */}
          <p className="font-semibold text-gray-800 text-base mb-2">
            How to Prevent DNS Leaks
          </p>
          <ul className="list-disc list-inside space-y-2 mt-2 text-gray-600">
            <li>
              <strong>Use a Reliable VPN:</strong> Choose a VPN with DNS leak protection and its own
              DNS servers.
            </li>
            <li>
              <strong>Configure DNS Settings Correctly:</strong> Ensure your router, operating
              system, browser, and apps all use the same DNS provider.
            </li>
            <li>
              <strong>Disable IPv6:</strong> If your VPN does not support IPv6, disable it on your
              device to prevent leaks.
            </li>
            <li>
              <strong>Flush DNS Cache:</strong> Clear outdated DNS data by running the appropriate
              command for your operating system (e.g., <code>ipconfig /flushdns</code>).
            </li>
            <li>
              <strong>Update Router Firmware:</strong> Keep your router’s firmware updated to avoid
              DNS-related vulnerabilities.
            </li>
          </ul>

          {/* Divider */}
          <hr className="my-4 border-gray-200" />

          {/* Myth Busting */}
          <p className="font-semibold text-gray-800 text-base mb-2">Busting Myths</p>
          <p>
            A common misconception is that only VPNs can prevent DNS leaks. While VPNs add a layer
            of privacy, proper local DNS configuration is essential. Ensure DNS settings are
            consistent across all devices and networks to maintain privacy, even without a VPN.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DNSLeakInfoBox;
