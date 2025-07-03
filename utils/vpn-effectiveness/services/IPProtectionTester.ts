import type { VPNTestModule, VPNTestResult, IPTestResult } from '../types';

export class IPProtectionTester implements VPNTestModule {
  public readonly name = 'IP Protection';

  public async run(): Promise<VPNTestResult[]> {
    const results: VPNTestResult[] = [];

    try {
      const [webrtcTest, publicIPTest, ipv6Test] = await Promise.all([
        this.testWebRTCLeaks(),
        this.testPublicIP(),
        this.testIPv6Leaks()
      ]);

      results.push(
        this.createWebRTCResult(webrtcTest),
        this.createPublicIPResult(publicIPTest),
        this.createIPv6Result(ipv6Test)
      );

    } catch (error) {
      results.push(this.createErrorResult(error));
    }

    return results;
  }

  private async testWebRTCLeaks(): Promise<{ hasLeak: boolean; leakedIPs: string[] }> {
    return new Promise((resolve) => {
      const ips: string[] = [];
      const rtc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      rtc.createDataChannel('');
      rtc.createOffer().then(offer => rtc.setLocalDescription(offer));

      const timeout = setTimeout(() => {
        rtc.close();
        resolve({ hasLeak: ips.length > 0, leakedIPs: ips });
      }, 3000);

      rtc.onicecandidate = (event) => {
        if (event.candidate) {
          const ip = event.candidate.candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (ip && !ips.includes(ip[1])) {
            ips.push(ip[1]);
          }
        }
      };
    });
  }

  private async testPublicIP(): Promise<{ ip: string; isVPN: boolean }> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      const ip = data.ip;

      return {
        ip,
        isVPN: this.isVPNIP(ip)
      };
    } catch (error) {
      throw new Error(`Failed to get public IP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testIPv6Leaks(): Promise<{ hasLeak: boolean; ipv6?: string }> {
    try {
      const response = await fetch('https://api64.ipify.org?format=json');
      const data = await response.json();

      return {
        hasLeak: data.ip && data.ip.includes(':'),
        ipv6: data.ip && data.ip.includes(':') ? data.ip : undefined
      };
    } catch (error) {
      return { hasLeak: false };
    }
  }

  private isVPNIP(ip: string): boolean {
    const vpnRanges = [
      /^10\./, // Private range
      /^172\.(1[6-9]|2[0-9]|3[01])\./, // Private range
      /^192\.168\./, // Private range
      /^185\./, // Common VPN hosting
      /^159\./, // Common VPN hosting
      /^45\./, // Digital Ocean (common VPN hosting)
      /^134\./, // Common VPN ranges
    ];

    return vpnRanges.some(range => range.test(ip));
  }

  private createWebRTCResult(test: { hasLeak: boolean; leakedIPs: string[] }): VPNTestResult {
    return {
      testName: 'WebRTC IP Leak Protection',
      status: test.hasLeak ? 'fail' : 'pass',
      score: test.hasLeak ? 0 : 25,
      maxScore: 25,
      description: 'Tests if your real IP address is exposed through WebRTC',
      details: test.hasLeak
        ? `WebRTC leaked ${test.leakedIPs.length} IP address(es): ${test.leakedIPs.join(', ')}`
        : 'No WebRTC IP leaks detected',
      recommendation: test.hasLeak
        ? 'Disable WebRTC in browser settings or use WebRTC blocking extension'
        : undefined,
      critical: true
    };
  }

  private createPublicIPResult(test: { ip: string; isVPN: boolean }): VPNTestResult {
    return {
      testName: 'Public IP Protection',
      status: test.isVPN ? 'pass' : 'fail',
      score: test.isVPN ? 20 : 0,
      maxScore: 20,
      description: 'Verifies your public IP is masked by VPN',
      details: `Public IP: ${test.ip} ${test.isVPN ? '(appears to be VPN/proxy)' : '(appears to be direct ISP connection)'}`,
      recommendation: test.isVPN
        ? undefined
        : 'Ensure VPN connection is active and properly configured',
      critical: true
    };
  }

  private createIPv6Result(test: { hasLeak: boolean; ipv6?: string }): VPNTestResult {
    return {
      testName: 'IPv6 Leak Protection',
      status: test.hasLeak ? 'fail' : 'pass',
      score: test.hasLeak ? 0 : 15,
      maxScore: 15,
      description: 'Checks for IPv6 address leakage',
      details: test.hasLeak
        ? `IPv6 address detected: ${test.ipv6}`
        : 'No IPv6 leaks detected',
      recommendation: test.hasLeak
        ? 'Disable IPv6 or ensure VPN supports IPv6 protection'
        : undefined,
      critical: true
    };
  }

  private createErrorResult(error: unknown): VPNTestResult {
    return {
      testName: 'IP Protection Tests',
      status: 'unknown',
      score: 0,
      maxScore: 60,
      description: 'Failed to run IP protection tests',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      critical: true
    };
  }
} 