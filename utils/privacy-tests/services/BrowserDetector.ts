import { BrowserInfo } from '../types';

// Extend Navigator interface for Brave detection
declare global {
  interface Navigator {
    brave?: any;
  }
}

export class BrowserDetector {
  private static instance: BrowserDetector;

  public static getInstance(): BrowserDetector {
    if (!BrowserDetector.instance) {
      BrowserDetector.instance = new BrowserDetector();
    }
    return BrowserDetector.instance;
  }

  public async detect(): Promise<BrowserInfo> {
    const userAgent = navigator.userAgent;
    const name = await this.detectBrowserName(userAgent);
    const version = this.detectVersion(userAgent, name);

    return {
      name,
      version,
      userAgent,
      language: navigator.language || 'unknown',
      platform: navigator.platform || 'unknown',
      doNotTrack: this.getDoNotTrackStatus()
    };
  }

  private async detectBrowserName(userAgent: string): Promise<string> {
    // Check in order of specificity - most specific first
    if (userAgent.includes('Edg/')) {
      return 'Microsoft Edge';
    }

    if (userAgent.includes('Chrome')) {
      // Check for Brave after Edge but before Chrome
      if (await this.isBrave()) {
        return 'Brave';
      }
      return 'Chrome';
    }

    if (userAgent.includes('Firefox')) {
      // Check for Tor Browser
      if (this.isTorBrowser()) {
        return 'Tor Browser';
      }
      return 'Firefox';
    }

    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'Safari';
    }

    return 'Unknown';
  }

  private async isBrave(): Promise<boolean> {
    try {
      // Use Brave-specific API detection
      if (navigator.brave) {
        return true;
      }

      // Alternative detection method
      const braveCheck = new Promise((resolve) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.onload = () => {
          try {
            const isBrave = iframe.contentWindow?.navigator?.brave !== undefined;
            document.body.removeChild(iframe);
            resolve(isBrave);
          } catch {
            document.body.removeChild(iframe);
            resolve(false);
          }
        };
        document.body.appendChild(iframe);

        // Timeout fallback
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          resolve(false);
        }, 100);
      });

      return await braveCheck as boolean;
    } catch {
      return false;
    }
  }

  private isTorBrowser(): boolean {
    // Tor Browser specific detection
    return navigator.userAgent.includes('Firefox') &&
      (navigator.userAgent.includes('Gecko') &&
        !navigator.userAgent.includes('Chrome'));
  }

  private detectVersion(userAgent: string, browserName: string): string {
    let match: RegExpMatchArray | null = null;

    switch (browserName) {
      case 'Microsoft Edge':
        match = userAgent.match(/Edg\/([0-9.]+)/);
        break;
      case 'Chrome':
      case 'Brave':
        match = userAgent.match(/Chrome\/([0-9.]+)/);
        break;
      case 'Firefox':
      case 'Tor Browser':
        match = userAgent.match(/Firefox\/([0-9.]+)/);
        break;
      case 'Safari':
        match = userAgent.match(/Version\/([0-9.]+)/);
        break;
    }

    return match ? match[1] : 'unknown';
  }

  private getDoNotTrackStatus(): boolean {
    const dnt = navigator.doNotTrack ||
      (window as any).doNotTrack ||
      (navigator as any).msDoNotTrack;

    return dnt === '1' || dnt === 'yes';
  }
} 