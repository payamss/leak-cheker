'use client';

import { useEffect, useState } from 'react';

const WebRTCLeakTest = () => {
  const [localIP, setLocalIP] = useState<string | null>(null);
  const [publicIP, setPublicIP] = useState<string | null>(null);

  useEffect(() => {
    const getWebRTCIPs = async () => {
      try {
        const ips = new Set<string>();

        // Public STUN server configuration
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        // Dummy data channel to trigger ICE gathering
        pc.createDataChannel('');

        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .catch((err) => console.error('Error setting local description:', err));

        // Listen for ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate;
            console.log('ICE Candidate:', candidate);

            // Extract IP address from candidate string
            const ipRegex = /(\d{1,3}\.){3}\d{1,3}/;
            const match = candidate.match(ipRegex);

            if (match) {
              const ip = match[0];
              ips.add(ip);
            }
          } else {
            // No more candidates, classify IPs
            const detectedIPs = Array.from(ips);
            console.log('Detected WebRTC IPs:', detectedIPs);

            setLocalIP(
              detectedIPs.find((ip) =>
                ip.startsWith('192.') || ip.startsWith('10.') || ip.startsWith('172.')
              ) || null
            );
            setPublicIP(
              detectedIPs.find((ip) =>
                !ip.startsWith('192.') && !ip.startsWith('10.') && !ip.startsWith('172.')
              ) || null
            );
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
          <strong>Local IP:</strong>{' '}
          {localIP ? (
            <span className="text-green-600">{localIP}</span>
          ) : (
            <span className="text-gray-500">Detecting...</span>
          )}
        </p>
        <p>
          <strong>Public IP:</strong>{' '}
          {publicIP ? (
            <span className="text-blue-600">{publicIP}</span>
          ) : (
            <span className="text-gray-500">Detecting...</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default WebRTCLeakTest;
