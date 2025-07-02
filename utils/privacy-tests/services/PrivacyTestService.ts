import { PrivacyTestResult } from '../types';
import { BrowserDetector } from './BrowserDetector';
import { HardwareDetector } from './HardwareDetector';
import { CookieTester } from './CookieTester';
import { FingerprintDetector } from './FingerprintDetector';
import { PrivacyScorer } from './PrivacyScorer';

export class PrivacyTestService {
  private static instance: PrivacyTestService;

  private browserDetector: BrowserDetector;
  private hardwareDetector: HardwareDetector;
  private cookieTester: CookieTester;
  private fingerprintDetector: FingerprintDetector;
  private privacyScorer: PrivacyScorer;

  private constructor() {
    this.browserDetector = BrowserDetector.getInstance();
    this.hardwareDetector = HardwareDetector.getInstance();
    this.cookieTester = CookieTester.getInstance();
    this.fingerprintDetector = FingerprintDetector.getInstance();
    this.privacyScorer = PrivacyScorer.getInstance();
  }

  public static getInstance(): PrivacyTestService {
    if (!PrivacyTestService.instance) {
      PrivacyTestService.instance = new PrivacyTestService();
    }
    return PrivacyTestService.instance;
  }

  public async runCompleteTest(): Promise<PrivacyTestResult> {
    try {
      // Run all tests in parallel for better performance
      const [browser, hardware, cookies, fingerprinting] = await Promise.all([
        this.browserDetector.detect(),
        Promise.resolve(this.hardwareDetector.detect()),
        this.cookieTester.test(),
        this.fingerprintDetector.detect()
      ]);

      // Create initial result object
      const result: PrivacyTestResult = {
        browser,
        hardware,
        cookies,
        fingerprinting,
        privacyScore: 0, // Will be calculated
        recommendations: []
      };

      // Calculate privacy score
      result.privacyScore = this.privacyScorer.calculateScore(result);

      // Generate recommendations
      result.recommendations = this.privacyScorer.generateRecommendations(result);

      return result;
    } catch (error) {
      console.error('Privacy test failed:', error);
      throw new Error('Failed to complete privacy test');
    }
  }

  public async runBrowserTest() {
    return await this.browserDetector.detect();
  }

  public runHardwareTest() {
    return this.hardwareDetector.detect();
  }

  public async runCookieTest() {
    return await this.cookieTester.test();
  }

  public async runFingerprintTest() {
    return await this.fingerprintDetector.detect();
  }
} 