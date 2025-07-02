import {
  PrivacyTestResult,
  DetailedPrivacyTestResult,
  ScoreBreakdown,
  TechnicalRecommendation
} from '../types';
import { BrowserDetector } from './BrowserDetector';
import { CookieTester } from './CookieTester';
import { FingerprintDetector } from './FingerprintDetector';
import { HardwareDetector } from './HardwareDetector';
import { PrivacyScorer } from './PrivacyScorer';
import { ReportGenerator } from './ReportGenerator';

export class PrivacyTestService {
  private static instance: PrivacyTestService;
  private browserDetector: BrowserDetector;
  private cookieTester: CookieTester;
  private fingerprintDetector: FingerprintDetector;
  private hardwareDetector: HardwareDetector;
  private privacyScorer: PrivacyScorer;
  private reportGenerator: ReportGenerator;

  private constructor() {
    this.browserDetector = BrowserDetector.getInstance();
    this.cookieTester = CookieTester.getInstance();
    this.fingerprintDetector = FingerprintDetector.getInstance();
    this.hardwareDetector = HardwareDetector.getInstance();
    this.privacyScorer = PrivacyScorer.getInstance();
    this.reportGenerator = ReportGenerator.getInstance();
  }

  public static getInstance(): PrivacyTestService {
    if (!PrivacyTestService.instance) {
      PrivacyTestService.instance = new PrivacyTestService();
    }
    return PrivacyTestService.instance;
  }

  public async runBasicTest(): Promise<PrivacyTestResult> {
    const detailedResult = await this.runDetailedTest();
    return detailedResult.userFriendly;
  }

