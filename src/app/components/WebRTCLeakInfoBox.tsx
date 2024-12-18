import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const WebRTCLeakInfoBox = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-5 mb-4 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg shadow-sm transition-all duration-300">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded-lg px-4 py-3 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="text-xl font-semibold text-gray-700">
          What Is a WebRTC Leak?
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
        <div className="text-gray-700 text-sm leading-relaxed">
          <p className="mb-4">
            WebRTC (Web Real-Time Communication) is a technology used for
            real-time communication in web browsers, enabling audio, video,
            and data sharing without the need for external plugins. While
            convenient, WebRTC can expose your real IP address even when
            using privacy tools like VPNs or proxies, leading to potential
            privacy breaches.
          </p>

          {/* Divider */}
          <hr className="my-4 border-gray-200" />

          {/* How Leaks Occur */}
          <p className="font-semibold text-gray-800 text-base">🔍 How Do WebRTC Leaks Happen?</p>
          <ul className="list-disc list-inside space-y-2 mt-2 text-gray-600">
            <li>
              <strong>STUN Requests:</strong> WebRTC uses the STUN protocol to determine public IP
              addresses. These requests can expose your IP via JavaScript on web pages.
            </li>
            <li>
              <strong>Peer-to-Peer Connections:</strong> Direct connections between users reveal
              IP addresses during communication, making them accessible to malicious scripts.
            </li>
            <li>
              <strong>Misconfigured VPNs or Proxies:</strong> Improper settings may allow WebRTC
              to bypass protection and expose your real IP address.
            </li>
          </ul>

          {/* Divider */}
          <hr className="my-4 border-gray-200" />

          {/* Risks */}
          <p className="font-semibold text-gray-800 text-base mb-2">
            What Are the Risks of WebRTC Leaks?
          </p>
          <p className="mb-4">
            A WebRTC leak exposes your real IP address, compromising anonymity. This allows
            websites, advertisers, and even malicious actors to track your activity, determine
            your location, or target you with attacks. It defeats the purpose of using privacy
            tools like VPNs.
          </p>

          {/* Divider */}
          <hr className="my-4 border-gray-200" />

          {/* Prevention Tips */}
          <p className="font-semibold text-gray-800 text-base mb-2">
            How to Prevent WebRTC Leaks
          </p>
          <ul className="list-disc list-inside space-y-2 mt-2 text-gray-600">
            <li>
              <strong>Disable WebRTC:</strong> Turn off WebRTC in your browser settings if you
              don’t use WebRTC-reliant applications.
            </li>
            <li>
              <strong>Use WebRTC Controls:</strong> Configure your browser to manage WebRTC
              permissions and limit exposure.
            </li>
            <li>
              <strong>Keep Software Updated:</strong> Regularly update your browser and extensions
              to patch vulnerabilities.
            </li>
            <li>
              <strong>Run Regular Tests:</strong> Use WebRTC leak detection tools to ensure your
              IP remains protected.
            </li>
          </ul>

          {/* Divider */}
          <hr className="my-4 border-gray-200" />

          {/* Conclusion */}
          <p className="font-semibold text-gray-800 text-base mb-2">Conclusion</p>
          <p>
            WebRTC is a powerful tool for real-time communication, but it can inadvertently
            compromise privacy. By disabling or managing WebRTC settings and ensuring proper
            configuration of privacy tools, you can significantly reduce the risk of WebRTC
            leaks. Regular monitoring and updates are essential for maintaining online privacy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WebRTCLeakInfoBox;
