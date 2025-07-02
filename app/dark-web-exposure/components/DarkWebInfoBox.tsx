import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiShield, FiEye, FiAlertTriangle } from 'react-icons/fi';

const DarkWebInfoBox = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-5 mb-6 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg shadow-sm transition-all duration-300">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded-lg px-4 py-3 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="text-xl font-semibold text-gray-700 flex items-center">
          <FiShield className="w-6 h-6 mr-2 text-blue-600" />
          What Is Dark Web Exposure?
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
        className={`mt-4 overflow-hidden transition-max-height duration-500 ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="text-gray-700 text-sm leading-relaxed">
          <p className="mb-4">
            Dark Web Exposure occurs when your IP address, personal data, or network information 
            appears in cybercriminal databases, threat intelligence feeds, or is associated with 
            malicious activities. This can happen if your network has been compromised, used in 
            attacks, or your data has been breached and sold on dark web marketplaces.
          </p>

          {/* Divider */}
          <hr className="my-4 border-gray-200" />

          {/* How It Happens */}
          <div className="mb-4">
            <p className="font-semibold text-gray-800 text-base mb-2 flex items-center">
              <FiEye className="w-4 h-4 mr-2" />
              How Does Your IP Get Exposed?
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>
                <strong>Malware Infections:</strong> Compromised devices can turn your IP into part of a botnet
              </li>
              <li>
                <strong>Data Breaches:</strong> Your network information gets leaked and sold on dark markets
              </li>
              <li>
                <strong>Vulnerable Services:</strong> Exposed services or weak passwords lead to network compromise
              </li>
              <li>
                <strong>Phishing Attacks:</strong> Successful attacks can lead to network infiltration
              </li>
              <li>
                <strong>IoT Device Compromises:</strong> Unsecured smart devices can expose your entire network
              </li>
            </ul>
          </div>

          {/* Divider */}
          <hr className="my-4 border-gray-200" />

          {/* What We Check */}
          <div className="mb-4">
            <p className="font-semibold text-gray-800 text-base mb-2 flex items-center">
              <FiAlertTriangle className="w-4 h-4 mr-2" />
              What Our Scan Checks
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Threat Intelligence Databases:</h5>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                  <li>AbuseIPDB - Abuse and attack reports</li>
                  <li>VirusTotal - Multi-engine security scanning</li>
                  <li>IPQualityScore - Fraud and reputation analysis</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Security Intelligence:</h5>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                  <li>Shodan - Internet-wide scan data</li>
                  <li>Blocklist.de - Attack and spam logs</li>
                  <li>SURBL - Spam and malware databases</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="my-4 border-gray-200" />

          {/* Risk Levels */}
          <div className="mb-4">
            <p className="font-semibold text-gray-800 text-base mb-2">Risk Level Indicators</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Clean</span>
                <span className="text-sm text-gray-600">No threats detected in any database</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">Low Risk</span>
                <span className="text-sm text-gray-600">Minor security concerns or outdated flags</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">Medium Risk</span>
                <span className="text-sm text-gray-600">Moderate threat indicators requiring attention</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">High Risk</span>
                <span className="text-sm text-gray-600">Active threats or recent compromise indicators</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-2 py-1 bg-red-200 text-red-900 text-xs rounded-full font-medium">Critical</span>
                <span className="text-sm text-gray-600">Immediate action required - active threats detected</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="my-4 border-gray-200" />

          {/* Prevention Tips */}
          <div className="mb-4">
            <p className="font-semibold text-gray-800 text-base mb-2">
              How to Protect Against Dark Web Exposure
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>
                <strong>Regular Security Scans:</strong> Run frequent malware and vulnerability scans
              </li>
              <li>
                <strong>Strong Network Security:</strong> Use firewalls, VPNs, and secure passwords
              </li>
              <li>
                <strong>Update Everything:</strong> Keep all devices and software up to date
              </li>
              <li>
                <strong>Monitor Network Traffic:</strong> Watch for unusual activity or connections
              </li>
              <li>
                <strong>Secure IoT Devices:</strong> Change default passwords and update firmware
              </li>
              <li>
                <strong>Use Threat Intelligence:</strong> Regular monitoring can catch issues early
              </li>
            </ul>
          </div>

          {/* Divider */}
          <hr className="my-4 border-gray-200" />

          {/* Disclaimer */}
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This scan checks publicly available threat intelligence databases. 
                             A clean result doesn&apos;t guarantee complete security, and flagged results may include 
              false positives. Always investigate further and consult with security professionals 
              for comprehensive threat assessment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkWebInfoBox; 