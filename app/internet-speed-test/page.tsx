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

type RealTimeSpeed = {
  downloadSpeed: number;
  uploadSpeed: number;
  showSpeed: boolean;
};

const InternetSpeedTest = () => {
  const [isClient, setIsClient] = useState(false);
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [results, setResults] = useState<SpeedTestResults | null>(null);
  const [progress, setProgress] = useState<TestProgress>({ download: 0, upload: 0, ping: 0 });
  const [currentTest, setCurrentTest] = useState<'ping' | 'download' | 'upload' | 'complete'>('ping');
  const [error, setError] = useState<string | null>(null);
  const [realTimeSpeed, setRealTimeSpeed] = useState<RealTimeSpeed>({ downloadSpeed: 0, uploadSpeed: 0, showSpeed: false });

  // Professional speed test configuration
  const [testConfig] = useState({
    pingCount: 5,                      // Number of ping tests
    minTestDuration: 10,               // Minimum test duration in seconds
    maxTestDuration: 25,               // Maximum test duration in seconds
    rampUpExcludeTime: 2,              // Exclude first 2 seconds (TCP ramp-up)
    stabilityWindow: 3,                // 3 seconds for stability detection
    maxConnections: 8,                 // Maximum parallel connections
    chunkSize: 8 * 1024 * 1024,       // 8MB chunks for large file simulation
    measurementInterval: 0.3           // 300ms measurement intervals
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ping/Latency Test
  const testPing = async (): Promise<{ ping: number; jitter: number }> => {
    const pings: number[] = [];
    
    // Use multiple reliable ping endpoints
    const pingEndpoints = [
      'https://www.google.com/favicon.ico',
      'https://www.cloudflare.com/favicon.ico',
      'https://www.microsoft.com/favicon.ico',
      'https://www.amazon.com/favicon.ico'
    ];
    
    for (let i = 0; i < testConfig.pingCount; i++) {
      try {
        const endpoint = pingEndpoints[i % pingEndpoints.length];
        const startTime = performance.now();
        
        const response = await fetch(`${endpoint}?t=${Date.now()}`, { 
          method: 'HEAD',
          cache: 'no-cache',
          mode: 'no-cors'
        });
        
        const endTime = performance.now();
        const pingTime = endTime - startTime;
        pings.push(pingTime);
        
        setProgress(prev => ({ ...prev, ping: ((i + 1) / testConfig.pingCount) * 100 }));
        
        // Small delay between pings
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) {
        console.warn('Ping test failed:', e);
        // Add a fallback ping time if request fails
        pings.push(100); // 100ms fallback
      }
    }
    
    if (pings.length === 0) throw new Error('All ping tests failed');
    
    const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
    const jitter = Math.sqrt(pings.reduce((sum, ping) => sum + Math.pow(ping - avgPing, 2), 0) / pings.length);
    
    return { ping: Math.round(avgPing), jitter: Math.round(jitter * 10) / 10 };
  };

  // Professional Download Speed Test - Browser-Compatible Version
  const testDownloadSpeed = async (): Promise<number> => {
    console.log('Starting professional download test...');
    
    const startTime = performance.now();
    let totalBytesDownloaded = 0;
    let testRunning = true;
    let connections = 1; // Start with 1 connection, scale up
    let measurements: Array<{ time: number; bytes: number; speed: number }> = [];
    
    setRealTimeSpeed(prev => ({ ...prev, downloadSpeed: 0, showSpeed: true }));
    
    // CORS-friendly endpoints that support high-speed testing
    const testEndpoints = [
      // Generated data endpoints that support large downloads
      'https://httpbin.org/bytes/10485760', // 10MB
      'https://httpbin.org/bytes/5242880',  // 5MB  
      'https://httpbin.org/bytes/20971520', // 20MB
      // Alternative services
      'https://httpbingo.org/bytes/10485760', // 10MB
      'https://httpbingo.org/bytes/15728640', // 15MB
    ];
    
    // Measurement tracking
    let lastMeasureTime = startTime;
    let lastMeasureBytes = 0;
    let stableSpeedCount = 0;
    let lastSpeed = 0;
    
    const updateProgress = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const progress = Math.min((elapsed / testConfig.minTestDuration) * 100, 100);
      setProgress(prev => ({ ...prev, download: progress }));
    };
    
    const measureSpeed = () => {
      const now = performance.now();
      const timeDiff = (now - lastMeasureTime) / 1000;
      const bytesDiff = totalBytesDownloaded - lastMeasureBytes;
      
      if (timeDiff >= testConfig.measurementInterval) {
        const speedMbps = (bytesDiff * 8) / (timeDiff * 1000000);
        const elapsed = (now - startTime) / 1000;
        
        // Exclude ramp-up period
        if (elapsed > testConfig.rampUpExcludeTime) {
          measurements.push({ time: elapsed, bytes: totalBytesDownloaded, speed: speedMbps });
          
          // Check for stability (consecutive similar speeds)
          if (Math.abs(speedMbps - lastSpeed) < lastSpeed * 0.1) {
            stableSpeedCount++;
          } else {
            stableSpeedCount = 0;
          }
          
          lastSpeed = speedMbps;
        }
        
        setRealTimeSpeed(prev => ({ 
          ...prev, 
          downloadSpeed: Math.round(speedMbps * 100) / 100 
        }));
        
        lastMeasureTime = now;
        lastMeasureBytes = totalBytesDownloaded;
      }
    };
    
    // Dynamic connection scaling based on detected speed
    const scaleConnections = () => {
      const currentSpeedMbps = measurements.length > 0 ? 
        measurements[measurements.length - 1].speed : 0;
      
      if (currentSpeedMbps > 50 && connections < 3) {
        connections = 3; // Scale to 3 connections for moderate speed
      } else if (currentSpeedMbps > 100 && connections < 4) {
        connections = 4; // Scale to 4 connections for high-speed
      } else if (currentSpeedMbps > 200 && connections < 6) {
        connections = 6; // Scale to 6 for very high-speed
      }
    };
    
    // Download worker function
    const downloadWorker = async (workerId: number): Promise<number> => {
      let workerBytes = 0;
      let requestCount = 0;
      
      while (testRunning) {
        try {
          const endpointIndex = (workerId + requestCount) % testEndpoints.length;
          const endpoint = testEndpoints[endpointIndex];
          
          // Add cache busting and worker identification
          const testUrl = `${endpoint}?t=${Date.now()}&w=${workerId}&r=${requestCount}`;
          
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 12000);
          
          const response = await fetch(testUrl, {
            signal: controller.signal,
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
          
          clearTimeout(timeout);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
          }
          
          const reader = response.body?.getReader();
          if (!reader) throw new Error('No reader available');
          
          while (testRunning) {
            const { done, value } = await reader.read();
            if (done) break;
            
            workerBytes += value.length;
            totalBytesDownloaded += value.length;
            
            measureSpeed();
            updateProgress();
            
            // Check for test completion
            const elapsed = (performance.now() - startTime) / 1000;
            if (elapsed > testConfig.maxTestDuration) {
              testRunning = false;
              break;
            }
            
            // Check for stability-based completion
            if (elapsed > testConfig.minTestDuration && 
                stableSpeedCount >= testConfig.stabilityWindow / testConfig.measurementInterval) {
              testRunning = false;
              break;
            }
          }
          
          reader.releaseLock();
          requestCount++;
          
          // Scale connections dynamically
          scaleConnections();
          
        } catch (e) {
          console.warn(`Download worker ${workerId} error:`, e);
          requestCount++;
          
          if (requestCount > 3) break; // Stop after too many failures
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return workerBytes;
    };
    
    // Start initial worker
    const workers = [downloadWorker(0)];
    
    // Add more workers dynamically
    const connectionScaler = setInterval(() => {
      if (workers.length < connections && testRunning) {
        workers.push(downloadWorker(workers.length));
      }
    }, 3000); // Slower scaling for stability
    
    // Run test
    setTimeout(() => {
      testRunning = false;
      clearInterval(connectionScaler);
    }, testConfig.maxTestDuration * 1000);
    
    await Promise.all(workers);
    clearInterval(connectionScaler);
    
    setRealTimeSpeed(prev => ({ ...prev, showSpeed: false }));
    
    // Calculate final speed from stable measurements (exclude ramp-up)
    const stableMeasurements = measurements.filter(m => 
      m.time > testConfig.rampUpExcludeTime && m.speed > 0
    );
    
    if (stableMeasurements.length === 0) {
      console.warn('No stable measurements found');
      return 0;
    }
    
    // Use median of stable measurements for final result
    const speeds = stableMeasurements.map(m => m.speed).sort((a, b) => a - b);
    const medianSpeed = speeds[Math.floor(speeds.length / 2)];
    
    console.log(`Download test complete: ${medianSpeed} Mbps from ${stableMeasurements.length} measurements`);
    return Math.round(medianSpeed * 100) / 100;
  };

  // Professional Upload Speed Test - Browser-Compatible Version
  const testUploadSpeed = async (): Promise<number> => {
    console.log('Starting professional upload test...');
    
    const startTime = performance.now();
    let totalBytesUploaded = 0;
    let testRunning = true;
    let measurements: Array<{ time: number; bytes: number; speed: number }> = [];
    
    setRealTimeSpeed(prev => ({ ...prev, uploadSpeed: 0, showSpeed: true }));
    
    // CORS-friendly upload endpoints
    const uploadEndpoints = [
      'https://httpbin.org/post',
    ];
    
    let lastMeasureTime = startTime;
    let lastMeasureBytes = 0;
    
    const measureSpeed = () => {
      const now = performance.now();
      const timeDiff = (now - lastMeasureTime) / 1000;
      const bytesDiff = totalBytesUploaded - lastMeasureBytes;
      
      if (timeDiff >= testConfig.measurementInterval) {
        const speedMbps = (bytesDiff * 8) / (timeDiff * 1000000);
        const elapsed = (now - startTime) / 1000;
        
        // Exclude ramp-up period
        if (elapsed > testConfig.rampUpExcludeTime) {
          measurements.push({ time: elapsed, bytes: totalBytesUploaded, speed: speedMbps });
        }
        
        setRealTimeSpeed(prev => ({ 
          ...prev, 
          uploadSpeed: Math.round(speedMbps * 100) / 100 
        }));
        
        lastMeasureTime = now;
        lastMeasureBytes = totalBytesUploaded;
      }
    };
    
    const uploadWorker = async (workerId: number): Promise<number> => {
      let workerBytes = 0;
      let requestCount = 0;
      
      while (testRunning) {
        try {
          // Create test data (1MB chunks for upload)
          const chunkSize = 1024 * 1024; // 1MB chunks
          const testData = new ArrayBuffer(chunkSize);
          const view = new Uint8Array(testData);
          
          // Fill with pattern data
          for (let i = 0; i < view.length; i++) {
            view[i] = (i * 13 + workerId + requestCount) % 256;
          }
          
          const endpoint = uploadEndpoints[0]; // Use only httpbin.org for now
          
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);
          
          const uploadStart = performance.now();
          
          const response = await fetch(endpoint, {
            method: 'POST',
            body: testData,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/octet-stream',
              'Cache-Control': 'no-cache'
            }
          });
          
          clearTimeout(timeout);
          
          if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
          
          await response.text(); // Ensure complete
          
          const uploadDuration = (performance.now() - uploadStart) / 1000;
          
          if (uploadDuration > 0.1) { // Valid timing
            workerBytes += testData.byteLength;
            totalBytesUploaded += testData.byteLength;
            
            measureSpeed();
          }
          
          const elapsed = (performance.now() - startTime) / 1000;
          const progress = Math.min((elapsed / testConfig.minTestDuration) * 100, 100);
          setProgress(prev => ({ ...prev, upload: progress }));
          
          if (elapsed > testConfig.maxTestDuration) {
            testRunning = false;
            break;
          }
          
          requestCount++;
          
          // Small delay between uploads
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (e) {
          console.warn(`Upload worker ${workerId} error:`, e);
          requestCount++;
          
          if (requestCount > 5) break;
          
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
      
      return workerBytes;
    };
    
    // Start 2 upload workers (limited to avoid overwhelming servers)
    const workers = [
      uploadWorker(0),
      uploadWorker(1)
    ];
    
    setTimeout(() => {
      testRunning = false;
    }, testConfig.minTestDuration * 1000);
    
    await Promise.all(workers);
    
    setRealTimeSpeed(prev => ({ ...prev, showSpeed: false }));
    
    // Calculate final speed from stable measurements
    const stableMeasurements = measurements.filter(m => 
      m.time > testConfig.rampUpExcludeTime && m.speed > 0
    );
    
    if (stableMeasurements.length === 0) {
      console.warn('No stable upload measurements found');
      return 0;
    }
    
    const speeds = stableMeasurements.map(m => m.speed).sort((a, b) => a - b);
    const medianSpeed = speeds[Math.floor(speeds.length / 2)];
    
    console.log(`Upload test complete: ${medianSpeed} Mbps from ${stableMeasurements.length} measurements`);
    return Math.round(medianSpeed * 100) / 100;
  };

  // Main speed test function
  const runSpeedTest = async () => {
    setTestStatus('testing');
    setError(null);
    setProgress({ download: 0, upload: 0, ping: 0 });
    setRealTimeSpeed({ downloadSpeed: 0, uploadSpeed: 0, showSpeed: false });
    
    const testStartTime = performance.now();
    
    try {
      console.log('Starting professional speed test...');
      
      // Step 1: Ping Test
      setCurrentTest('ping');
      const { ping, jitter } = await testPing();
      console.log(`Ping test completed: ${ping}ms`);
      
      // Step 2: Download Test
      setCurrentTest('download');
      const downloadSpeed = await testDownloadSpeed();
      console.log(`Download test completed: ${downloadSpeed} Mbps`);
      
      // Step 3: Upload Test
      setCurrentTest('upload');
      const uploadSpeed = await testUploadSpeed();
      console.log(`Upload test completed: ${uploadSpeed} Mbps`);
      
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

  // Get speed category and color - Updated for high-speed connections
  const getSpeedCategory = (speed: number, type: 'download' | 'upload') => {
    const thresholds = type === 'download' 
      ? { 
          gigabit: 800,     // Near-Gigabit speeds
          excellent: 300,   // Very fast
          good: 100,        // Fast
          fair: 50,         // Decent
          poor: 25          // Slow
        }
      : {
          gigabit: 400,     // Very high upload
          excellent: 100,   // High upload
          good: 50,         // Good upload
          fair: 25,         // Decent upload
          poor: 10          // Slow upload
        };

    if (speed >= thresholds.gigabit) {
      return { category: 'Gigabit+', color: 'text-purple-700', bg: 'bg-purple-100' };
    } else if (speed >= thresholds.excellent) {
      return { category: 'Excellent', color: 'text-green-700', bg: 'bg-green-100' };
    } else if (speed >= thresholds.good) {
      return { category: 'Good', color: 'text-blue-700', bg: 'bg-blue-100' };
    } else if (speed >= thresholds.fair) {
      return { category: 'Fair', color: 'text-yellow-700', bg: 'bg-yellow-100' };
    } else if (speed >= thresholds.poor) {
      return { category: 'Poor', color: 'text-orange-700', bg: 'bg-orange-100' };
    } else {
      return { category: 'Very Poor', color: 'text-red-700', bg: 'bg-red-100' };
    }
  };

  const getPingCategory = (ping: number) => {
    if (ping <= 20) return { category: 'Excellent', color: 'text-green-700', bg: 'bg-green-100' };
    if (ping <= 50) return { category: 'Good', color: 'text-blue-700', bg: 'bg-blue-100' };
    if (ping <= 100) return { category: 'Fair', color: 'text-yellow-700', bg: 'bg-yellow-100' };
    if (ping <= 200) return { category: 'Poor', color: 'text-orange-700', bg: 'bg-orange-100' };
    return { category: 'Very Poor', color: 'text-red-700', bg: 'bg-red-100' };
  };

  const getRecommendations = (results: SpeedTestResults) => {
    const { downloadSpeed, uploadSpeed, ping } = results;
    const recommendations = [];

    if (downloadSpeed < 25) {
      recommendations.push('Consider upgrading your internet plan for better streaming quality');
    }
    if (uploadSpeed < 10) {
      recommendations.push('Low upload speed may affect video calls and file uploads');
    }
    if (ping > 100) {
      recommendations.push('High latency detected - may impact gaming and video conferencing');
    }
    if (downloadSpeed >= 800) {
      recommendations.push('Excellent speeds detected! Your connection can handle any online activity');
    }

    return recommendations;
  };

  if (!isClient) {
    return (
      <div className="max-w-7xl mx-auto text-center py-20">
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
        Professional Speed Test
      </h2>

      {/* Info Box */}
      <SpeedTestInfoBox />

      {/* Test Control */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
        {testStatus === 'idle' && (
          <div>
            <p className="text-gray-600 mb-4">
              Professional-grade speed test using industry-standard techniques.
            </p>
            <button
              onClick={runSpeedTest}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center mx-auto"
            >
              <FiPlay className="w-5 h-5 mr-2" />
              Start Professional Test
            </button>
          </div>
        )}
        
        {testStatus === 'testing' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Running Professional Test... ({currentTest}) - {testConfig.minTestDuration}-{testConfig.maxTestDuration}s per test
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
                    <span>
                      {realTimeSpeed.showSpeed && currentTest === 'download' && realTimeSpeed.downloadSpeed > 0 
                        ? `${realTimeSpeed.downloadSpeed} Mbps` 
                        : `${Math.round(progress.download)}%`}
                    </span>
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
                    <span>
                      {realTimeSpeed.showSpeed && currentTest === 'upload' && realTimeSpeed.uploadSpeed > 0 
                        ? `${realTimeSpeed.uploadSpeed} Mbps` 
                        : `${Math.round(progress.upload)}%`}
                    </span>
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
                    <span>Gigabit (1000 Mbps):</span>
                    <span className="text-purple-500">1000 Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span>8K Streaming Minimum:</span>
                    <span className="text-gray-500">200 Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span>4K Streaming Minimum:</span>
                    <span className="text-gray-500">100 Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HD Streaming Minimum:</span>
                    <span className="text-gray-500">25 Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Global Average:</span>
                    <span className="text-gray-500">~50 Mbps</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Test Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Test Duration:</span>
                    <span>{results.testDuration}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Test Time:</span>
                    <span>{results.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connection Stability:</span>
                    <span className={results.jitter < 10 ? 'text-green-600' : results.jitter < 30 ? 'text-yellow-600' : 'text-red-600'}>
                      {results.jitter < 10 ? 'Excellent' : results.jitter < 30 ? 'Good' : 'Poor'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-700 mb-2">Recommendations</h4>
              <div className="space-y-2">
                {getRecommendations(results).map((recommendation, index) => (
                  <div key={index} className="flex items-start">
                    <FiInfo className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternetSpeedTest; 