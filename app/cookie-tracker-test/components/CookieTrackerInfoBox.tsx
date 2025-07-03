import React from 'react';
import { FiInfo, FiEye, FiShield, FiDatabase } from 'react-icons/fi';

const CookieTrackerInfoBox = () => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <FiInfo className="w-8 h-8 text-purple-600 mt-1" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-purple-800 mb-3 flex items-center">
            <FiDatabase className="w-5 h-5 mr-2" />
            About Cookie & Tracker Testing
          </h3>
          
          <div className="space-y-4 text-gray-700">
            <p>
              This comprehensive privacy test analyzes how your browser handles cookies, tracking, fingerprinting, and IP leaks. 
              It helps you understand your digital privacy exposure and provides actionable recommendations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <div className="bg-white p-4 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-700 mb-2 flex items-center">
                  <FiDatabase className="w-4 h-4 mr-2" />
                  Cookie & Storage Analysis
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Enhanced third-party cookie detection</li>
                  <li>• Local/session storage testing</li>
                  <li>• SameSite policy analysis</li>
                  <li>• Cross-origin tracking detection</li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-700 mb-2 flex items-center">
                  <FiEye className="w-4 h-4 mr-2" />
                  Advanced Fingerprinting
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Canvas & WebGL fingerprinting</li>
                  <li>• Audio context fingerprinting</li>
                  <li>• Battery & Gamepad API detection</li>
                  <li>• Media device enumeration</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-700 mb-2 flex items-center">
                  <FiShield className="w-4 h-4 mr-2" />
                  Network Privacy Tests
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• WebRTC IP leak detection</li>
                  <li>• Real-time tracker scanning</li>
                  <li>• Social widget detection</li>
                  <li>• Tracking pixel identification</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-purple-100">
              <h4 className="font-semibold text-purple-700 mb-2 flex items-center">
                <FiShield className="w-4 h-4 mr-2" />
                Privacy Protection Guidance
              </h4>
              <p className="text-sm">
                Based on your test results, you&apos;ll receive personalized recommendations for browser settings, 
                privacy extensions, and alternative browsers to enhance your digital privacy and reduce tracking.
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This tool performs client-side tests only and does not collect or store any personal data. 
                All analysis is done locally in your browser for maximum privacy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieTrackerInfoBox; 