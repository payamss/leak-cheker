
export default function Home() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Security Test Dashboard</h2>
      <p className="text-gray-600 text-lg mb-6">
        Welcome to the comprehensive Security Risk Checker suite. Use the sidebar navigation to access different security tests and protect your digital privacy.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Network Security</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• IP Leak Detection</li>
            <li>• DNS Leak Testing</li>
            <li>• WebRTC Exposure Check</li>
          </ul>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Privacy Analysis</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Geolocation Privacy</li>
            <li>• Cookie & Tracker Test</li>
            <li>• Browser Fingerprinting</li>
          </ul>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-2">Performance Testing</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Internet Speed Test</li>
            <li>• Connection Quality</li>
            <li>• VPN Performance</li>
          </ul>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">Threat Intelligence</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Dark Web Exposure</li>
            <li>• Malware Detection</li>
            <li>• Security Reputation</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">🛡️ Security Recommendations</h3>
        <p className="text-sm text-gray-700">
          Run all tests regularly to maintain optimal security. Each test provides specific recommendations to enhance your digital privacy and protection.
        </p>
      </div>
    </div>
  );
}
