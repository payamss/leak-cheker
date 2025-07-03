// Main service
export { VPNEffectivenessService } from './services/VPNEffectivenessService';

// Individual test modules
export { IPProtectionTester } from './services/IPProtectionTester';
export { DNSProtectionTester } from './services/DNSProtectionTester';
export { LocationPrivacyTester } from './services/LocationPrivacyTester';
export { AdvancedPrivacyTester } from './services/AdvancedPrivacyTester';

// Utility services
export { VPNScoringService } from './services/VPNScorer';
export { VPNRecommendationService } from './services/VPNRecommendationEngine';

// Types
export type {
  VPNTestResult,
  VPNTestCategory,
  VPNEffectivenessResult,
  VPNDetectionResult,
  IPTestResult,
  DNSTestResult,
  LocationTestResult,
  PrivacyTestResult,
  VPNTestModule,
  VPNScorer,
  VPNRecommendationEngine
} from './types'; 