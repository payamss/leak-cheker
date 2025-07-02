'use client';

import { useEffect, useState } from 'react';
import { FiWifi, FiDownload, FiUpload, FiClock, FiPlay, FiRefreshCw, FiTrendingUp, FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import SpeedTestInfoBox from './components/SpeedTestInfoBox';

type TestStatus = 'idle' | 'testing' | 'completed' | 'error';

type SpeedTestResults = {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  jitter: number;
  testDuration: number;
  timestamp: Date;
};

type TestProgress = {
  download: number;
  upload: number;
  ping: number;
};



const InternetSpeedTest = () => {
  const [isClient, setIsClient] = useState(false);
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [results, setResults] = useState<SpeedTestResults | null>(null);
  const [progress, setProgress] = useState<TestProgress>({ download: 0, upload: 0, ping: 0 });
  const [currentTest, setCurrentTest] = useState<'ping' | 'download' | 'upload' | 'complete'>('ping');
  const [error, setError] = useState<string | null>(null);
  
  // Test configuration
  const [testConfig] = useState({
    downloadSize: 5 * 1024 * 1024, // 5MB for download test
    uploadSize: 2 * 1024 * 1024,   // 2MB for upload test
    pingCount: 5,                   // Number of ping tests
    testIterations: 3               // Multiple iterations for accuracy
  });

  // Ping/Latency Test
  const testPing = async (): Promise<{ ping: number; jitter: number }> => {
    const pings: number[] = [];
    
    for (let i = 0; i < testConfig.pingCount; i++) {
      try {
        const startTime = performance.now();
        const response = await fetch('https://httpbin.org/json', { 
          method: 'GET',
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          await response.json(); // Ensure full response is received
          const endTime = performance.now();
          const pingTime = endTime - startTime;
          pings.push(pingTime);
        }
        
        setProgress(prev => ({ ...prev, ping: ((i + 1) / testConfig.pingCount) * 100 }));
        
        // Small delay between pings
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn('Ping test failed:', e);
      }
    }
    
    if (pings.length === 0) throw new Error('All ping tests failed');
    
    const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
    const jitter = Math.sqrt(pings.reduce((sum, ping) => sum + Math.pow(ping - avgPing, 2), 0) / pings.length);
    
    return { ping: Math.round(avgPing), jitter: Math.round(jitter * 10) / 10 };
  };

  // Download Speed Test
  const testDownloadSpeed = async (): Promise<number> => {
    const speeds: number[] = [];
    
    for (let iteration = 0; iteration < testConfig.testIterations; iteration++) {
      try {
        // Create test data URL with random content to avoid caching
        const testUrl = `https://httpbin.org/bytes/${Math.floor(testConfig.downloadSize / testConfig.testIterations)}?${Date.now()}-${Math.random()}`;
        
        const startTime = performance.now();
        const response = await fetch(testUrl, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) throw new Error('Download test failed');
        
        // Read the response as bytes
        const arrayBuffer = await response.arrayBuffer();
        const endTime = performance.now();
        
        const duration = (endTime - startTime) / 1000; // Convert to seconds
        const bytes = arrayBuffer.byteLength;
        const speedMbps = (bytes * 8) / (duration * 1000000); // Convert to Mbps
        
        speeds.push(speedMbps);
        
        setProgress(prev => ({ 
          ...prev, 
          download: ((iteration + 1) / testConfig.testIterations) * 100 
        }));
        
      } catch (e) {
        console.warn('Download iteration failed:', e);
      }
    }
    
    if (speeds.length === 0) throw new Error('All download tests failed');
    
    // Return median speed for more accurate results
    speeds.sort((a, b) => a - b);
    const median = speeds[Math.floor(speeds.length / 2)];
    return Math.round(median * 100) / 100;
  };

  // Upload Speed Test
  const testUploadSpeed = async (): Promise<number> => {
    const speeds: number[] = [];
    
    for (let iteration = 0; iteration < testConfig.testIterations; iteration++) {
      try {
        // Create test data for upload
        const testData = new Uint8Array(Math.floor(testConfig.uploadSize / testConfig.testIterations));
        // Fill with random data
        for (let i = 0; i < testData.length; i++) {
          testData[i] = Math.floor(Math.random() * 256);
        }
        
        const startTime = performance.now();
        const response = await fetch('https://httpbin.org/post', {
          method: 'POST',
          body: testData,
          headers: {
            'Content-Type': 'application/octet-stream',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) throw new Error('Upload test failed');
        
        await response.json(); // Ensure full response is received
        const endTime = performance.now();
        
        const duration = (endTime - startTime) / 1000; // Convert to seconds
        const bytes = testData.length;
        const speedMbps = (bytes * 8) / (duration * 1000000); // Convert to Mbps
        
        speeds.push(speedMbps);
        
        setProgress(prev => ({ 
          ...prev, 
          upload: ((iteration + 1) / testConfig.testIterations) * 100 
        }));
        
      } catch (e) {
        console.warn('Upload iteration failed:', e);
      }
    }
    
    if (speeds.length === 0) throw new Error('All upload tests failed');
    
    // Return median speed for more accurate results
    speeds.sort((a, b) => a - b);
    const median = speeds[Math.floor(speeds.length / 2)];
    return Math.round(median * 100) / 100;
  };

  // Main speed test function
  const runSpeedTest = async () => {
    setTestStatus('testing');
    setError(null);
    setProgress({ download: 0, upload: 0, ping: 0 });
    
    const testStartTime = performance.now();
    
    try {
      // Step 1: Ping Test
      setCurrentTest('ping');
      const { ping, jitter } = await testPing();
      
      // Step 2: Download Test
      setCurrentTest('download');
      const downloadSpeed = await testDownloadSpeed();
      
      // Step 3: Upload Test
      setCurrentTest('upload');
      const uploadSpeed = await testUploadSpeed();
      
      const testEndTime = performance.now();
      const testDuration = Math.round((testEndTime - testStartTime) / 1000);
      
      setCurrentTest('complete');
      setResults({
        downloadSpeed,
        uploadSpeed,
        ping,
        jitter,
        testDuration,
        timestamp: new Date()
      });
      
      setTestStatus('completed');
      
    } catch (err) {
      console.error('Speed test failed:', err);
      setError(err instanceof Error ? err.message : 'Speed test failed');
      setTestStatus('error');
    }
  };

  // Get speed category and color
  const getSpeedCategory = (speed: number, type: 'download' | 'upload') => {
    const thresholds = type === 'download' 
      ? { excellent: 100, good: 50, fair: 25, poor: 10 }
      : { excellent: 50, good: 25, fair: 10, poor: 5 };
    
    if (speed >= thresholds.excellent) return { category: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (speed >= thresholds.good) return { category: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (speed >= thresholds.fair) return { category: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (speed >= thresholds.poor) return { category: 'Poor', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { category: 'Very Poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  // Get ping category
  const getPingCategory = (ping: number) => {
    if (ping <= 20) return { category: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (ping <= 50) return { category: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (ping <= 100) return { category: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (ping <= 200) return { category: 'Poor', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { category: 'Very Poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  // Generate recommendations
  const getRecommendations = (results: SpeedTestResults) => {
    const recommendations: string[] = [];
    
    if (results.downloadSpeed < 25) {
      recommendations.push('Your download speed is below recommended levels for HD streaming and video calls.');
    }
    
    if (results.uploadSpeed < 10) {
      recommendations.push('Low upload speed may affect video calls, file uploads, and cloud backup.');
    }
    
    if (results.ping > 100) {
      recommendations.push('High latency detected. This may affect real-time applications and gaming.');
    }
    
    if (results.jitter > 10) {
      recommendations.push('Network instability detected. Consider checking your connection stability.');
    }
    
    // VPN-specific recommendations
    if (results.downloadSpeed < 50) {
      recommendations.push('VPN performance may be impacted. Consider upgrading your connection for optimal security tool performance.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Your connection speeds are good! Your security tools should perform optimally.');
    }
    
    return recommendations;
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Internet Speed Test
        </h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
        <FiWifi className="w-8 h-8 mr-3" />
        Internet Speed Test
      </h2>

      {/* Info Box */}
      <SpeedTestInfoBox />

      {/* Test Control */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
        {testStatus === 'idle' && (
          <div>
            <p className="text-gray-600 mb-4">
              Test your internet connection speed and get personalized recommendations.
            </p>
            <button
              onClick={runSpeedTest}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center mx-auto"
            >
              <FiPlay className="w-5 h-5 mr-2" />
              Start Speed Test
            </button>
          </div>
        )}
        
        {testStatus === 'testing' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Running Speed Test... ({currentTest})
            </h3>
            <div className="space-y-4 max-w-md mx-auto">
              {/* Ping Progress */}
              <div className="flex items-center space-x-3">
                <FiClock className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Ping Test</span>
                    <span>{Math.round(progress.ping)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.ping}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Download Progress */}
              <div className="flex items-center space-x-3">
                <FiDownload className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Download Test</span>
                    <span>{Math.round(progress.download)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.download}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              <div className="flex items-center space-x-3">
                <FiUpload className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Upload Test</span>
                    <span>{Math.round(progress.upload)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.upload}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {testStatus === 'completed' && (
          <button
            onClick={runSpeedTest}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center mx-auto"
          >
            <FiRefreshCw className="w-5 h-5 mr-2" />
            Run Test Again
          </button>
        )}
        
        {testStatus === 'error' && (
          <div>
            <div className="text-red-600 mb-4">
              <p>❌ {error}</p>
            </div>
            <button
              onClick={runSpeedTest}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Retry Test
            </button>
          </div>
        )}
      </div>

      {/* Results Display */}
      {results && testStatus === 'completed' && (
        <div className="space-y-6">
          {/* Speed Results Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Download Speed */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex items-center justify-center mb-4">
                <FiDownload className="w-8 h-8 text-green-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-800">Download</h3>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {results.downloadSpeed} <span className="text-lg text-gray-500">Mbps</span>
              </div>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm ${getSpeedCategory(results.downloadSpeed, 'download').bg} ${getSpeedCategory(results.downloadSpeed, 'download').color}`}>
                {getSpeedCategory(results.downloadSpeed, 'download').category}
              </div>
            </div>

            {/* Upload Speed */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex items-center justify-center mb-4">
                <FiUpload className="w-8 h-8 text-orange-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-800">Upload</h3>
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {results.uploadSpeed} <span className="text-lg text-gray-500">Mbps</span>
              </div>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm ${getSpeedCategory(results.uploadSpeed, 'upload').bg} ${getSpeedCategory(results.uploadSpeed, 'upload').color}`}>
                {getSpeedCategory(results.uploadSpeed, 'upload').category}
              </div>
            </div>

            {/* Ping/Latency */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex items-center justify-center mb-4">
                <FiClock className="w-8 h-8 text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-800">Ping</h3>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {results.ping} <span className="text-lg text-gray-500">ms</span>
              </div>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm ${getPingCategory(results.ping).bg} ${getPingCategory(results.ping).color}`}>
                {getPingCategory(results.ping).category}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Jitter: {results.jitter}ms
              </div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FiTrendingUp className="w-5 h-5 mr-2" />
              Performance Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Speed Comparison</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Your Download:</span>
                    <span className="font-medium">{results.downloadSpeed} Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Global Average:</span>
                    <span className="text-gray-500">~50 Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HD Streaming Minimum:</span>
                    <span className="text-gray-500">25 Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span>4K Streaming Minimum:</span>
                    <span className="text-gray-500">100 Mbps</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Test Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Test Duration:</span>
                    <span className="font-medium">{results.testDuration}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Test Time:</span>
                    <span className="font-medium">{results.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connection Stability:</span>
                    <span className={`font-medium ${results.jitter < 5 ? 'text-green-600' : results.jitter < 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {results.jitter < 5 ? 'Excellent' : results.jitter < 15 ? 'Good' : 'Poor'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
              <FiInfo className="w-6 h-6 mr-2" />
              Recommendations & Optimizations
            </h3>
            
            <div className="space-y-3">
              {getRecommendations(results).map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-1">
                    {recommendation.includes('good') || recommendation.includes('optimal') ? (
                      <FiCheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <FiAlertTriangle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <p className="text-sm text-blue-800">{recommendation}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-white rounded-md border border-blue-200">
              <h4 className="font-semibold text-blue-700 mb-2">General Optimization Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Close unnecessary applications and browser tabs</li>
                <li>• Use wired connection instead of Wi-Fi when possible</li>
                <li>• Position router in a central, elevated location</li>
                <li>• Update router firmware and network drivers</li>
                <li>• Consider upgrading your internet plan if speeds are consistently low</li>
                <li>• For VPN users: Choose servers closer to your location for better speed</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternetSpeedTest; 