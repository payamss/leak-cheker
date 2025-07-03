export interface VPNTestResult {
  testName: string;
  status: 'pass' | 'fail' | 'warning' | 'unknown';
  score: number;
  maxScore: number;
  description: string;
  details: string;
  recommendation?: string;
  critical: boolean;
}

export interface VPNTestCategory {
  categoryName: string;
  tests: VPNTestResult[];
  categoryScore: number;
  maxCategoryScore: number;
  criticalIssues: number;
}

export interface VPNEffectivenessResult {
  overallScore: number;
  maxPossibleScore: number;
  overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  vpnStatus: 'excellent' | 'good' | 'poor' | 'critical' | 'unknown';
  categories: {
    ipProtection: VPNTestCategory;
    dnsProtection: VPNTestCategory;
    locationPrivacy: VPNTestCategory;
    advancedPrivacy: VPNTestCategory;
  };
  summary: {
    totalTests: number;
    testsPassed: number;
    testsFailed: number;
    testsWarning: number;
    criticalIssues: number;
  };
  recommendations: {
    immediate: string[];
    important: string[];
    suggested: string[];
  };
  metadata: {
    testDuration: number;
    timestamp: string;
    userAgent: string;
    vpnDetected: boolean;
    estimatedLocation?: {
      country?: string;
      region?: string;
      city?: string;
    };
  };
}

export interface VPNDetectionResult {
  detected: boolean;
  confidence: number;
  indicators: string[];
  location?: {
    country?: string;
    region?: string;
    city?: string;
    isp?: string;
  };
}

export interface IPTestResult {
  publicIP?: string;
  isVPNIP: boolean;
  hasWebRTCLeak: boolean;
  hasIPv6Leak: boolean;
  leakedIPs: string[];
  details: string;
}

export interface DNSTestResult {
  hasLeak: boolean;
  dnsServers: string[];
  isDoHEnabled: boolean;
  details: string;
}

export interface LocationTestResult {
  geolocationBlocked: boolean;
  timezoneConsistent: boolean;
  details: string;
}

export interface PrivacyTestResult {
  fingerprintingBlocked: boolean;
  trackingBlocked: boolean;
  details: string;
}

// Interface for test modules (Single Responsibility)
export interface VPNTestModule {
  name: string;
  run(): Promise<VPNTestResult[]>;
}

// Interface for scoring system (Open/Closed)
export interface VPNScorer {
  calculateScore(results: VPNTestResult[]): number;
  calculateGrade(score: number, maxScore: number): string;
}

// Interface for recommendation system (Dependency Inversion)
export interface VPNRecommendationEngine {
  generateRecommendations(results: VPNTestResult[], vpnDetected: boolean): {
    immediate: string[];
    important: string[];
    suggested: string[];
  };
} 