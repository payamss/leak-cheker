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
}

export interface PrivacyTestResult {
  browser: BrowserInfo;
  hardware: HardwareInfo;
  cookies: CookieTestResult;
  fingerprinting: FingerprintingResult;
  privacyScore: number;
  recommendations: string[];
}

export interface TestModule {
  name: string;
  run(): Promise<any>;
} 