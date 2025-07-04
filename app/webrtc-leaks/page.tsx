'use client';

import { useEffect, useState } from 'react';
import WebRTCLeakInfoBox from './components/WebRTCLeakInfoBox';
import { FiServer, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

type DeviceInfo = {
  kind: string;
  label: string;
  deviceId: string;
  groupId: string;
};

type DetectionState = 'detecting' | 'completed' | 'error' | 'timeout';

const WebRTCLeakTest = () => {
  const [localIPs, setLocalIPs] = useState<string[]>([]);
  const [publicIPs, setPublicIPs] = useState<string[]>([]);
  const [sdpLog, setSdpLog] = useState<string | null>(null);
  const [mediaDevices, setMediaDevices] = useState<DeviceInfo[]>([]);
  const [permissions, setPermissions] = useState({
    audio: false,
    video: false,
  });
  const [detectionState, setDetectionState] = useState<DetectionState>('detecting');
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Helper function to check if IP is private
  const isPrivateIP = (ip: string): boolean => {
    const privateRanges = [
      /^10\./,                   // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[01])\./,  // 172.16.0.0/12
      /^192\.168\./,             // 192.168.0.0/16
      /^127\./,                  // 127.0.0.0/8 (localhost)
      /^169\.254\./,             // 169.254.0.0/16 (link-local)
      /^::1$/,                   // IPv6 localhost
      /^fe80:/i,                 // IPv6 link-local
      /^fc00:/i,                 // IPv6 unique local
      /^fd00:/i,                 // IPv6 unique local
    ];
    
    return privateRanges.some(range => range.test(ip));
  };

  // Enhanced IP extraction from ICE candidates
  const extractIPFromCandidate = (candidate: string): string | null => {
    // More comprehensive regex for IPv4 and IPv6
    const ipv4Regex = /(\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b)/;
    const ipv6Regex = /([a-f0-9]{1,4}(?::[a-f0-9]{1,4}){7}|::(?:[a-f0-9]{1,4}:){0,6}[a-f0-9]{1,4}|(?:[a-f0-9]{1,4}:){1,7}:|(?:[a-f0-9]{1,4}:){1,6}:[a-f0-9]{1,4}|(?:[a-f0-9]{1,4}:){1,5}(?::[a-f0-9]{1,4}){1,2}|(?:[a-f0-9]{1,4}:){1,4}(?::[a-f0-9]{1,4}){1,3}|(?:[a-f0-9]{1,4}:){1,3}(?::[a-f0-9]{1,4}){1,4}|(?:[a-f0-9]{1,4}:){1,2}(?::[a-f0-9]{1,4}){1,5}|[a-f0-9]{1,4}:(?::[a-f0-9]{1,4}){1,6})/i;
    
    const ipv4Match = candidate.match(ipv4Regex);
    if (ipv4Match) return ipv4Match[1];
    
    const ipv6Match = candidate.match(ipv6Regex);
    if (ipv6Match) return ipv6Match[1];
    
    return null;
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const detectWebRTCIPs = async () => {
      try {
        setDetectionState('detecting');
        setDetectionError(null);
        
        const ips = new Set<string>();
        const timeouts = {
          main: null as NodeJS.Timeout | null,
          candidate: null as NodeJS.Timeout | null
        };
        
        // Multiple STUN servers for better reliability
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun.cloudflare.com:3478' },
            { urls: 'stun:stun.ekiga.net' }
          ],
          iceCandidatePoolSize: 10
        });

        let candidatesReceived = false;
        let gatheringCompleted = false;

        // Set up candidate collection with timeout
        const processCandidates = () => {
          if (gatheringCompleted) return;
          
          const detectedIPs = Array.from(ips);
          const privateIPs = detectedIPs.filter(isPrivateIP);
          const publicIPsList = detectedIPs.filter(ip => !isPrivateIP(ip));

          setLocalIPs(privateIPs);
          setPublicIPs(publicIPsList);
          setDetectionState('completed');
          gatheringCompleted = true;
          
          if (timeouts.main) clearTimeout(timeouts.main);
          if (timeouts.candidate) clearTimeout(timeouts.candidate);
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            candidatesReceived = true;
            const ip = extractIPFromCandidate(event.candidate.candidate);
            if (ip && !ip.includes('.local') && ip !== '0.0.0.0') {
              ips.add(ip);
            }
            
            // Reset the candidate timeout since we received a candidate
            if (timeouts.candidate) clearTimeout(timeouts.candidate);
            timeouts.candidate = setTimeout(() => {
              processCandidates();
            }, 2000); // Wait 2 seconds after last candidate
            
          } else {
            // ICE gathering completed
            processCandidates();
          }
        };

        pc.onicegatheringstatechange = () => {
          if (pc.iceGatheringState === 'complete') {
            processCandidates();
          }
        };

        // Create data channel and offer
        pc.createDataChannel('webrtc-test', { ordered: true });
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        
        setSdpLog(offer.sdp || 'No SDP generated');
        await pc.setLocalDescription(offer);

        // Overall timeout (10 seconds)
        timeouts.main = setTimeout(() => {
          if (!gatheringCompleted) {
            if (!candidatesReceived) {
              setDetectionError('No WebRTC candidates received. WebRTC may be blocked.');
              setDetectionState('error');
            } else {
              processCandidates();
            }
          }
          pc.close();
        }, 10000);

        // Cleanup function
        return () => {
          if (timeouts.main) clearTimeout(timeouts.main);
          if (timeouts.candidate) clearTimeout(timeouts.candidate);
          if (pc.connectionState !== 'closed') {
            pc.close();
          }
        };

      } catch (error) {
        console.error('WebRTC IP detection failed:', error);
        setDetectionError(`Detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setDetectionState('error');
      }
    };

    const fetchMediaDevices = async () => {
      try {
        // First get devices without permissions (limited info)
        const devices = await navigator.mediaDevices.enumerateDevices();
        setMediaDevices(
          devices.map((device) => ({
            kind: device.kind,
            label: device.label || `${device.kind} (Permission required for details)`,
            deviceId: device.deviceId || 'Unknown',
            groupId: device.groupId || 'Unknown',
          }))
        );
      } catch (error) {
        console.error('Failed to fetch media devices:', error);
        setMediaDevices([]);
      }
    };

    const checkPermissions = async () => {
      try {
        // Try to get media permissions
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: true 
        });
        setPermissions({ audio: true, video: true });
        
        // Get device list again with permissions
        const devices = await navigator.mediaDevices.enumerateDevices();
        setMediaDevices(
          devices.map((device) => ({
            kind: device.kind,
            label: device.label || 'Unknown Device',
            deviceId: device.deviceId,
            groupId: device.groupId,
          }))
        );
        
        // Stop tracks immediately
        stream.getTracks().forEach((track) => track.stop());
      } catch {
        // Try individual permissions
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setPermissions(prev => ({ ...prev, audio: true }));
          audioStream.getTracks().forEach(track => track.stop());
        } catch {
          setPermissions(prev => ({ ...prev, audio: false }));
        }

        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setPermissions(prev => ({ ...prev, video: true }));
          videoStream.getTracks().forEach(track => track.stop());
        } catch {
          setPermissions(prev => ({ ...prev, video: false }));
        }
      }
    };

    const cleanup = detectWebRTCIPs();
    fetchMediaDevices();
    checkPermissions();

    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => cleanupFn && cleanupFn());
      }
    };
  }, [isClient]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 py-4">
        <div className="max-w-3xl mx-auto px-2 sm:px-4">
          <h3 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-3 sm:mb-6 flex items-center">
            <FiServer className="w-6 h-6 mr-2" /> WebRTC Leak Test
          </h3>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (detectionState) {
      case 'completed':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
      case 'timeout':
        return <FiAlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (detectionState) {
      case 'completed':
        return 'Detection completed';
      case 'error':
        return 'Detection failed';
      case 'timeout':
        return 'Detection timed out';
      default:
        return 'Detecting IPs...';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-3xl mx-auto px-2 sm:px-4 space-y-3 sm:space-y-4">
        <h3 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-3 sm:mb-6 flex items-center">
          <FiServer className="w-6 h-6 mr-2" /> WebRTC Leak Test
        </h3>

        {/* Expandable Info Box */}
        <WebRTCLeakInfoBox />

        {/* Detection Status */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <div className="flex items-center space-x-2 mb-1 sm:mb-2">
            {getStatusIcon()}
            <h4 className="text-base sm:text-lg font-semibold text-gray-700">Detection Status</h4>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">{getStatusText()}</p>
          {detectionError && (
            <p className="text-xs sm:text-sm text-red-600 mt-1 sm:mt-2">Error: {detectionError}</p>
          )}
        </div>

        {/* WebRTC IPs */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">WebRTC IP Addresses</h4>
          <div className="space-y-1.5 sm:space-y-2">
            <div>
              <strong className="text-gray-800">Local/Private IPs:</strong>
              <span className="ml-2">
                {detectionState === 'detecting' ? (
                  <span className="text-blue-600">Detecting...</span>
                ) : localIPs.length > 0 ? (
                  <span className="text-green-600">{localIPs.join(', ')}</span>
                ) : (
                  <span className="text-gray-500">None detected</span>
                )}
              </span>
            </div>
            <div>
              <strong className="text-gray-800">Public IPs:</strong>
              <span className="ml-2">
                {detectionState === 'detecting' ? (
                  <span className="text-blue-600">Detecting...</span>
                ) : publicIPs.length > 0 ? (
                  <span className="text-red-600 font-semibold">{publicIPs.join(', ')} ⚠️ Leak Detected</span>
                ) : (
                  <span className="text-green-600">✅ No public IP leak detected</span>
                )}
              </span>
            </div>
          </div>
          {/* Explanation for public IPs and what counts as a leak */}
          <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-blue-50 rounded-md text-xs sm:text-sm text-blue-900">
            <strong>What does this mean?</strong><br />
            {publicIPs.length > 0 ? (
              <>
                <span>
                  If you are using a VPN and the public IP shown above matches your VPN-assigned IP address, this is <strong>not a leak</strong>—your VPN is working as expected.<br />
                  <br />
                  <span className="text-red-700 font-semibold">If the public IP matches your real (ISP-assigned) IP address, this <u>is a leak</u>—WebRTC is exposing your real IP, bypassing your VPN or proxy.</span><br />
                  <br />
                  <span className="text-gray-700">If you see only local/private IPs (like 192.168.x.x or 10.x.x.x), there is no leak.</span>
                </span>
              </>
            ) : (
              <span>
                Only local/private IPs are visible. <strong>No public IP leak detected.</strong>
              </span>
            )}
          </div>
          {(localIPs.length > 0 || publicIPs.length > 0) && (
            <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-50 rounded-md">
              <p className="text-xs sm:text-sm text-gray-600">
                <strong>Total IPs detected:</strong> {localIPs.length + publicIPs.length}
              </p>
            </div>
          )}
        </div>

        {/* SDP Log */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Session Description Protocol (SDP)</h4>
          <div className="bg-gray-100 p-2 sm:p-3 rounded-md max-h-32 sm:max-h-40 overflow-y-auto">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
              {sdpLog || 'Generating SDP...'}
            </pre>
          </div>
        </div>

        {/* Media Devices */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Available Media Devices</h4>
          {mediaDevices.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {mediaDevices.map((device, index) => (
                <div key={index} className="p-2 sm:p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {device.kind}
                    </span>
                    <strong className="text-gray-800 text-xs sm:text-base">{device.label}</strong>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    <div>Device ID: {device.deviceId.substring(0, 20)}...</div>
                    <div>Group ID: {device.groupId.substring(0, 20)}...</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-gray-500">No media devices detected</p>
          )}
        </div>

        {/* Permissions */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Media Permissions</h4>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-base"><strong>Audio Permission:</strong></span>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${permissions.audio ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {permissions.audio ? '✅ Granted' : '❌ Denied'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-base"><strong>Video Permission:</strong></span>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${permissions.video ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {permissions.video ? '✅ Granted' : '❌ Denied'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebRTCLeakTest;
