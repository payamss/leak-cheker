import { TrackingDetectionResult } from '../types';

export class TrackingDetector {
  private static instance: TrackingDetector;
  private knownTrackers: Set<string>;

  private constructor() {
    this.knownTrackers = new Set([
      // Analytics
      'google-analytics.com', 'googletagmanager.com', 'doubleclick.net',
      'facebook.com', 'facebook.net', 'connect.facebook.net',
      'adobe.com', 'omtrdc.net', 'demdex.net',
      'hotjar.com', 'fullstory.com', 'logrocket.com',

      // Advertising
      'googlesyndication.com', 'googleadservices.com', 'adsystem.amazon.com',
      'amazon-adsystem.com', 'bing.com', 'yahoo.com',
      'outbrain.com', 'taboola.com', 'criteo.com',

      // Social Media Widgets
      'twitter.com', 'linkedin.com', 'instagram.com',
      'youtube.com', 'tiktok.com', 'pinterest.com',

      // Other Trackers
      'segment.com', 'mixpanel.com', 'amplitude.com',
      'intercom.io', 'zendesk.com', 'drift.com'
    ]);
  }

  public static getInstance(): TrackingDetector {
    if (!TrackingDetector.instance) {
      TrackingDetector.instance = new TrackingDetector();
    }
    return TrackingDetector.instance;
  }

  public async detect(): Promise<TrackingDetectionResult> {
    const startTime = Date.now();

    try {
      const [
        thirdPartyScripts,
        trackingPixels,
        socialWidgets,
        fingerprinters,
        beacons
      ] = await Promise.all([
        this.detectThirdPartyScripts(),
        this.detectTrackingPixels(),
        this.detectSocialWidgets(),
        this.detectFingerprinters(),
        this.detectBeacons()
      ]);

      const totalTrackers = thirdPartyScripts.length + trackingPixels.length +
        socialWidgets.length + fingerprinters.length + beacons.length;

      return {
        totalTrackers,
        thirdPartyScripts,
        trackingPixels,
        socialWidgets,
        fingerprinters,
        beacons,
        trackingLevel: this.assessTrackingLevel(totalTrackers),
        testDuration: Date.now() - startTime,
        recommendations: this.generateTrackingRecommendations(totalTrackers)
      };
    } catch (error) {
      console.error('Tracking detection failed:', error);
      return {
        totalTrackers: 0,
        thirdPartyScripts: [],
        trackingPixels: [],
        socialWidgets: [],
        fingerprinters: [],
        beacons: [],
        trackingLevel: 'unknown',
        testDuration: Date.now() - startTime,
        recommendations: ['Unable to detect tracking due to error']
      };
    }
  }

  private async detectThirdPartyScripts(): Promise<string[]> {
    const scripts = document.querySelectorAll('script[src]');
    const thirdPartyScripts: string[] = [];
    const currentDomain = window.location.hostname;

    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src) {
        try {
          const url = new URL(src, window.location.origin);
          const domain = url.hostname;

          if (domain !== currentDomain && this.knownTrackers.has(domain)) {
            thirdPartyScripts.push(domain);
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });

    return [...new Set(thirdPartyScripts)];
  }

  private async detectTrackingPixels(): Promise<string[]> {
    const images = document.querySelectorAll('img');
    const pixels: string[] = [];

    images.forEach(img => {
      const src = img.src;
      const width = img.width || img.getAttribute('width');
      const height = img.height || img.getAttribute('height');

      // Detect 1x1 tracking pixels
      if ((width === 1 || width === '1') && (height === 1 || height === '1')) {
        try {
          const url = new URL(src);
          if (this.knownTrackers.has(url.hostname)) {
            pixels.push(url.hostname);
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });

    return [...new Set(pixels)];
  }

  private async detectSocialWidgets(): Promise<string[]> {
    const widgets: string[] = [];
    const socialDomains = ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com'];

    // Check for social media iframes
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const src = iframe.src;
      if (src) {
        try {
          const url = new URL(src);
          if (socialDomains.includes(url.hostname) || url.hostname.includes('facebook') ||
            url.hostname.includes('twitter') || url.hostname.includes('linkedin')) {
            widgets.push(url.hostname);
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });

    // Check for social media scripts
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src) {
        try {
          const url = new URL(src, window.location.origin);
          if (socialDomains.some(domain => url.hostname.includes(domain))) {
            widgets.push(url.hostname);
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });

    return [...new Set(widgets)];
  }

  private async detectFingerprinters(): Promise<string[]> {
    const fingerprinters: string[] = [];
    const fpDomains = ['fingerprintjs.com', 'maxmind.com', 'deviceatlas.com'];

    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src) {
        try {
          const url = new URL(src, window.location.origin);
          if (fpDomains.some(domain => url.hostname.includes(domain))) {
            fingerprinters.push(url.hostname);
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });

    return [...new Set(fingerprinters)];
  }

  private async detectBeacons(): Promise<string[]> {
    const beacons: string[] = [];

    // Monitor network requests (limited by CORS)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.name) {
              try {
                const url = new URL(entry.name);
                if (this.knownTrackers.has(url.hostname) &&
                  (entry.name.includes('beacon') || entry.name.includes('track'))) {
                  beacons.push(url.hostname);
                }
              } catch (e) {
                // Skip invalid URLs
              }
            }
          });
        });

        observer.observe({ entryTypes: ['resource'] });

        // Stop observing after a short period
        setTimeout(() => observer.disconnect(), 1000);
      } catch (e) {
        // PerformanceObserver not supported or blocked
      }
    }

    return [...new Set(beacons)];
  }

  private assessTrackingLevel(totalTrackers: number): 'minimal' | 'moderate' | 'heavy' | 'excessive' | 'unknown' {
    if (totalTrackers === 0) return 'minimal';
    if (totalTrackers <= 3) return 'moderate';
    if (totalTrackers <= 8) return 'heavy';
    return 'excessive';
  }

  private generateTrackingRecommendations(totalTrackers: number): string[] {
    const recommendations: string[] = [];

    if (totalTrackers === 0) {
      recommendations.push('Excellent! No trackers detected on this page.');
    } else if (totalTrackers <= 3) {
      recommendations.push('Moderate tracking detected. Consider using privacy extensions.');
    } else if (totalTrackers <= 8) {
      recommendations.push('Heavy tracking detected. Use uBlock Origin or similar ad blockers.');
    } else {
      recommendations.push('Excessive tracking detected! Use strong privacy tools and consider avoiding this site.');
    }

    if (totalTrackers > 0) {
      recommendations.push('Enable Enhanced Tracking Protection in your browser.');
      recommendations.push('Consider using privacy-focused browsers like Firefox or Brave.');
      recommendations.push('Install privacy extensions like Privacy Badger and ClearURLs.');
    }

    return recommendations;
  }
} 