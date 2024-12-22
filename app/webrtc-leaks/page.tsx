'use client';

import { useEffect, useState } from 'react';
import WebRTCLeakInfoBox from './components/WebRTCLeakInfoBox';
import { FiServer } from 'react-icons/fi';

type DeviceInfo = {
  kind: string;
  label: string;
  deviceId: string;
  groupId: string;
};

const WebRTCLeakTest = () => {
  const [localIPs, setLocalIPs] = useState<string[]>([]);
  const [publicIPs, setPublicIPs] = useState<string[]>([]);
  const [sdpLog, setSdpLog] = useState<string | null>(null);
  const [mediaDevices, setMediaDevices] = useState<DeviceInfo[]>([]);
  const [permissions, setPermissions] = useState({
    audio: false,
    video: false,
  });

  useEffect(() => {
    const detectWebRTCIPs = async () => {
      try {
        const ips = new Set<string>();
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], // STUN server
        });

        pc.createDataChannel(''); // Create a dummy data channel
        const offer = await pc.createOffer();
        setSdpLog(offer.sdp || 'No SDP generated'); // Log SDP
        await pc.setLocalDescription(offer);

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate;
            const ipRegex = /(\d{1,3}\.){3}\d{1,3}|([a-fA-F0-9:]+)/; // IPv4 and IPv6 regex
            const match = candidate.match(ipRegex);
            if (match) ips.add(match[0]);
          } else {
            const detectedIPs = Array.from(ips);
            const privateIPs = detectedIPs.filter((ip) =>
              ip.startsWith('192.') || ip.startsWith('10.') || ip.startsWith('172.')
            );
            const publicIPs = detectedIPs.filter(
              (ip) => !ip.startsWith('192.') && !ip.startsWith('10.') && !ip.startsWith('172.')
            );

            setLocalIPs(privateIPs);
            setPublicIPs(publicIPs);
          }
        };
      } catch (error) {
        console.error('WebRTC IP detection failed:', error);
      }
    };

    const fetchMediaDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setMediaDevices(
          devices.map((device) => ({
            kind: device.kind,
            label: device.label || 'Unknown',
            deviceId: device.deviceId,
            groupId: device.groupId,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch media devices:', error);
      }
    };

    const checkPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setPermissions({ audio: true, video: true });
        stream.getTracks().forEach((track) => track.stop()); // Stop the stream immediately
      } catch (error) {
        console.error('Permission error:', error);
        setPermissions({
          audio: false,
          video: false,
        });
      }
    };

    detectWebRTCIPs();
    fetchMediaDevices();
    checkPermissions();
  }, []);

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md space-y-4">
      <h3 className="text-3xl font-bold text-blue-600 mb-6 flex items-center">
        <FiServer className="w-6 h-6 mr-2" /> WebRTC Leak Test
      </h3>

      {/* Expandable Info Box */}
      <WebRTCLeakInfoBox />

      {/* WebRTC IPs */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold text-gray-700">Your WebRTC IP</h4>
        <p><strong>Local IPs:</strong> {localIPs.length > 0 ? localIPs.join(', ') : 'Detecting...'}</p>
        <p><strong>Public IPs:</strong> {publicIPs.length > 0 ? publicIPs.join(', ') : 'Detecting...'}</p>
      </div>

      {/* SDP Log */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold text-gray-700">Session Description (SDP)</h4>
        <pre className="bg-gray-100 p-2 rounded-md text-sm text-gray-600">{sdpLog || 'Generating...'}</pre>
      </div>

      {/* Media Devices */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold text-gray-700">Media Devices</h4>
        <ul className="list-disc list-inside space-y-2">
          {mediaDevices.map((device, index) => (
            <li key={index}>
              <strong>{device.kind}:</strong> {device.label}
              <br />
              <small>Device ID: {device.deviceId}</small>
              <br />
              <small>Group ID: {device.groupId}</small>
            </li>
          ))}
        </ul>
      </div>

      {/* Permissions */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold text-gray-700">Media Permissions</h4>
        <p>
          <strong>Audio:</strong>{' '}
          {permissions.audio ? (
            <span className="text-green-600">Granted</span>
          ) : (
            <span className="text-red-600">Denied</span>
          )}
        </p>
        <p>
          <strong>Video:</strong>{' '}
          {permissions.video ? (
            <span className="text-green-600">Granted</span>
          ) : (
            <span className="text-red-600">Denied</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default WebRTCLeakTest;
