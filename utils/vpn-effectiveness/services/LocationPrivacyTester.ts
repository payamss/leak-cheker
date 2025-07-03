import type { VPNTestModule, VPNTestResult, LocationTestResult } from '../types';

export class LocationPrivacyTester implements VPNTestModule {
  public readonly name = 'Location Privacy';

  public async run(): Promise<VPNTestResult[]> {
    const results: VPNTestResult[] = [];

    try {
      const [geolocationTest, timezoneTest] = await Promise.all([
        this.testGeolocationPrivacy(),
        this.testTimezonePrivacy()
      ]);

      results.push(
        this.createGeolocationResult(geolocationTest),
        this.createTimezoneResult(timezoneTest)
      );

    } catch (error) {
      results.push(this.createErrorResult(error));
    }

    return results;
  }

  private async testGeolocationPrivacy(): Promise<{ isBlocked: boolean; accuracy?: number; error?: string }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          isBlocked: true,
          error: 'Geolocation API not available'
        });
        return;
      }

      const timeout = setTimeout(() => {
        resolve({
          isBlocked: true,
          error: 'Geolocation request timed out'
        });
      }, 5000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          resolve({
            isBlocked: false,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          clearTimeout(timeout);
          resolve({
            isBlocked: true,
            error: error.message
          });
        },
        {
          timeout: 5000,
          enableHighAccuracy: false,
          maximumAge: 0
        }
      );
    });
  }

  private async testTimezonePrivacy(): Promise<{ isConsistent: boolean; timezone: string; offset: number }> {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();

    // Check if timezone is consistent with common VPN endpoints
    const commonVPNTimezones = [
      'UTC',
      'America/New_York',
      'Europe/London',
      'Europe/Amsterdam',
      'Asia/Singapore',
      'Australia/Sydney'
    ];

    const isConsistent = commonVPNTimezones.includes(timezone);

    return {
      isConsistent,
      timezone,
      offset
    };
  }

  private createGeolocationResult(test: { isBlocked: boolean; accuracy?: number; error?: string }): VPNTestResult {
    return {
      testName: 'Geolocation Privacy',
      status: test.isBlocked ? 'pass' : 'warning',
      score: test.isBlocked ? 20 : 10,
      maxScore: 20,
      description: 'Tests if your real location is hidden',
      details: test.isBlocked
        ? `Geolocation blocked: ${test.error || 'Access denied'}`
        : `Geolocation accessible with accuracy: ${test.accuracy}m`,
      recommendation: test.isBlocked
        ? undefined
        : 'Block geolocation requests in browser settings or use location spoofing',
      critical: false
    };
  }

  private createTimezoneResult(test: { isConsistent: boolean; timezone: string; offset: number }): VPNTestResult {
    const offsetHours = Math.abs(test.offset / 60);
    const offsetSign = test.offset > 0 ? '-' : '+';

    return {
      testName: 'Timezone Privacy',
      status: test.isConsistent ? 'pass' : 'warning',
      score: test.isConsistent ? 10 : 5,
      maxScore: 10,
      description: 'Checks if timezone reveals real location',
      details: `Timezone: ${test.timezone} (UTC${offsetSign}${offsetHours}) ${test.isConsistent ? '- common VPN timezone' : '- may reveal location'}`,
      recommendation: test.isConsistent
        ? undefined
        : 'Consider using timezone spoofing extensions or VPN with timezone masking',
      critical: false
    };
  }

  private createErrorResult(error: unknown): VPNTestResult {
    return {
      testName: 'Location Privacy Tests',
      status: 'unknown',
      score: 0,
      maxScore: 30,
      description: 'Failed to run location privacy tests',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      critical: false
    };
  }
} 