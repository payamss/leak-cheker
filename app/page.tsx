
export default function Home() {
  return (
    <div className="bg-white p-6 rounded-lg shadow ">
      <h2 className="text-2xl font-semibold mb-4">Overview</h2>
      <p className="text-gray-600">
        Welcome to the Personal Security Test Suite. Use the navigation tabs above to run different security tests:
      </p>
      <ul className="list-disc list-inside mt-4 text-gray-800">
        <li>IP Leaks</li>
        <li>DNS Leaks</li>
        <li>WebRTC Leaks</li>
        <li>Geolocation Leaks</li>
      </ul>
    </div>
  );
}
