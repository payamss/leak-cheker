import { PrivacyTestResult, BrowserInfo, CookieTestResult, FingerprintingResult } from '../types';

export class PrivacyScorer {
  private static instance: PrivacyScorer;

  public static getInstance(): PrivacyScorer {
    if (!PrivacyScorer.instance) {
      PrivacyScorer.instance = new PrivacyScorer();
    }
    return PrivacyScorer.instance;
  }

  public calculateScore(result: PrivacyTestResult): number {
    let score = 0;

    // Browser baseline score (0-20 points)
    score += this.getBrowserBaseScore(result.browser);

    // Cookie protection (0-30 points)
    score += this.getCookieProtectionScore(result.cookies);

    // Fingerprinting protection (0-40 points)  
    score += this.getFingerprintingProtectionScore(result.fingerprinting);

    // Do Not Track bonus (0-10 points)
    if (result.browser.doNotTrack) {
      score += 10;
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  public generateRecommendations(result: PrivacyTestResult): string[] {
    const recommendations: string[] = [];

    // Browser-specific recommendations
    if (result.browser.name === 'Microsoft Edge' || result.browser.name === 'Chrome') {
      recommendations.push('Consider switching to a privacy-focused browser like Firefox or Brave');
    }

    // Cookie recommendations
    if (!result.cookies.thirdPartyCookiesBlocked) {
      recommendations.push('Enable third-party cookie blocking in your browser settings');
    }

    if (!result.cookies.localStorageBlocked && result.privacyScore < 70) {
      recommendations.push('Consider using private browsing mode for better privacy');
    }

    // Fingerprinting recommendations
    if (!result.fingerprinting.canvasBlocked) {
      recommendations.push('Install a canvas blocking extension like CanvasBlocker');
    }

    if (!result.fingerprinting.webglBlocked) {
      recommendations.push('Consider disabling WebGL in your browser settings');
    }

    if (result.fingerprinting.fontsDetected.length > 15) {
      recommendations.push('Use a browser that limits font enumeration for better privacy');
    }

    // Do Not Track
    if (!result.browser.doNotTrack) {
      recommendations.push('Enable "Do Not Track" in your browser privacy settings');
    }

    // General recommendations based on score
    if (result.privacyScore < 30) {
      recommendations.push('Your privacy is severely compromised. Consider using Tor Browser for maximum privacy');
    } else if (result.privacyScore < 60) {
      recommendations.push('Install privacy extensions like uBlock Origin and Privacy Badger');
    }

    return recommendations;
  }

  private getBrowserBaseScore(browser: BrowserInfo): number {
    // Higher scores for privacy-focused browsers
    switch (browser.name.toLowerCase()) {
      case 'tor browser':
        return 20;
      case 'brave':
        return 15;
      case 'firefox':
        return 12;
      case 'safari':
        return 8;
      case 'microsoft edge':
        return 5;
      case 'chrome':
        return 3;
      default:
        return 0;
    }
  }

  private getCookieProtectionScore(cookies: CookieTestResult): number {
    let score = 0;

    // Third-party cookies blocked (+15 points)
    if (cookies.thirdPartyCookiesBlocked) {
      score += 15;
    }

    // SameSite cookie policies (+5 points each when blocked)
    if (cookies.sameSiteNoneBlocked) score += 5;
    if (cookies.sameSiteLaxBlocked) score += 2;
    if (cookies.sameSiteStrictBlocked) score += 1;

    // Storage protection (+7 points total)
    if (cookies.localStorageBlocked) score += 4;
    if (cookies.sessionStorageBlocked) score += 3;

    return score;
  }

  private getFingerprintingProtectionScore(fingerprinting: FingerprintingResult): number {
    let score = 0;

    // Canvas fingerprinting blocked (+20 points)
    if (fingerprinting.canvasBlocked) {
      score += 20;
    }

    // WebGL fingerprinting blocked (+15 points)
    if (fingerprinting.webglBlocked) {
      score += 15;
    }

    // Font enumeration protection (0-5 points based on font count)
    const fontCount = fingerprinting.fontsDetected.length;
    const fontScore = Math.max(0, 5 - (fontCount / 5));
    score += fontScore;

    // Plugin enumeration protection (0-5 points based on plugin count)
    const pluginCount = fingerprinting.pluginsDetected.length;
    const pluginScore = Math.max(0, 5 - pluginCount);
    score += pluginScore;

    return score;
  }
} 