  public async runDetailedTest(): Promise<DetailedPrivacyTestResult> {
    const startTime = Date.now();

    try {
      // Run all tests in parallel for efficiency
      const [
        browserInfo,
        cookieResult,
        fingerprintingResult,
        hardwareInfo
      ] = await Promise.all([
        this.browserDetector.detect(),
        this.cookieTester.test(),
        this.fingerprintDetector.detect(),
        this.hardwareDetector.detect()
      ]);

      // Generate technical recommendations
      const recommendations = this.generateRecommendations(
        browserInfo,
        cookieResult,
        fingerprintingResult,
        hardwareInfo
      );

      // Calculate privacy score with detailed breakdown
      const score = this.privacyScorer.calculateScore({
        browser: browserInfo,
        cookies: cookieResult,
        fingerprinting: fingerprintingResult,
        hardware: hardwareInfo,
        privacyScore: 0,
        recommendations: []
      });
      const scoreBreakdown: ScoreBreakdown = {
        total: score,
        maxPossible: 100,
        percentage: score,
        components: {
          browser: { score: 0, max: 20, reason: '' },
          cookies: { score: 0, max: 30, reason: '' },
          fingerprinting: { score: 0, max: 40, reason: '' },
          hardware: { score: 0, max: 15, reason: '' },
          doNotTrack: { score: 0, max: 10, reason: '' }
        },
        penalties: [],
        bonuses: []
      };

      // Build basic user-friendly result
      const userFriendly: PrivacyTestResult = {
        browser: {
          name: browserInfo.name,
          version: browserInfo.version,
          userAgent: browserInfo.userAgent,
          language: browserInfo.language,
          platform: browserInfo.platform,
          doNotTrack: browserInfo.doNotTrack
        },
        hardware: {
          cpuCores: hardwareInfo.cpuCores,
          deviceMemory: hardwareInfo.deviceMemory,
          screen: hardwareInfo.screen
        },
        cookies: {
          thirdPartyCookiesBlocked: cookieResult.thirdPartyCookiesBlocked,
          sameSiteNoneBlocked: cookieResult.sameSiteNoneBlocked,
          sameSiteLaxBlocked: cookieResult.sameSiteLaxBlocked,
          sameSiteStrictBlocked: cookieResult.sameSiteStrictBlocked,
          localStorageBlocked: cookieResult.localStorageBlocked,
          sessionStorageBlocked: cookieResult.sessionStorageBlocked
        },
        fingerprinting: {
          canvasBlocked: fingerprintingResult.canvasBlocked,
          webglBlocked: fingerprintingResult.webglBlocked,
          fontsDetected: fingerprintingResult.fontsDetected,
          pluginsDetected: fingerprintingResult.pluginsDetected,
          uniquenessScore: fingerprintingResult.uniquenessScore
        },
        privacyScore: scoreBreakdown.percentage,
        recommendations: recommendations.map(r => r.title)
      };

      // Generate metadata
      const testDuration = Date.now() - startTime;
      const metadata = this.generateMetadata(testDuration);

      // Collect raw data for debugging
      const rawData = {
        allCookies: document.cookie,
        navigatorObject: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          languages: Array.from(navigator.languages) as string[],
          platform: navigator.platform,
          hardwareConcurrency: navigator.hardwareConcurrency,
          deviceMemory: (navigator as any).deviceMemory,
          doNotTrack: navigator.doNotTrack,
          cookieEnabled: navigator.cookieEnabled
        },
        screenObject: {
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight,
          colorDepth: screen.colorDepth,
          pixelDepth: screen.pixelDepth
        },
        canvasFingerprint: '',
        webglFingerprint: '',
        audioFingerprint: this.generateAudioFingerprint()
      };

      // Build comprehensive detailed result
      const detailedResult: DetailedPrivacyTestResult = {
        userFriendly,
        detailed: {
          browser: {
            ...browserInfo,
            detectionMethod: 'User-Agent + API Detection',
            browserEngine: this.getBrowserEngine(browserInfo.name),
            renderingEngine: this.getRenderingEngine(browserInfo.name),
            javaScriptEngine: this.getJavaScriptEngine(browserInfo.name),
            detectedExtensions: this.detectExtensions()
          },
          hardware: {
            ...hardwareInfo,
            spoofingDetected: this.detectHardwareSpoofing(hardwareInfo),
            actualValues: {
              estimatedCpuCores: navigator.hardwareConcurrency,
              estimatedMemory: (navigator as any).deviceMemory,
              estimatedScreen: `${screen.width}x${screen.height}`
            },
            fingerprintingRisk: this.assessFingerprintingRisk(hardwareInfo)
          },
          cookies: {
            ...cookieResult,
            testDetails: {
              sameSiteTests: {
                none: { attempted: true, successful: !cookieResult.sameSiteNoneBlocked },
                lax: { attempted: true, successful: !cookieResult.sameSiteLaxBlocked },
                strict: { attempted: true, successful: !cookieResult.sameSiteStrictBlocked }
              },
              storageTests: {
                localStorage: {
                  available: !cookieResult.localStorageBlocked,
                  quota: this.getStorageQuota('localStorage')
                },
                sessionStorage: {
                  available: !cookieResult.sessionStorageBlocked,
                  quota: this.getStorageQuota('sessionStorage')
                },
                indexedDB: { available: this.checkIndexedDB() }
              },
              crossSiteIndicators: this.detectCrossSiteIndicators()
            },
            browserSpecificBlocking: this.detectBrowserSpecificBlocking(browserInfo.name)
          },
          fingerprinting: {
            ...fingerprintingResult,
            testDetails: {
              canvas: {
                testPattern: 'Privacy test pattern',
                imageData: '',
                randomizationDetected: this.detectCanvasRandomization(),
                blockingMethod: this.getCanvasBlockingMethod()
              },
              webgl: {
                contextAvailable: this.checkWebGLContext(),
                renderer: this.getWebGLRenderer(),
                vendor: this.getWebGLVendor(),
                extensions: this.getWebGLExtensions(),
                blockingMethod: this.getWebGLBlockingMethod()
              },
              fonts: {
                testMethod: 'Canvas text measurement',
                baselineWidth: this.getBaselineWidth(),
                detectedFonts: fingerprintingResult.fontsDetected.map((font: string, index: number) => ({
                  name: font,
                  width: 100 + index, // Mock width data
                  difference: index * 2
                })),
                spoofingDetected: this.detectFontSpoofing()
              },
              plugins: {
                enumerationBlocked: fingerprintingResult.pluginsDetected.length === 0,
                detectedPlugins: fingerprintingResult.pluginsDetected.map((plugin: string) => ({
                  name: plugin,
                  description: `Plugin: ${plugin}`
                }))
              }
            },
            privacyToolSignatures: this.detectPrivacyToolSignatures(),
            advancedFingerprinting: {
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              language: Array.from(navigator.languages) as string[],
              platform: navigator.platform,
              touchSupport: 'ontouchstart' in window,
              colorGamut: this.getColorGamut(),
              hdr: this.checkHDRSupport()
            }
          },
          scoreBreakdown,
          technicalRecommendations: recommendations
        },
        metadata,
        rawData
      };

      return detailedResult;

    } catch (error) {
      console.error('Privacy test failed:', error);
      throw new Error(`Privacy test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate technical recommendations based on test results
  private generateRecommendations(
    browserInfo: any,
    cookieResult: any,
    fingerprintingResult: any,
    hardwareInfo: any
  ): TechnicalRecommendation[] {
    const recommendations: TechnicalRecommendation[] = [];

    // Critical recommendations
    if (!cookieResult.thirdPartyCookiesBlocked) {
      recommendations.push({
        category: 'critical',
        title: 'Block Third-Party Cookies',
        description: 'Third-party cookies allow websites to track you across the internet. Blocking them significantly improves privacy.',
        technicalDetails: 'Your browser currently accepts third-party cookies, enabling cross-site tracking.',
        implementation: {
          browserSettings: [
            'Chrome: Settings > Privacy & Security > Third-party cookies > Block third-party cookies',
            'Edge: Settings > Cookies and site permissions > Cookies > Block third-party cookies',
            'Firefox: Settings > Privacy & Security > Enhanced Tracking Protection > Strict'
          ],
          extensions: ['uBlock Origin', 'Privacy Badger'],
          advanced: ['Set SameSite=Strict for all cookies via browser flags']
        },
        impact: {
          privacyGain: 25,
          usabilityImpact: 'low',
          breakageRisk: 'medium'
        }
      });
    }

    if (!fingerprintingResult.canvasBlocked) {
      recommendations.push({
        category: 'critical',
        title: 'Block Canvas Fingerprinting',
        description: 'Canvas fingerprinting creates a unique identifier based on how your browser renders graphics.',
        technicalDetails: 'Canvas API is accessible and can be used to generate unique fingerprints.',
        implementation: {
          browserSettings: [
            'Firefox: privacy.resistFingerprinting = true',
            'Edge: edge://flags > Enable Canvas fingerprinting protection'
          ],
          extensions: ['CanvasBlocker', 'ClearURLs'],
          advanced: ['Disable canvas API via browser extensions']
        },
        impact: {
          privacyGain: 20,
          usabilityImpact: 'medium',
          breakageRisk: 'medium'
        }
      });
    }

    if (!fingerprintingResult.webglBlocked) {
      recommendations.push({
        category: 'important',
        title: 'Disable WebGL',
        description: 'WebGL provides detailed graphics card information that can be used for fingerprinting.',
        technicalDetails: 'WebGL context is available and exposes graphics hardware details.',
        implementation: {
          browserSettings: [
            'Chrome: chrome://flags > Disable WebGL',
            'Edge: edge://flags > Disable WebGL',
            'Firefox: webgl.disabled = true'
          ],
          advanced: ['Block WebGL via content security policy']
        },
        impact: {
          privacyGain: 15,
          usabilityImpact: 'high',
          breakageRisk: 'high'
        }
      });
    }

    // Browser-specific recommendations
    if (browserInfo.name === 'Chrome' || browserInfo.name === 'Edge') {
      recommendations.push({
        category: 'suggested',
        title: 'Consider Privacy-Focused Browser',
        description: 'Chrome and Edge have built-in tracking capabilities. Consider switching to Firefox or Tor Browser.',
        technicalDetails: 'Chrome/Edge collect telemetry and have less privacy-focused defaults.',
        implementation: {
          browserSettings: ['Switch to Firefox, Tor Browser, or Brave'],
          extensions: ['If staying on Chrome/Edge, install comprehensive privacy extensions']
        },
        impact: {
          privacyGain: 30,
          usabilityImpact: 'medium',
          breakageRisk: 'low'
        }
      });
    }

    if (!browserInfo.doNotTrack) {
      recommendations.push({
        category: 'suggested',
        title: 'Enable Do Not Track',
        description: 'Do Not Track signals to websites that you prefer not to be tracked.',
        technicalDetails: 'Do Not Track header is not being sent with requests.',
        implementation: {
          browserSettings: [
            'Chrome: Settings > Privacy & Security > Send "Do not track" request',
            'Edge: Settings > Privacy > Send Do Not Track requests',
            'Firefox: Settings > Privacy & Security > Send websites "Do Not Track" signal'
          ]
        },
        impact: {
          privacyGain: 5,
          usabilityImpact: 'none',
          breakageRisk: 'none'
        }
      });
    }

    // Font enumeration recommendation
    if (fingerprintingResult.fontsDetected.length > 15) {
      recommendations.push({
        category: 'important',
        title: 'Reduce Font Enumeration',
        description: 'Many detectable fonts increase your browser fingerprint uniqueness.',
        technicalDetails: `${fingerprintingResult.fontsDetected.length} fonts detected, increasing fingerprint entropy.`,
        implementation: {
          browserSettings: ['Use privacy mode which limits font enumeration'],
          extensions: ['Font fingerprinting protection extensions'],
          advanced: ['Remove unnecessary fonts from system', 'Use font randomization tools']
        },
        impact: {
          privacyGain: 10,
          usabilityImpact: 'low',
          breakageRisk: 'low'
        }
      });
    }

    return recommendations;
  }

  // Helper methods for detailed data collection
  private generateMetadata(testDuration: number) {
    return {
      testVersion: '2.0.0',
      timestamp: new Date().toISOString(),
      testDuration,
      userAgent: navigator.userAgent,
      testEnvironment: {
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        port: window.location.port,
        isSecureContext: window.isSecureContext
      },
      browserCapabilities: {
        webgl: this.checkWebGLSupport(),
        webgl2: this.checkWebGL2Support(),
        serviceWorkers: 'serviceWorker' in navigator,
        webAssembly: typeof WebAssembly !== 'undefined',
        webRTC: this.checkWebRTCSupport()
      }
    };
  }

  private collectRawData(fingerprintingResult: any) {
    return {
      allCookies: document.cookie,
      navigatorObject: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages,
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: (navigator as any).deviceMemory,
        doNotTrack: navigator.doNotTrack,
        cookieEnabled: navigator.cookieEnabled
      },
      screenObject: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth
      },
      canvasFingerprint: '',
      webglFingerprint: '',
      audioFingerprint: this.generateAudioFingerprint()
    };
  }

  // Detection and assessment methods
  private getBrowserEngine(browserName: string): string {
    switch (browserName.toLowerCase()) {
      case 'chrome': case 'edge': case 'brave': return 'Blink';
      case 'firefox': return 'Gecko';
      case 'safari': return 'WebKit';
      default: return 'Unknown';
    }
  }

  private getRenderingEngine(browserName: string): string {
    return this.getBrowserEngine(browserName);
  }

  private getJavaScriptEngine(browserName: string): string {
    switch (browserName.toLowerCase()) {
      case 'chrome': case 'edge': case 'brave': return 'V8';
      case 'firefox': return 'SpiderMonkey';
      case 'safari': return 'JavaScriptCore';
      default: return 'Unknown';
    }
  }

  private detectExtensions(): string[] {
    // Basic extension detection (limited by browser security)
    const extensions: string[] = [];

    // Check for common extension indicators
    if ((window as any).chrome?.runtime) {
      extensions.push('Chrome Extension API Available');
    }

    // Check for uBlock Origin
    if (document.querySelector('link[href*="ublock"]') ||
      document.querySelector('script[src*="ublock"]')) {
      extensions.push('uBlock Origin (possible)');
    }

    return extensions;
  }

  private detectHardwareSpoofing(hardwareInfo: any) {
    const navigatorCores = navigator.hardwareConcurrency;
    const navigatorMemory = (navigator as any).deviceMemory;

    return {
      cpuCores: hardwareInfo.cpuCores !== navigatorCores,
      deviceMemory: hardwareInfo.deviceMemory !== navigatorMemory,
      screenResolution: false // Would need more sophisticated detection
    };
  }

  private assessFingerprintingRisk(hardwareInfo: any): 'low' | 'medium' | 'high' {
    let riskFactors = 0;

    if (hardwareInfo.cpuCores > 16) riskFactors++;
    if (hardwareInfo.deviceMemory > 8) riskFactors++;
    if (hardwareInfo.screen.width > 1920) riskFactors++;

    if (riskFactors >= 2) return 'high';
    if (riskFactors === 1) return 'medium';
    return 'low';
  }

  private getStorageQuota(storageType: string): number | undefined {
    try {
      if (storageType === 'localStorage' && window.localStorage) {
        return 5 * 1024 * 1024; // 5MB typical
      }
      if (storageType === 'sessionStorage' && window.sessionStorage) {
        return 5 * 1024 * 1024; // 5MB typical
      }
    } catch (e) {
      return undefined;
    }
    return undefined;
  }

  private checkIndexedDB(): boolean {
    return 'indexedDB' in window;
  }

  private detectCrossSiteIndicators(): string[] {
    const indicators: string[] = [];

    if (document.referrer && new URL(document.referrer).origin !== window.location.origin) {
      indicators.push('Cross-origin referrer detected');
    }

    return indicators;
  }

  private detectBrowserSpecificBlocking(browserName: string) {
    return {
      edgeStrictMode: browserName === 'Edge' && this.checkEdgeStrictMode(),
      chromeThirdPartyBlocking: browserName === 'Chrome' && this.checkChromeThirdPartyBlocking(),
      firefoxETP: browserName === 'Firefox' && this.checkFirefoxETP(),
      braveShieldsActive: browserName === 'Brave' && this.checkBraveShields()
    };
  }

  private detectCanvasRandomization(): boolean {
    // Simple check for canvas randomization
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      ctx.fillText('Test', 10, 10);
      const data1 = canvas.toDataURL();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillText('Test', 10, 10);
      const data2 = canvas.toDataURL();

      return data1 !== data2;
    } catch (e) {
      return true; // Assume randomization if error
    }
  }

  private getCanvasBlockingMethod(): string | undefined {
    if (this.detectCanvasRandomization()) {
      return 'Randomization detected';
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.getContext('2d');
      return undefined;
    } catch (e) {
      return 'API blocked';
    }
  }

  private checkWebGLContext(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return gl !== null;
    } catch (e) {
      return false;
    }
  }

  private getWebGLRenderer(): string | undefined {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return undefined;
      const webgl = gl as WebGLRenderingContext;
      const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        return webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    } catch (e) {
      return undefined;
    }
    return undefined;
  }

  private getWebGLVendor(): string | undefined {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return undefined;
      const webgl = gl as WebGLRenderingContext;
      const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        return webgl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      }
    } catch (e) {
      return undefined;
    }
    return undefined;
  }

  private getWebGLExtensions(): string[] {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return [];
      const webgl = gl as WebGLRenderingContext;
      const exts = webgl.getSupportedExtensions ? webgl.getSupportedExtensions() : [];
      return exts ? Array.from(exts) : [];
    } catch (e) {
      return [];
    }
  }

  private getWebGLBlockingMethod(): string | undefined {
    if (!this.checkWebGLContext()) {
      return 'WebGL context blocked';
    }

    const renderer = this.getWebGLRenderer();
    if (renderer?.includes('SwiftShader') || renderer?.includes('Microsoft')) {
      return 'Software rendering forced';
    }

    return undefined;
  }

  private getBaselineWidth(): number {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return 0;

      ctx.font = '14px Arial';
      return ctx.measureText('abcdefghijklmnopqrstuvwxyz').width;
    } catch (e) {
      return 0;
    }
  }

  private detectFontSpoofing(): boolean {
    // Check if font rendering seems inconsistent (sign of spoofing)
    try {
      const measurements = [];
      for (let i = 0; i < 3; i++) {
        measurements.push(this.getBaselineWidth());
      }

      // If measurements vary, might indicate spoofing
      return new Set(measurements).size > 1;
    } catch (e) {
      return false;
    }
  }

  private detectPrivacyToolSignatures(): string[] {
    const signatures: string[] = [];

    // Check for Tor Browser
    if (navigator.userAgent.includes('Firefox') &&
      !navigator.languages &&
      navigator.hardwareConcurrency === 4) {
      signatures.push('Tor Browser signature detected');
    }

    // Check for privacy extensions
    if (this.detectCanvasRandomization()) {
      signatures.push('Canvas randomization (privacy tool)');
    }

    // Check for missing APIs (blocked by privacy tools)
    if (typeof (navigator as any).deviceMemory === 'undefined') {
      signatures.push('Device memory API blocked');
    }

    return signatures;
  }

  private getColorGamut(): string | undefined {
    try {
      if (window.matchMedia('(color-gamut: p3)').matches) return 'P3';
      if (window.matchMedia('(color-gamut: srgb)').matches) return 'sRGB';
      if (window.matchMedia('(color-gamut: rec2020)').matches) return 'Rec2020';
    } catch (e) {
      return undefined;
    }
    return undefined;
  }

  private checkHDRSupport(): boolean {
    try {
      return window.matchMedia('(dynamic-range: high)').matches;
    } catch (e) {
      return false;
    }
  }

  private generateAudioFingerprint(): string | undefined {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'triangle';
      oscillator.frequency.value = 440;

      const analyser = audioContext.createAnalyser();
      oscillator.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      audioContext.close();
      return Array.from(dataArray.slice(0, 10)).join('');
    } catch (e) {
      return undefined;
    }
  }

  private checkWebGLSupport(): boolean {
    return this.checkWebGLContext();
  }

  private checkWebGL2Support(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      return gl !== null;
    } catch (e) {
      return false;
    }
  }

  private checkWebRTCSupport(): boolean {
    return typeof RTCPeerConnection !== 'undefined' ||
      typeof (window as any).webkitRTCPeerConnection !== 'undefined' ||
      typeof (window as any).mozRTCPeerConnection !== 'undefined';
  }

  // Browser-specific blocking detection methods
  private checkEdgeStrictMode(): boolean {
    // Edge strict mode detection would need specific API calls
    return false;
  }

  private checkChromeThirdPartyBlocking(): boolean {
    // Chrome third-party blocking detection
    return false;
  }

  private checkFirefoxETP(): boolean {
    // Firefox Enhanced Tracking Protection detection
    return false;
  }

  private checkBraveShields(): boolean {
    // Brave Shields detection
    return (navigator as any).brave !== undefined;
  }

  // Export methods
  public async generateReport(format: 'technical' | 'user-friendly' = 'user-friendly') {
    const detailedResult = await this.runDetailedTest();

    if (format === 'technical') {
      return this.reportGenerator.generateTechnicalReport(detailedResult);
    } else {
      return this.reportGenerator.generateUserFriendlyReport(detailedResult);
    }
  }

  public async exportReport(format: 'json' | 'markdown' | 'html' | 'csv') {
    const detailedResult = await this.runDetailedTest();
    const technicalReport = this.reportGenerator.generateTechnicalReport(detailedResult);
    return technicalReport.exportFormats[format];
  }
} 