import type { VPNRecommendationEngine, VPNTestResult } from '../types';

export class VPNRecommendationService implements VPNRecommendationEngine {
  public generateRecommendations(
    results: VPNTestResult[],
    vpnDetected: boolean
  ): { immediate: string[]; important: string[]; suggested: string[] } {
    const immediate: string[] = [];
    const important: string[] = [];
    const suggested: string[] = [];

    // Process test-specific recommendations
    results.forEach(result => {
      if (result.recommendation) {
        if (result.status === 'fail' && result.critical) {
          immediate.push(result.recommendation);
        } else if (result.status === 'fail') {
          important.push(result.recommendation);
        } else if (result.status === 'warning') {
          suggested.push(result.recommendation);
        }
      }
    });

    // Add general VPN recommendations
    this.addGeneralRecommendations(immediate, important, suggested, vpnDetected, results);

    // Remove duplicates and limit recommendations
    return {
      immediate: this.removeDuplicates(immediate).slice(0, 5),
      important: this.removeDuplicates(important).slice(0, 5),
      suggested: this.removeDuplicates(suggested).slice(0, 5)
    };
  }

  private addGeneralRecommendations(
    immediate: string[],
    important: string[],
    suggested: string[],
    vpnDetected: boolean,
    results: VPNTestResult[]
  ): void {
    // VPN Detection recommendations
    if (!vpnDetected) {
      immediate.push('No VPN detected - consider using a reputable VPN service for privacy protection');
      immediate.push('Research VPN providers with strong privacy policies and no-logs guarantees');
    }

    // Category-specific recommendations
    const failedCriticalTests = results.filter(r => r.status === 'fail' && r.critical);

    if (failedCriticalTests.length === 0) {
      suggested.push('Consider using additional privacy tools like Tor Browser for maximum anonymity');
      suggested.push('Enable automatic VPN kill switch to prevent accidental IP exposure');
    }

    // Browser-specific recommendations
    const hasWebRTCIssues = results.some(r => r.testName.includes('WebRTC') && r.status === 'fail');
    if (hasWebRTCIssues) {
      important.push('Install browser extensions like uBlock Origin or WebRTC Leak Prevent');
    }

    // DNS-specific recommendations
    const hasDNSIssues = results.some(r => r.testName.includes('DNS') && r.status !== 'pass');
    if (hasDNSIssues) {
      important.push('Configure custom DNS servers (1.1.1.1, 9.9.9.9) or use VPN DNS');
    }

    // Location privacy recommendations
    const hasLocationIssues = results.some(r => r.testName.includes('location') && r.status !== 'pass');
    if (hasLocationIssues) {
      suggested.push('Disable location services in browser and use timezone spoofing');
    }

    // Advanced privacy recommendations
    const hasPrivacyIssues = results.some(r => r.testName.includes('Fingerprinting') && r.status !== 'pass');
    if (hasPrivacyIssues) {
      suggested.push('Use privacy-focused browsers like Firefox with strict privacy settings');
      suggested.push('Install privacy extensions: Privacy Badger, ClearURLs, Decentraleyes');
    }

    // Performance recommendations
    if (vpnDetected) {
      suggested.push('Test VPN server locations for optimal speed and security balance');
      suggested.push('Enable VPN auto-connect on untrusted networks');
    }
  }

  private removeDuplicates(recommendations: string[]): string[] {
    return [...new Set(recommendations)];
  }

  public generateVPNBestPractices(): {
    setup: string[];
    daily: string[];
    advanced: string[];
  } {
    return {
      setup: [
        'Choose a VPN provider with a verified no-logs policy',
        'Enable automatic kill switch to prevent IP leaks',
        'Configure VPN to start automatically with your device',
        'Use VPN-provided DNS servers to prevent DNS leaks',
        'Test your VPN regularly with leak detection tools'
      ],
      daily: [
        'Always connect to VPN before browsing',
        'Use different VPN server locations for different activities',
        'Monitor connection status and reconnect if dropped',
        'Avoid logging into personal accounts while using VPN for anonymity',
        'Clear browser data regularly when using VPN'
      ],
      advanced: [
        'Use multi-hop VPN connections for maximum security',
        'Combine VPN with Tor browser for ultimate anonymity',
        'Configure router-level VPN for all devices',
        'Use different VPN providers for different devices',
        'Monitor VPN logs and connection metadata'
      ]
    };
  }

  public generateProtocolRecommendations(): {
    protocol: string;
    security: 'high' | 'medium' | 'low';
    speed: 'fast' | 'medium' | 'slow';
    compatibility: 'excellent' | 'good' | 'limited';
    recommendation: string;
  }[] {
    return [
      {
        protocol: 'WireGuard',
        security: 'high',
        speed: 'fast',
        compatibility: 'good',
        recommendation: 'Best overall choice for modern VPN connections'
      },
      {
        protocol: 'OpenVPN',
        security: 'high',
        speed: 'medium',
        compatibility: 'excellent',
        recommendation: 'Most compatible and widely supported protocol'
      },
      {
        protocol: 'IKEv2/IPSec',
        security: 'high',
        speed: 'fast',
        compatibility: 'good',
        recommendation: 'Excellent for mobile devices with auto-reconnect'
      },
      {
        protocol: 'L2TP/IPSec',
        security: 'medium',
        speed: 'medium',
        compatibility: 'excellent',
        recommendation: 'Good compatibility but potentially compromised'
      },
      {
        protocol: 'PPTP',
        security: 'low',
        speed: 'fast',
        compatibility: 'excellent',
        recommendation: 'Avoid - known security vulnerabilities'
      }
    ];
  }
} 