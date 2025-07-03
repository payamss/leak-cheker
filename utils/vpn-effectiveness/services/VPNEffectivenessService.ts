import type {
  VPNEffectivenessResult,
  VPNTestCategory,
  VPNDetectionResult
} from '../types';

import { IPProtectionTester } from './IPProtectionTester';
import { DNSProtectionTester } from './DNSProtectionTester';
import { LocationPrivacyTester } from './LocationPrivacyTester';
import { AdvancedPrivacyTester } from './AdvancedPrivacyTester';
import { VPNScoringService } from './VPNScorer';
import { VPNRecommendationService } from './VPNRecommendationEngine';

export class VPNEffectivenessService {
  private static instance: VPNEffectivenessService;

  private readonly ipTester: IPProtectionTester;
  private readonly dnsTester: DNSProtectionTester;
  private readonly locationTester: LocationPrivacyTester;
  private readonly privacyTester: AdvancedPrivacyTester;
  private readonly scorer: VPNScoringService;
  private readonly recommendationEngine: VPNRecommendationService;

  private constructor() {
    // Dependency injection for easy testing and maintenance
    this.ipTester = new IPProtectionTester();
    this.dnsTester = new DNSProtectionTester();
    this.locationTester = new LocationPrivacyTester();
    this.privacyTester = new AdvancedPrivacyTester();
    this.scorer = new VPNScoringService();
    this.recommendationEngine = new VPNRecommendationService();
  }

  public static getInstance(): VPNEffectivenessService {
    if (!VPNEffectivenessService.instance) {
      VPNEffectivenessService.instance = new VPNEffectivenessService();
    }
    return VPNEffectivenessService.instance;
  }

  public async runComprehensiveVPNTest(): Promise<VPNEffectivenessResult> {
    const startTime = Date.now();

    try {
      // Run all test modules in parallel for efficiency
      const [
        ipResults,
        dnsResults,
        locationResults,
        privacyResults,
        vpnDetection
      ] = await Promise.all([
        this.ipTester.run(),
        this.dnsTester.run(),
        this.locationTester.run(),
        this.privacyTester.run(),
        this.detectVPNUsage()
      ]);

      // Create test categories
      const categories = {
        ipProtection: this.createCategory('IP Protection', ipResults),
        dnsProtection: this.createCategory('DNS Protection', dnsResults),
        locationPrivacy: this.createCategory('Location Privacy', locationResults),
        advancedPrivacy: this.createCategory('Advanced Privacy', privacyResults)
      };

      // Calculate overall metrics
      const allResults = [
        ...ipResults,
        ...dnsResults,
        ...locationResults,
        ...privacyResults
      ];

      const overallScore = this.scorer.calculateScore(allResults);
      const maxPossibleScore = this.scorer.calculateMaxScore(allResults);
      const summary = this.scorer.calculateSummary(allResults);
      const recommendations = this.recommendationEngine.generateRecommendations(
        allResults,
        vpnDetection.detected
      );

      return {
        overallScore,
        maxPossibleScore,
        overallGrade: this.scorer.calculateGrade(overallScore, maxPossibleScore),
        vpnStatus: this.scorer.determineVPNStatus(overallScore, maxPossibleScore, summary.criticalIssues),
        categories,
        summary,
        recommendations,
        metadata: {
          testDuration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          vpnDetected: vpnDetection.detected,
          estimatedLocation: vpnDetection.location
        }
      };

    } catch (error) {
      console.error('VPN effectiveness test failed:', error);
      throw new Error(`Failed to run VPN effectiveness test: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createCategory(categoryName: string, results: any[]): VPNTestCategory {
    const categoryScoring = this.scorer.calculateCategoryScore(results);

    return {
      categoryName,
      tests: results,
      categoryScore: categoryScoring.categoryScore,
      maxCategoryScore: categoryScoring.maxCategoryScore,
      criticalIssues: categoryScoring.criticalIssues
    };
  }

  private async detectVPNUsage(): Promise<VPNDetectionResult> {
    try {
      // Use multiple detection methods for better accuracy
      const [ipInfo, dnsInfo] = await Promise.all([
        this.getIPInfo(),
        this.getDNSInfo()
      ]);

      let confidence = 0;
      const indicators: string[] = [];

      // Check IP-based indicators
      if (ipInfo) {
        if (ipInfo.org && this.isVPNOrganization(ipInfo.org)) {
          confidence += 40;
          indicators.push(`Organization: ${ipInfo.org}`);
        }

        if (ipInfo.hosting && ipInfo.hosting === true) {
          confidence += 30;
          indicators.push('Hosting/Datacenter IP');
        }

        if (ipInfo.proxy && ipInfo.proxy === true) {
          confidence += 50;
          indicators.push('Proxy detected');
        }
      }

      // Check DNS-based indicators
      if (dnsInfo && dnsInfo.location) {
        // If DNS location differs significantly from IP location
        if (ipInfo && ipInfo.country !== dnsInfo.location) {
          confidence += 20;
          indicators.push('DNS/IP location mismatch');
        }
      }

      return {
        detected: confidence > 50,
        confidence: Math.min(confidence, 100),
        indicators,
        location: ipInfo ? {
          country: ipInfo.country_name,
          region: ipInfo.region,
          city: ipInfo.city,
          isp: ipInfo.org
        } : undefined
      };

    } catch (error) {
      return {
        detected: false,
        confidence: 0,
        indicators: ['Detection failed']
      };
    }
  }

  private async getIPInfo(): Promise<any> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  private async getDNSInfo(): Promise<{ location?: string }> {
    try {
      const response = await fetch('https://1.1.1.1/cdn-cgi/trace');
      const text = await response.text();
      const lines = text.split('\n');
      const locationLine = lines.find(line => line.startsWith('loc='));

      return {
        location: locationLine ? locationLine.split('=')[1] : undefined
      };
    } catch (error) {
      return {};
    }
  }

  private isVPNOrganization(org: string): boolean {
    const vpnKeywords = [
      'vpn', 'proxy', 'private', 'tunnel', 'shield',
      'secure', 'anonymous', 'digital ocean', 'linode',
      'aws', 'azure', 'google cloud', 'hosting'
    ];

    const orgLower = org.toLowerCase();
    return vpnKeywords.some(keyword => orgLower.includes(keyword));
  }

  // Additional utility methods
  public async runQuickVPNCheck(): Promise<{
    vpnDetected: boolean;
    ipAddress: string;
    location: string;
    confidence: number;
  }> {
    try {
      const [ipInfo, detection] = await Promise.all([
        this.getIPInfo(),
        this.detectVPNUsage()
      ]);

      return {
        vpnDetected: detection.detected,
        ipAddress: ipInfo?.ip || 'Unknown',
        location: ipInfo ? `${ipInfo.city}, ${ipInfo.country_name}` : 'Unknown',
        confidence: detection.confidence
      };
    } catch (error) {
      throw new Error('Failed to perform quick VPN check');
    }
  }

  public getBestPractices() {
    return this.recommendationEngine.generateVPNBestPractices();
  }

  public getProtocolRecommendations() {
    return this.recommendationEngine.generateProtocolRecommendations();
  }
} 