import { WebRTCLeakResult } from '../types';

export class WebRTCLeakDetector {
  private static instance: WebRTCLeakDetector;

  public static getInstance(): WebRTCLeakDetector {
    if (!WebRTCLeakDetector.instance) {
      WebRTCLeakDetector.instance = new WebRTCLeakDetector();
    }
    return WebRTCLeakDetector.instance;
  }

  public async detect(): Promise<WebRTCLeakResult> {
    const startTime = Date.now();

    try {
      const [localIPs, publicIPs] = await Promise.all([
        this.detectLocalIPs(),
        this.detectPublicIPs()
      ]);

      const testDuration = Date.now() - startTime;
      const isWebRTCBlocked = localIPs.length === 0 && publicIPs.length === 0;
      const hasIPLeak = localIPs.length > 0 || publicIPs.length > 0;

      return {
        webrtcBlocked: isWebRTCBlocked,
        hasIPLeak,
        localIPs,
        publicIPs,
        webrtcSupported: this.checkWebRTCSupport(),
        stunServersAccessible: await this.testSTUNServers(),
        testDuration,
        protectionLevel: this.assessProtectionLevel(isWebRTCBlocked, hasIPLeak)
      };
    } catch (error) {
      console.error('WebRTC leak detection failed:', error);
      return {
        webrtcBlocked: true, // Assume blocked if error
        hasIPLeak: false,
        localIPs: [],
        publicIPs: [],
        webrtcSupported: false,
        stunServersAccessible: false,
        testDuration: Date.now() - startTime,
        protectionLevel: 'excellent'
      };
    }
  }

  private async detectLocalIPs(): Promise<string[]> {
    return new Promise((resolve) => {
      const ips: Set<string> = new Set();
      const timeout = setTimeout(() => resolve(Array.from(ips)), 2000);

      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        pc.createDataChannel('');

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate;
            const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);

            if (ipMatch) {
              const ip = ipMatch[1];
              // Filter out non-local IPs that might leak through
              if (this.isLocalIP(ip)) {
                ips.add(ip);
              }
            }
          }
        };

        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer))
          .catch(() => {
            clearTimeout(timeout);
            resolve(Array.from(ips));
          });

        // Clean up after timeout
        setTimeout(() => {
          try {
            pc.close();
          } catch (e) {
            // Ignore cleanup errors
          }
        }, 2500);

      } catch (error) {
        clearTimeout(timeout);
        resolve([]);
      }
    });
  }

  private async detectPublicIPs(): Promise<string[]> {
    return new Promise((resolve) => {
      const ips: Set<string> = new Set();
      const timeout = setTimeout(() => resolve(Array.from(ips)), 3000);

      try {
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun.cloudflare.com:3478' }
          ]
        });

        pc.createDataChannel('');

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate;
            const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);

            if (ipMatch) {
              const ip = ipMatch[1];
              // Only collect public IPs
              if (!this.isLocalIP(ip) && !this.isPrivateIP(ip)) {
                ips.add(ip);
              }
            }
          }
        };

        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer))
          .catch(() => {
            clearTimeout(timeout);
            resolve(Array.from(ips));
          });

        // Clean up after timeout
        setTimeout(() => {
          try {
            pc.close();
          } catch (e) {
            // Ignore cleanup errors
          }
        }, 3500);

      } catch (error) {
        clearTimeout(timeout);
        resolve([]);
      }
    });
  }

  private async testSTUNServers(): Promise<boolean> {
    const stunServers = [
      'stun:stun.l.google.com:19302',
      'stun:stun.cloudflare.com:3478',
      'stun:stun.nextcloud.com:443'
    ];

    try {
      const pc = new RTCPeerConnection({
        iceServers: stunServers.map(url => ({ urls: url }))
      });

      pc.createDataChannel('test');

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Wait briefly to see if ICE candidates are generated
      await new Promise(resolve => setTimeout(resolve, 1000));

      pc.close();
      return true;
    } catch (error) {
      return false;
    }
  }

  private checkWebRTCSupport(): boolean {
    return typeof RTCPeerConnection !== 'undefined' ||
      typeof (window as any).webkitRTCPeerConnection !== 'undefined' ||
      typeof (window as any).mozRTCPeerConnection !== 'undefined';
  }

  private isLocalIP(ip: string): boolean {
    return ip.startsWith('127.') || ip === '::1';
  }

  private isPrivateIP(ip: string): boolean {
    const parts = ip.split('.').map(Number);

    // 10.0.0.0/8
    if (parts[0] === 10) return true;

    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;

    // 169.254.0.0/16 (link-local)
    if (parts[0] === 169 && parts[1] === 254) return true;

    return false;
  }

  private assessProtectionLevel(webrtcBlocked: boolean, hasIPLeak: boolean): 'excellent' | 'good' | 'poor' | 'critical' {
    if (webrtcBlocked) return 'excellent';
    if (!hasIPLeak) return 'good';
    return 'critical';
  }
} 