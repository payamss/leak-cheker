import type { VPNTestModule, VPNTestResult, PrivacyTestResult } from '../types';

export class AdvancedPrivacyTester implements VPNTestModule {
  public readonly name = 'Advanced Privacy';

  public async run(): Promise<VPNTestResult[]> {
    const results: VPNTestResult[] = [];

    try {
      const [fingerprintTest, trackingTest] = await Promise.all([
        this.testFingerprintingProtection(),
        this.testTrackingProtection()
      ]);

      results.push(
        this.createFingerprintResult(fingerprintTest),
        this.createTrackingResult(trackingTest)
      );

    } catch (error) {
      results.push(this.createErrorResult(error));
    }

    return results;
  }

  private async testFingerprintingProtection(): Promise<{ isProtected: boolean; methods: string[] }> {
    const protectionMethods: string[] = [];

    try {
      // Test canvas fingerprinting
      const canvasProtected = this.testCanvasProtection();
      if (canvasProtected) protectionMethods.push('Canvas');

      // Test WebGL fingerprinting
      const webglProtected = this.testWebGLProtection();
      if (webglProtected) protectionMethods.push('WebGL');

      // Test font enumeration
      const fontProtected = this.testFontProtection();
      if (fontProtected) protectionMethods.push('Font enumeration');

      // Test audio fingerprinting
      const audioProtected = await this.testAudioProtection();
      if (audioProtected) protectionMethods.push('Audio context');

      return {
        isProtected: protectionMethods.length > 2, // Consider protected if multiple methods are blocked
        methods: protectionMethods
      };
    } catch (error) {
      return {
        isProtected: false,
        methods: []
      };
    }
  }

  private testCanvasProtection(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return true; // No context = protected

      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('VPN Test 🔒', 2, 2);

      const fingerprint = canvas.toDataURL();
      return fingerprint === 'data:,'; // Empty data indicates blocking
    } catch (error) {
      return true; // Error indicates blocking
    }
  }

  private testWebGLProtection(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') as WebGLRenderingContext ||
        canvas.getContext('experimental-webgl') as WebGLRenderingContext;

      if (!gl) return true; // No WebGL = protected

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return true; // No debug info = protected

      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return !renderer || renderer === 'WebGL'; // Generic renderer = protected
    } catch (error) {
      return true; // Error indicates blocking
    }
  }

  private testFontProtection(): boolean {
    try {
      // Simple font detection test
      const testFonts = ['Arial', 'Times', 'Courier', 'Helvetica'];
      const detectedFonts = testFonts.filter(font => this.isFontAvailable(font));

      // If very few fonts detected, likely protected
      return detectedFonts.length < 2;
    } catch (error) {
      return true;
    }
  }

  private isFontAvailable(font: string): boolean {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    ctx.font = `12px ${font}`;
    const width = ctx.measureText('test').width;

    ctx.font = '12px monospace';
    const defaultWidth = ctx.measureText('test').width;

    return width !== defaultWidth;
  }

  private async testAudioProtection(): Promise<boolean> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();

      oscillator.connect(analyser);
      oscillator.frequency.value = 1000;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);

      // If we can't create audio fingerprint, it's protected
      return false; // Simplified - real test would analyze audio output
    } catch (error) {
      return true; // Error indicates blocking
    }
  }

  private async testTrackingProtection(): Promise<{ isProtected: boolean; blockedDomains: string[]; totalTested: number }> {
    const trackingDomains = [
      'google-analytics.com',
      'googletagmanager.com',
      'facebook.com',
      'doubleclick.net',
      'googlesyndication.com',
      'amazon-adsystem.com'
    ];

    const blockedDomains: string[] = [];

    // Test if tracking domains are accessible
    for (const domain of trackingDomains) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        await fetch(`https://${domain}`, {
          mode: 'no-cors',
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        // If fetch succeeds, domain is not blocked
      } catch (error) {
        // If fetch fails, domain is likely blocked
        blockedDomains.push(domain);
      }
    }

    const protectionLevel = blockedDomains.length / trackingDomains.length;

    return {
      isProtected: protectionLevel > 0.5, // Consider protected if >50% blocked
      blockedDomains,
      totalTested: trackingDomains.length
    };
  }

  private createFingerprintResult(test: { isProtected: boolean; methods: string[] }): VPNTestResult {
    return {
      testName: 'Fingerprinting Protection',
      status: test.isProtected ? 'pass' : 'warning',
      score: test.isProtected ? 15 : 5,
      maxScore: 15,
      description: 'Tests browser fingerprinting resistance',
      details: test.isProtected
        ? `Fingerprinting protection detected: ${test.methods.join(', ')}`
        : `Limited fingerprinting protection. Protected methods: ${test.methods.join(', ') || 'None'}`,
      recommendation: test.isProtected
        ? undefined
        : 'Use anti-fingerprinting browser extensions or privacy-focused browser',
      critical: false
    };
  }

  private createTrackingResult(test: { isProtected: boolean; blockedDomains: string[]; totalTested: number }): VPNTestResult {
    const protectionPercentage = Math.round((test.blockedDomains.length / test.totalTested) * 100);

    return {
      testName: 'Tracking Protection',
      status: test.isProtected ? 'pass' : 'warning',
      score: test.isProtected ? 10 : 3,
      maxScore: 10,
      description: 'Tests protection against tracking domains',
      details: `${test.blockedDomains.length}/${test.totalTested} tracking domains blocked (${protectionPercentage}% protection)`,
      recommendation: test.isProtected
        ? undefined
        : 'Enable tracking protection, ad blockers, or use privacy-focused DNS',
      critical: false
    };
  }

  private createErrorResult(error: unknown): VPNTestResult {
    return {
      testName: 'Advanced Privacy Tests',
      status: 'unknown',
      score: 0,
      maxScore: 25,
      description: 'Failed to run advanced privacy tests',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      critical: false
    };
  }
} 