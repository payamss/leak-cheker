'use client';

import { useEffect, useState } from 'react';

const WebRTCLeakTest = () => {
  const [localIP, setLocalIP] = useState<string | null>(null);
  const [publicIP, setPublicIP] = useState<string | null>(null);

  useEffect(() => {
    const getWebRTCIPs = async () => {
      try {
        const ips = new Set<string>();
        const pc = new RTCPeerConnection({ iceServers: [] });

        pc.createDataChannel('');
        pc.createOffer().then((offer) => pc.setLocalDescription(offer));

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const ipMatch = event.candidate.candidate.match(
              /(?:[0-9]{1,3}\.){3}[0-9]{1,3}|[a-fA-F0-9:]+/g
            );
            if (ipMatch) {
              ipMatch.forEach((ip) => ips.add(ip));
            }
          } else {
            // No more ICE candidates
            const detectedIPs = Array.from(ips);
            setLocalIP(detectedIPs.find((ip) => ip.includes('192.168') || ip.includes('10.') || ip.includes('172.')) || null);
            setPublicIP(detectedIPs.find((ip) => !ip.includes('192.168') && !ip.includes('10.') && !ip.includes('172.')) || null);
          }
        };
      } catch (error) {
        console.error('Error detecting WebRTC IPs:', error);
      }
    };

    getWebRTCIPs();
  }, []);

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-2">WebRTC Leak Test</h2>
      <div className="text-sm space-y-2">
        <p>
          <strong>Local IP:</strong> {localIP || 'Detecting...'}
        </p>
        <p>
          <strong>Public IP:</strong> {publicIP || 'Detecting...'}
        </p>
      </div>
    </div>
  );
};

export default WebRTCLeakTest;
