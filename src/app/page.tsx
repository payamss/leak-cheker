import IPLeakTest from './components/IPLeakTest';
import DNSLeakTest from './components/DNSLeakTest';
import WebRTCLeakTest from './components/WebRTCLeakTest';
import LocationTest from './components/LocationTest';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Personal Online Security Tests
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Use this tool to check for IP leaks, DNS leaks, WebRTC leaks, and location exposure.
        </p>
        <div className="space-y-6">
          <IPLeakTest />
          <DNSLeakTest />
          <WebRTCLeakTest />
          <LocationTest />
        </div>
        <footer className="text-center text-gray-500 text-sm mt-8">
          Created for personal security awareness. Stay safe online!
        </footer>
      </div>
    </main>
  );
}
