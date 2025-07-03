export interface BrowserInfo {
  name: string;
  version: string;
  userAgent: string;
  language: string;
  platform: string;
  doNotTrack: boolean;
}

export interface ScreenInfo {
  width: number;
  height: number;
  colorDepth: number;
  pixelRatio: number;
}

export interface HardwareInfo {
  cpuCores: number;
  deviceMemory: number;
  screen: ScreenInfo;
}

export interface CookieTestResult {
  thirdPartyCookiesBlocked: boolean;
  sameSiteNoneBlocked: boolean;
  sameSiteLaxBlocked: boolean;
  sameSiteStrictBlocked: boolean;
  localStorageBlocked: boolean;
  sessionStorageBlocked: boolean;
}

export interface FingerprintingResult {
  canvasBlocked: boolean;
  webglBlocked: boolean;
  fontsDetected: string[];
  pluginsDetected: string[];
  uniquenessScore: number;
  audioFingerprint?: string | null;
  batteryInfo?: any;
  gamepadInfo?: any[];
  mediaDevices?: any[];
}

export interface WebRTCLeakResult {
  webrtcBlocked: boolean;
  hasIPLeak: boolean;
  localIPs: string[];
  publicIPs: string[];
  webrtcSupported: boolean;
  stunServersAccessible: boolean;
  testDuration: number;
  protectionLevel: 'excellent' | 'good' | 'poor' | 'critical';
}

export interface TrackingDetectionResult {
  totalTrackers: number;
  thirdPartyScripts: string[];
  trackingPixels: string[];
  socialWidgets: string[];
  fingerprinters: string[];
  beacons: string[];
  trackingLevel: 'minimal' | 'moderate' | 'heavy' | 'excessive' | 'unknown';
  testDuration: number;
  recommendations: string[];
}

export interface PrivacyTestResult {
  browser: BrowserInfo;
  hardware: HardwareInfo;
  cookies: CookieTestResult;
  fingerprinting: FingerprintingResult;
  webrtc?: WebRTCLeakResult;
  tracking?: TrackingDetectionResult;
  privacyScore: number;
  recommendations: string[];
}

export interface TestModule {
  name: string;
  run(): Promise<any>;
}

// Enhanced interfaces with detailed debug information
export interface DetailedBrowserInfo extends BrowserInfo {
  detectionMethod: string;
  isIncognito?: boolean;
  browserEngine: string;
  renderingEngine: string;
  javaScriptEngine: string;
  detectedExtensions: string[];
}

export interface DetailedHardwareInfo extends HardwareInfo {
  spoofingDetected: {
    cpuCores: boolean;
    deviceMemory: boolean;
    screenResolution: boolean;
  };
  actualValues: {
    estimatedCpuCores?: number;
    estimatedMemory?: number;
    estimatedScreen?: string;
  };
  fingerprintingRisk: 'low' | 'medium' | 'high';
}

export interface DetailedCookieTestResult extends CookieTestResult {
  testDetails: {
    sameSiteTests: {
      none: { attempted: boolean; successful: boolean; error?: string };
      lax: { attempted: boolean; successful: boolean; error?: string };
      strict: { attempted: boolean; successful: boolean; error?: string };
    };
    storageTests: {
      localStorage: { available: boolean; quota?: number; error?: string };
      sessionStorage: { available: boolean; quota?: number; error?: string };
      indexedDB: { available: boolean; error?: string };
    };
    crossSiteIndicators: string[];
  };
  browserSpecificBlocking: {
    edgeStrictMode?: boolean;
    chromeThirdPartyBlocking?: boolean;
    firefoxETP?: boolean;
    braveShieldsActive?: boolean;
  };
}

export interface DetailedFingerprintingResult extends FingerprintingResult {
  testDetails: {
    canvas: {
      testPattern: string;
      imageData: string;
      randomizationDetected: boolean;
      blockingMethod?: string;
    };
    webgl: {
      contextAvailable: boolean;
      renderer?: string;
      vendor?: string;
      extensions?: string[];
      shaderPrecision?: string;
      blockingMethod?: string;
    };
    fonts: {
      testMethod: string;
      baselineWidth: number;
      detectedFonts: Array<{
        name: string;
        width: number;
        difference: number;
      }>;
      spoofingDetected: boolean;
    };
    plugins: {
      enumerationBlocked: boolean;
      detectedPlugins: Array<{
        name: string;
        filename?: string;
        description?: string;
        version?: string;
      }>;
    };
  };
  privacyToolSignatures: string[];
  advancedFingerprinting: {
    audioContext?: string;
    timezone: string;
    language: string[];
    cpuClass?: string;
    platform: string;
    touchSupport: boolean;
    colorGamut?: string;
    hdr?: boolean;
  };
}

export interface ScoreBreakdown {
  total: number;
  maxPossible: number;
  percentage: number;
  components: {
    browser: { score: number; max: number; reason: string };
    cookies: { score: number; max: number; reason: string };
    fingerprinting: { score: number; max: number; reason: string };
    hardware: { score: number; max: number; reason: string };
    doNotTrack: { score: number; max: number; reason: string };
  };
  penalties: Array<{ reason: string; points: number }>;
  bonuses: Array<{ reason: string; points: number }>;
}

export interface TechnicalRecommendation {
  category: 'critical' | 'important' | 'suggested' | 'informational';
  title: string;
  description: string;
  technicalDetails: string;
  implementation: {
    browserSettings?: string[];
    extensions?: string[];
    code?: string;
    advanced?: string[];
  };
  impact: {
    privacyGain: number;
    usabilityImpact: 'none' | 'low' | 'medium' | 'high';
    breakageRisk: 'none' | 'low' | 'medium' | 'high';
  };
}

export interface DetailedPrivacyTestResult {
  // Basic results (user-friendly)
  userFriendly: PrivacyTestResult;

  // Detailed technical data
  detailed: {
    browser: DetailedBrowserInfo;
    hardware: DetailedHardwareInfo;
    cookies: DetailedCookieTestResult;
    fingerprinting: DetailedFingerprintingResult;
    scoreBreakdown: ScoreBreakdown;
    technicalRecommendations: TechnicalRecommendation[];
  };

  // Test metadata
  metadata: {
    testVersion: string;
    timestamp: string;
    testDuration: number;
    userAgent: string;
    testEnvironment: {
      protocol: string;
      hostname: string;
      port: string;
      isSecureContext: boolean;
    };
    browserCapabilities: {
      webgl: boolean;
      webgl2: boolean;
      serviceWorkers: boolean;
      webAssembly: boolean;
      webRTC: boolean;
    };
  };

  // Raw data for debugging
  rawData: {
    allCookies: string;
    navigatorObject: any;
    screenObject: any;
    canvasFingerprint: string;
    webglFingerprint: string;
    audioFingerprint?: string;
  };
}

// Report formats
export interface TechnicalReport {
  summary: {
    overallScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    majorIssues: string[];
    testsPassed: number;
    testsFailed: number;
    totalTests: number;
  };
  detailedResults: DetailedPrivacyTestResult;
  exportFormats: {
    json: string;
    markdown: string;
    html: string;
    csv: string;
  };
}

export interface UserFriendlyReport {
  displayData: PrivacyTestResult;
  visualElements: {
    scoreColor: string;
    riskBadges: Array<{
      test: string;
      status: 'good' | 'warning' | 'risk';
      color: string;
      icon: string;
    }>;
    recommendations: Array<{
      category: string;
      items: string[];
      priority: 'high' | 'medium' | 'low';
    }>;
  };
} 