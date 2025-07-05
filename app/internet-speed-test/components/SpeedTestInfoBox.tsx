import React from 'react';
import { FiInfo, FiWifi, FiTrendingUp, FiShield } from 'react-icons/fi';

const SpeedTestInfoBox = () => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 p-3 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
      <div className="flex items-start space-x-3 sm:space-x-4">
        <div className="flex-shrink-0">
          <FiInfo className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mt-1" />
        </div>
        <div className="flex-1">
          <h3 className="text-base sm:text-xl font-semibold text-green-800 mb-2 sm:mb-3 flex items-center">
            <FiWifi className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            About Internet Speed Testing
          </h3>
          <div className="space-y-2 sm:space-y-4 text-gray-700">
            <p className="text-xs sm:text-base">
              This comprehensive speed test measures your internet connection&apos;s download, upload speeds, and latency. 
              Understanding your actual speeds helps optimize security tools like VPNs and ensures reliable protection.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 mt-2 sm:mt-4">
              <div className="bg-white p-2 sm:p-4 rounded-lg border border-green-100">
                <h4 className="font-semibold text-green-700 mb-1 sm:mb-2 flex items-center">
                  <FiTrendingUp className="w-3 h-3 sm:w-4 mr-2" />
                  Speed Measurements
                </h4>
                <ul className="text-xs sm:text-sm space-y-1">
                  <li>• Download speed (Mbps) - 100MB+ multi-server test</li>
                  <li>• Upload speed (Mbps) - 50MB+ concurrent uploads</li>
                  <li>• Ping latency (ms) - Multi-ping analysis</li>
                  <li>• Connection stability with jitter measurement</li>
                </ul>
              </div>
              <div className="bg-white p-2 sm:p-4 rounded-lg border border-green-100">
                <h4 className="font-semibold text-green-700 mb-1 sm:mb-2 flex items-center">
                  <FiShield className="w-3 h-3 sm:w-4 mr-2" />
                  Security Impact
                </h4>
                <ul className="text-xs sm:text-sm space-y-1">
                  <li>• VPN performance optimization</li>
                  <li>• Security update speeds</li>
                  <li>• Real-time threat protection</li>
                  <li>• Secure browsing experience</li>
                </ul>
              </div>
            </div>
            <div className="bg-white p-2 sm:p-4 rounded-lg border border-green-100">
              <h4 className="font-semibold text-green-700 mb-1 sm:mb-2 flex items-center">
                <FiWifi className="w-3 h-3 sm:w-4 mr-2" />
                Performance Analysis & Recommendations
              </h4>
              <p className="text-xs sm:text-sm">
                Compare your results with ISP promises and global averages. Get personalized recommendations 
                to improve your connection speed, optimize security tool performance, and enhance overall digital security.
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-2 sm:p-3 rounded-md">
              <p className="text-xs sm:text-sm text-yellow-800">
                <strong>Note:</strong> Our enhanced speed test uses large files (100MB+ downloads, 50MB+ uploads) and runs for 10-30 seconds 
                to accurately measure high-speed connections. This test will use significant bandwidth and may affect other network activities. 
                For best results, close other applications and avoid downloads during testing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedTestInfoBox; 