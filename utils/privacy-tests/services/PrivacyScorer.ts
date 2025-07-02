import { PrivacyTestResult, BrowserInfo, CookieTestResult, FingerprintingResult, HardwareInfo } from '../types';

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

    // Hardware fingerprinting protection (0-15 points)
    score += this.getHardwareProtectionScore(result.hardware, result.browser);

    // Do Not Track bonus (0-10 points)
    if (result.browser.doNotTrack) {
      score += 10;
    }

    // Scale to 100 (total possible: 115 points)
    const scaledScore = (score / 115) * 100;
    return Math.min(100, Math.max(0, Math.round(scaledScore)));
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

    // Hardware fingerprinting recommendations
    if (result.hardware.cpuCores > 16 || result.hardware.deviceMemory > 16) {
      recommendations.push('Your real hardware specs are exposed. Use a browser with hardware fingerprinting protection');
    }

    // General recommendations based on score
    if (result.privacyScore < 30) {
      recommendations.push('Your privacy is severely compromised. Consider using Tor Browser for maximum privacy');
    } else if (result.privacyScore < 60) {
      recommendations.push('Install privacy extensions like uBlock Origin and Privacy Badger');
    } else if (result.privacyScore >= 80) {
      recommendations.push('Excellent privacy protection! Keep using these settings');
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
    if (fontCount === 0) {
      // No fonts detected = excellent protection
      score += 5;
    } else if (fontCount < 5) {
      // Very few fonts = good protection
      score += 4;
    } else if (fontCount < 10) {
      // Some fonts = moderate protection
      score += 3;
    } else if (fontCount < 15) {
      // Many fonts = poor protection
      score += 1;
    }
    // fontCount >= 15 = no additional points (worst case)

    // Plugin enumeration protection (0-5 points based on plugin count)
    const pluginCount = fingerprinting.pluginsDetected.length;
    if (pluginCount === 0) {
      // No plugins detected = excellent protection
      score += 5;
    } else if (pluginCount <= 2) {
      // Very few plugins = good protection
      score += 3;
    } else if (pluginCount <= 5) {
      // Some plugins = moderate protection
      score += 1;
    }
    // pluginCount > 5 = no additional points (worst case)

    return score;
  }

  private getHardwareProtectionScore(hardware: HardwareInfo, browser: BrowserInfo): number {
    let score = 0;

    // Detect if hardware fingerprinting is being limited/spoofed

    // CPU core spoofing detection (+5 points)
    // Common spoofed values: 4, 8, 10 cores instead of actual high counts
    if (hardware.cpuCores <= 10 && hardware.cpuCores % 2 === 0) {
      score += 5; // Likely spoofed to common value
    }

    // Memory spoofing detection (+5 points)  
    // Common spoofed values: 4GB, 8GB instead of actual high amounts
    if (hardware.deviceMemory <= 8 && [2, 4, 8].includes(hardware.deviceMemory)) {
      score += 5; // Likely spoofed to common value
    }

    // Screen resolution spoofing (+5 points)
    // Common spoofed resolutions or unusual aspect ratios
    const { width, height } = hardware.screen;
    const commonResolutions = [
      [1920, 1080], [1366, 768], [1536, 864], [1440, 900],
      [1680, 1050], [1280, 720], [1600, 900]
    ];

    const isCommonRes = commonResolutions.some(([w, h]) => w === width && h === height);
    if (isCommonRes) {
      score += 3; // Using common resolution (might be spoofed)
    }

    // Bonus for incognito/private mode (better hardware protection)
    const userAgent = browser.userAgent.toLowerCase();
    if (userAgent.includes('brave') || browser.name.toLowerCase().includes('brave')) {
      score += 2; // Brave typically has better fingerprinting protection
    }

    return Math.min(15, score);
  }
} 