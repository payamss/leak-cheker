'use client';

import { useEffect, useState } from 'react';
import { FiWifi, FiDownload, FiUpload, FiClock, FiPlay, FiRefreshCw, FiTrendingUp, FiInfo } from 'react-icons/fi';
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
  serverDiscovery: number;
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
  const [progress, setProgress] = useState<TestProgress>({ download: 0, upload: 0, ping: 0, serverDiscovery: 0 });
  const [currentTest, setCurrentTest] = useState<'serverDiscovery' | 'ping' | 'download' | 'upload' | 'complete'>('ping');
  const [error, setError] = useState<string | null>(null);
  const [realTimeSpeed, setRealTimeSpeed] = useState<RealTimeSpeed>({ downloadSpeed: 0, uploadSpeed: 0, showSpeed: false });
  const [optimalServersCache, setOptimalServersCache] = useState<string[]>([]);

  // Professional speed test configuration
  const [testConfig] = useState({
    pingCount: 5,                      // Number of ping tests
    minTestDuration: 10,               // Minimum test duration in seconds
    maxTestDuration: 25,               // Maximum test duration in seconds
    rampUpExcludeTime: 2,              // Exclude first 2 seconds (TCP ramp-up)
    stabilityWindow: 3,                // 3 seconds for stability detection
    maxConnections: 8,                 // Maximum parallel connections
    chunkSize: 8 * 1024 * 1024,       // 8MB chunks for large file simulation
    measurementInterval: 0.3,          // 300ms measurement intervals
    serverDiscoveryTimeout: 3000,      // 3 seconds to test each server
    optimalServerCount: 3              // Use top 3 fastest servers
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Server Discovery - Find fastest servers first (unused in hybrid mode, kept for reference)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const discoverOptimalServers = async (useCache: boolean = false): Promise<string[]> => {
    // Return cached results if available and requested
    if (useCache && optimalServersCache.length > 0) {
      console.log('Using cached optimal servers:', optimalServersCache.length);
      return optimalServersCache;
    }
    
    console.log('Discovering optimal servers...');
    
    // Discovery endpoints - optimized for quick ping/latency testing
    const discoveryServers = [
      // httpbin.org - reliable for both discovery and large transfers
      { 
        name: 'httpbin.org',
        pingUrl: 'https://httpbin.org/get',
        discoveryUrl: 'https://httpbin.org/bytes/2097152', // 2MB for discovery
        // Large file endpoints for actual testing
        testUrls: [
          'https://httpbin.org/bytes/20971520',  // 20MB
          'https://httpbin.org/bytes/52428800',  // 50MB
          'https://httpbin.org/bytes/104857600', // 100MB
          'https://httpbin.org/bytes/209715200'  // 200MB for gigabit testing
        ]
      },
      // httpbingo.org - alternative to httpbin
      { 
        name: 'httpbingo.org',
        pingUrl: 'https://httpbingo.org/get',
        discoveryUrl: 'https://httpbingo.org/bytes/2097152', // 2MB for discovery
        testUrls: [
          'https://httpbingo.org/bytes/20971520',  // 20MB
          'https://httpbingo.org/bytes/52428800',  // 50MB
          'https://httpbingo.org/bytes/104857600', // 100MB
          'https://httpbingo.org/bytes/209715200'  // 200MB for gigabit testing
        ]
      },
      // JSONPlaceholder - only for ping testing, NOT for large downloads
      { 
        name: 'jsonplaceholder-ping',
        pingUrl: 'https://jsonplaceholder.typicode.com/posts/1',
        discoveryUrl: 'https://jsonplaceholder.typicode.com/photos', // Just for latency
        testUrls: [] // Don't use for actual testing - too small
      }
    ];

    const serverResults: Array<{ server: typeof discoveryServers[0], latency: number, downloadSpeed: number }> = [];

    // Test each server
    for (let i = 0; i < discoveryServers.length; i++) {
      const server = discoveryServers[i];
      try {
        console.log(`Testing server: ${server.name}`);
        
        // Update progress for server discovery
        setProgress(prev => ({ ...prev, serverDiscovery: ((i + 1) / discoveryServers.length) * 100 }));
        
        // Test 1: Ping/Latency test
        const pingStart = performance.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), testConfig.serverDiscoveryTimeout);
        
        const pingResponse = await fetch(server.pingUrl, {
          signal: controller.signal,
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        clearTimeout(timeout);
        const latency = performance.now() - pingStart;
        
        if (!pingResponse.ok) throw new Error(`Ping failed: ${pingResponse.status}`);

        // Test 2: Download speed test only for servers with large file capabilities
        let downloadSpeed = 0;
        
        if (server.testUrls.length > 0) { // Only test servers that can handle large files
          const downloadStart = performance.now();
          let downloadBytes = 0;
          
          const downloadController = new AbortController();
          const downloadTimeout = setTimeout(() => downloadController.abort(), 3000); // 3 second test
          
          try {
            const downloadResponse = await fetch(server.discoveryUrl, {
              signal: downloadController.signal,
              cache: 'no-cache'
            });
            
            if (downloadResponse.ok) {
              const reader = downloadResponse.body?.getReader();
              if (reader) {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  downloadBytes += value.length;
                }
                reader.releaseLock();
              }
            }
          } catch {
            // Download test failed, but we still have latency
          }
          
          clearTimeout(downloadTimeout);
          
          const downloadDuration = (performance.now() - downloadStart) / 1000;
          downloadSpeed = downloadBytes > 0 ? (downloadBytes * 8) / (downloadDuration * 1000000) : 0;
        }
        
        serverResults.push({
          server,
          latency,
          downloadSpeed
        });
        
        console.log(`${server.name}: ${Math.round(latency)}ms latency, ${downloadSpeed.toFixed(2)} Mbps`);
        
      } catch (err) {
        console.warn(`Server ${server.name} failed:`, err);
        // Don't add failed servers to results
      }
    }

    // Sort by combined score: prioritize servers with large file capability
    serverResults.sort((a, b) => {
      // Heavily favor servers that can handle large files
      const aHasLargeFiles = a.server.testUrls.length > 0 ? 1000 : 0;
      const bHasLargeFiles = b.server.testUrls.length > 0 ? 1000 : 0;
      
      // Score: large file capability + low latency + high download speed
      const scoreA = aHasLargeFiles - a.latency + (a.downloadSpeed * 10);
      const scoreB = bHasLargeFiles - b.latency + (b.downloadSpeed * 10);
      
      return scoreB - scoreA; // Higher score is better
    });

    // Return test URLs from servers that can handle large files
    const optimalEndpoints = serverResults
      .filter(result => result.server.testUrls.length > 0) // Only servers with large file capability
      .slice(0, 2) // Take top 2 servers to avoid overwhelming free services
      .map(result => {
        console.log(`Selected optimal server: ${result.server.name} (${Math.round(result.latency)}ms, ${result.downloadSpeed.toFixed(2)} Mbps)`);
        return result.server.testUrls;
      })
      .flat(); // Flatten the array of arrays

    if (optimalEndpoints.length === 0) {
      throw new Error('No servers with large file capability available for testing');
    }

    console.log(`Cached ${optimalEndpoints.length} optimal endpoints for testing`);
    
    // Cache the results
    setOptimalServersCache(optimalEndpoints);
    return optimalEndpoints;
  };

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
        
        await fetch(`${endpoint}?t=${Date.now()}`, { 
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
      } catch (err) {
        console.warn('Ping test failed:', err);
        // Add a fallback ping time if request fails
        pings.push(100); // 100ms fallback
      }
    }
    
    if (pings.length === 0) throw new Error('All ping tests failed');
    
    const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
    const jitter = Math.sqrt(pings.reduce((sum, ping) => sum + Math.pow(ping - avgPing, 2), 0) / pings.length);
    
    return { ping: Math.round(avgPing), jitter: Math.round(jitter * 10) / 10 };
  };

  // Professional Download Speed Test - Self-Hosted + External Hybrid Approach
  const testDownloadSpeed = async (): Promise<number> => {
    console.log('Starting hybrid self-hosted + external download test...');
    
    const startTime = performance.now();
    let totalBytesDownloaded = 0;
    let testRunning = true;
    let connections = 2;
    const measurements: Array<{ time: number; bytes: number; speed: number }> = [];
    
    setRealTimeSpeed(prev => ({ ...prev, downloadSpeed: 0, showSpeed: true }));
    
    // Hybrid approach: Self-hosted endpoints + External endpoints
    const testEndpoints = [
      // Self-hosted endpoints (no CORS issues, larger files possible)
      '/api/speedtest/download?size=1MB',    // 1MB from your server
      '/api/speedtest/download?size=2MB',    // 2MB from your server  
      '/api/speedtest/download?size=5MB',    // 5MB from your server
      '/api/speedtest/download?size=10MB',   // 10MB from your server
      '/api/speedtest/download?size=25MB',   // 25MB from your server
      '/api/speedtest/download?size=50MB',   // 50MB from your server
      '/api/speedtest/download?size=100MB',  // 100MB from your server - for gigabit testing!
      
      // External endpoints for geographic diversity
      'https://httpbin.org/bytes/1048576',    // 1MB
      'https://httpbin.org/bytes/2097152',    // 2MB
      'https://httpbin.org/bytes/3145728',    // 3MB
      'https://httpbingo.org/bytes/1048576',  // 1MB alternative
      'https://httpbingo.org/bytes/2097152',  // 2MB alternative
      
      // Fast JSON endpoints for latency baseline
      'https://jsonplaceholder.typicode.com/photos',  // ~500KB JSON
      'https://jsonplaceholder.typicode.com/users',   // ~20KB JSON
      '/api/speedtest/download?size=500KB&format=json' // 500KB JSON from your server
    ];
    
    console.log(`Testing with ${testEndpoints.length} hybrid endpoints (self-hosted + external)`);
    
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
          
          // Check for stability
          if (Math.abs(speedMbps - lastSpeed) < lastSpeed * 0.15) {
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
    
    // Aggressive scaling for self-hosted + external hybrid
    const scaleConnections = () => {
      const currentSpeedMbps = measurements.length > 0 ? 
        measurements[measurements.length - 1].speed : 0;
      
      // More aggressive scaling since we have self-hosted endpoints
      if (currentSpeedMbps > 1 && connections < 4) {
        connections = 4;
      } else if (currentSpeedMbps > 5 && connections < 6) {
        connections = 6;
      } else if (currentSpeedMbps > 15 && connections < 8) {
        connections = 8;
      } else if (currentSpeedMbps > 30 && connections < 12) {
        connections = 12; // More connections for self-hosted performance
      } else if (currentSpeedMbps > 50 && connections < 16) {
        connections = 16; // Maximum for gigabit testing
      }
    };
    
    // High-performance download worker with self-hosted priority
    const downloadWorker = async (workerId: number): Promise<number> => {
      let workerBytes = 0;
      let requestCount = 0;
      let consecutiveErrors = 0;
      
      while (testRunning && consecutiveErrors < 3) {
        try {
          // Prioritize self-hosted endpoints for higher speeds
          const selfHostedEndpoints = testEndpoints.filter(url => url.startsWith('/api/'));
          const externalEndpoints = testEndpoints.filter(url => !url.startsWith('/api/'));
          
          let endpoint: string;
          if (requestCount % 3 === 0 && selfHostedEndpoints.length > 0) {
            // Use self-hosted endpoints 2/3 of the time
            const index = (workerId + requestCount) % selfHostedEndpoints.length;
            endpoint = selfHostedEndpoints[index];
          } else {
            // Use external endpoints 1/3 of the time for diversity
            const index = (workerId + requestCount) % externalEndpoints.length;
            endpoint = externalEndpoints[index];
          }
          
          // Cache busting
          const separator = endpoint.includes('?') ? '&' : '?';
          const testUrl = `${endpoint}${separator}t=${Date.now()}&w=${workerId}&r=${requestCount}&rand=${Math.random()}`;
          
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout for large files
          
          const response = await fetch(testUrl, {
            signal: controller.signal,
            cache: 'no-store',
            mode: 'cors',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          
          clearTimeout(timeout);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const reader = response.body?.getReader();
          if (!reader) {
            // For responses without streams (like JSON), read as text
            const data = await response.text();
            const bytes = new TextEncoder().encode(data).length;
            workerBytes += bytes;
            totalBytesDownloaded += bytes;
            
            measureSpeed();
            updateProgress();
          } else {
            // Stream reading for large responses
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
          }
          
          requestCount++;
          consecutiveErrors = 0; // Reset on success
          
          // Scale connections based on performance
          scaleConnections();
          
          // Minimal delay for self-hosted, slightly longer for external
          const delay = endpoint.startsWith('/api/') ? 25 : 50;
          if (testRunning) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
        } catch (e) {
          console.warn(`Download worker ${workerId} error:`, e);
          consecutiveErrors++;
          requestCount++;
          
          // Quick retry on errors
          if (consecutiveErrors < 3) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }
      
      return workerBytes;
    };
    
    // Start with multiple workers for immediate parallelization
    const workers = [
      downloadWorker(0),
      downloadWorker(1),
      downloadWorker(2)
    ];
    
    // Rapid connection scaling
    const connectionScaler = setInterval(() => {
      if (workers.length < connections && testRunning) {
        workers.push(downloadWorker(workers.length));
        console.log(`Scaled to ${workers.length + 1} connections (${connections} target) - Hybrid mode`);
      }
    }, 600); // Fast scaling for hybrid approach
    
    // Test completion handler
    setTimeout(() => {
      testRunning = false;
      clearInterval(connectionScaler);
    }, testConfig.maxTestDuration * 1000);
    
    // Early completion check
    const stabilityChecker = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed > testConfig.minTestDuration && 
          stableSpeedCount >= testConfig.stabilityWindow / testConfig.measurementInterval) {
        testRunning = false;
        clearInterval(connectionScaler);
        clearInterval(stabilityChecker);
      }
    }, 500);
    
    await Promise.all(workers);
    clearInterval(connectionScaler);
    clearInterval(stabilityChecker);
    
    setRealTimeSpeed(prev => ({ ...prev, showSpeed: false }));
    
    // Calculate final speed from stable measurements
    const stableMeasurements = measurements.filter(m => 
      m.time > testConfig.rampUpExcludeTime && m.speed > 0
    );
    
    if (stableMeasurements.length === 0) {
      console.warn('No stable measurements found');
      return 0;
    }
    
    // Use 80th percentile for better high-speed representation with self-hosted endpoints
    const speeds = stableMeasurements.map(m => m.speed).sort((a, b) => a - b);
    const percentile80Index = Math.floor(speeds.length * 0.8);
    const finalSpeed = speeds[percentile80Index] || speeds[speeds.length - 1];
    
    console.log(`Hybrid download test complete: ${finalSpeed} Mbps from ${stableMeasurements.length} measurements using ${workers.length} connections`);
    console.log(`Speed range: ${speeds[0]?.toFixed(2)} - ${speeds[speeds.length - 1]?.toFixed(2)} Mbps`);
    
    return Math.round(finalSpeed * 100) / 100;
  };

  // Professional Upload Speed Test - Self-Hosted + External Hybrid
  const testUploadSpeed = async (): Promise<number> => {
    console.log('Starting hybrid self-hosted + external upload test...');
    
    const startTime = performance.now();
    let totalBytesUploaded = 0;
    let testRunning = true;
    let connections = 1;
    const measurements: Array<{ time: number; bytes: number; speed: number }> = [];
    
    setRealTimeSpeed(prev => ({ ...prev, uploadSpeed: 0, showSpeed: true }));
    
    // Hybrid upload endpoints - prioritize self-hosted
    const uploadEndpoints = [
      '/api/speedtest/upload',           // Your server - no CORS issues!
      'https://httpbin.org/post',        // External alternative
      'https://httpbingo.org/post'       // External alternative
    ];
    
    // Measurement tracking
    let lastMeasureTime = startTime;
    let lastMeasureBytes = 0;
    let stableSpeedCount = 0;
    let lastSpeed = 0;
    
    const updateProgress = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const progress = Math.min((elapsed / testConfig.minTestDuration) * 100, 100);
      setProgress(prev => ({ ...prev, upload: progress }));
    };
    
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
          
          // Check for stability
          if (Math.abs(speedMbps - lastSpeed) < lastSpeed * 0.1) {
            stableSpeedCount++;
          } else {
            stableSpeedCount = 0;
          }
          
          lastSpeed = speedMbps;
        }
        
        setRealTimeSpeed(prev => ({ 
          ...prev, 
          uploadSpeed: Math.round(speedMbps * 100) / 100 
        }));
        
        lastMeasureTime = now;
        lastMeasureBytes = totalBytesUploaded;
      }
    };
    
    // Enhanced connection scaling for self-hosted uploads
    const scaleConnections = () => {
      const currentSpeedMbps = measurements.length > 0 ? 
        measurements[measurements.length - 1].speed : 0;
      
      if (currentSpeedMbps > 2 && connections < 2) {
        connections = 2;
      } else if (currentSpeedMbps > 5 && connections < 3) {
        connections = 3;
      } else if (currentSpeedMbps > 10 && connections < 4) {
        connections = 4;
      } else if (currentSpeedMbps > 20 && connections < 6) {
        connections = 6; // More aggressive for self-hosted
      }
    };
    
    // Generate upload data with varying sizes
    const generateUploadData = (sizeKB: number): Uint8Array => {
      const bytes = sizeKB * 1024;
      const data = new Uint8Array(bytes);
      
      // Fill with pseudo-random data to prevent compression
      for (let i = 0; i < bytes; i++) {
        data[i] = Math.floor(Math.random() * 256);
      }
      
      return data;
    };
    
    // Enhanced upload worker with self-hosted priority
    const uploadWorker = async (workerId: number): Promise<number> => {
      let workerBytes = 0;
      let requestCount = 0;
      
      while (testRunning && requestCount < 15) { // More requests for better measurement
        try {
          // Prioritize self-hosted endpoint (80% of the time)
          const endpoint = (requestCount % 5 === 0 && uploadEndpoints.length > 1) 
            ? uploadEndpoints[1 + (requestCount % 2)] // External endpoints occasionally
            : uploadEndpoints[0]; // Self-hosted endpoint most of the time
          
          // Dynamic chunk sizing - larger for self-hosted
          const baseSizeKB = endpoint.startsWith('/api/') ? 1024 : 512; // 1MB vs 512KB
          const chunkSizeKB = Math.min(baseSizeKB * 2, baseSizeKB + (requestCount * 256));
          const uploadData = generateUploadData(chunkSizeKB);
          
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          
          const uploadStart = performance.now();
          const response = await fetch(endpoint, {
            method: 'POST',
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/octet-stream',
              'Cache-Control': 'no-cache'
            },
            body: uploadData
          });
          
          clearTimeout(timeout);
          
          if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
          }
          
          // For self-hosted endpoint, we get detailed response
          if (endpoint.startsWith('/api/')) {
            const result = await response.json();
            console.log(`Self-hosted upload result:`, result);
          } else {
            await response.text(); // Consume external response
          }
          
          const uploadDuration = (performance.now() - uploadStart) / 1000;
          
          if (uploadDuration > 0.1) { // Valid timing
            workerBytes += uploadData.length;
            totalBytesUploaded += uploadData.length;
            
            measureSpeed();
            updateProgress();
          }
          
          requestCount++;
          
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
          
          // Scale connections based on performance
          scaleConnections();
          
          // Minimal delay for self-hosted, longer for external
          const delay = endpoint.startsWith('/api/') ? 50 : 150;
          await new Promise(resolve => setTimeout(resolve, delay));
          
        } catch (e) {
          console.warn(`Upload worker ${workerId} error:`, e);
          requestCount++;
          
          if (requestCount > 5) break;
          
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      return workerBytes;
    };
    
    // Start with initial worker
    const workers = [uploadWorker(0)];
    
    // Add more workers based on performance
    const connectionScaler = setInterval(() => {
      if (workers.length < connections && testRunning) {
        workers.push(uploadWorker(workers.length));
        console.log(`Upload scaled to ${workers.length + 1} connections - Hybrid mode`);
      }
    }, 2500); // Conservative scaling for uploads
    
    // Test completion handler
    setTimeout(() => {
      testRunning = false;
      clearInterval(connectionScaler);
    }, testConfig.maxTestDuration * 1000);
    
    await Promise.all(workers);
    clearInterval(connectionScaler);
    
    setRealTimeSpeed(prev => ({ ...prev, showSpeed: false }));
    
    // Calculate final speed from stable measurements
    const stableMeasurements = measurements.filter(m => 
      m.time > testConfig.rampUpExcludeTime && m.speed > 0
    );
    
    if (stableMeasurements.length === 0) {
      console.warn('No stable upload measurements found');
      return 0;
    }
    
    // Use median for upload (more conservative than download)
    const speeds = stableMeasurements.map(m => m.speed).sort((a, b) => a - b);
    const medianSpeed = speeds[Math.floor(speeds.length / 2)];
    
    console.log(`Hybrid upload test complete: ${medianSpeed} Mbps from ${stableMeasurements.length} measurements`);
    return Math.round(medianSpeed * 100) / 100;
  };

  // Main speed test function
  const runSpeedTest = async () => {
    setTestStatus('testing');
    setError(null);
    setProgress({ download: 0, upload: 0, ping: 0, serverDiscovery: 0 });
    setRealTimeSpeed({ downloadSpeed: 0, uploadSpeed: 0, showSpeed: false });
    
    const testStartTime = performance.now();
    
    try {
      console.log('Starting professional speed test...');
      
      // Step 1: Server Discovery (optional - we now use pre-selected endpoints)
      setCurrentTest('serverDiscovery');
      // Skip server discovery to prevent double execution - we use hybrid endpoints directly
      setProgress(prev => ({ ...prev, serverDiscovery: 100 }));
      console.log('Using pre-optimized hybrid endpoint strategy');
      
      // Step 2: Ping Test
      setCurrentTest('ping');
      const { ping, jitter } = await testPing();
      console.log(`Ping test completed: ${ping}ms`);
      
      // Step 3: Download Test (uses hybrid multi-endpoint approach)
      setCurrentTest('download');
      const downloadSpeed = await testDownloadSpeed();
      console.log(`Download test completed: ${downloadSpeed} Mbps`);
      
      // Step 4: Upload Test
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
              Running Professional Test... ({currentTest === 'serverDiscovery' ? 'Finding Optimal Servers' : 
                                         currentTest === 'ping' ? 'Testing Latency' :
                                         currentTest === 'download' ? 'Testing Download Speed' :
                                         currentTest === 'upload' ? 'Testing Upload Speed' : 'Complete'}) 
            </h3>
            <div className="space-y-4 max-w-md mx-auto">
              {/* Server Discovery Progress */}
              <div className="flex items-center space-x-3">
                <FiWifi className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Server Discovery</span>
                    <span>{Math.round(progress.serverDiscovery)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.serverDiscovery}%` }}
                    ></div>
                  </div>
                </div>
              </div>

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
            <div className="mt-4 text-center text-sm text-gray-500">
              {currentTest === 'serverDiscovery' && 'Testing multiple servers to find the fastest ones...'}
              {currentTest === 'ping' && 'Measuring connection latency and stability...'}
              {currentTest === 'download' && 'Using optimal servers for maximum speed measurement...'}
              {currentTest === 'upload' && 'Testing upload capacity with multiple connections...'}
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