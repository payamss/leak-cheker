import { CookieTestResult } from '../types';

export class CookieTester {
  private static instance: CookieTester;

  public static getInstance(): CookieTester {
    if (!CookieTester.instance) {
      CookieTester.instance = new CookieTester();
    }
    return CookieTester.instance;
  }

  public async test(): Promise<CookieTestResult> {
    return {
      thirdPartyCookiesBlocked: await this.testThirdPartyCookies(),
      sameSiteNoneBlocked: !this.testSameSiteCookie('None'),
      sameSiteLaxBlocked: !this.testSameSiteCookie('Lax'),
      sameSiteStrictBlocked: !this.testSameSiteCookie('Strict'),
      localStorageBlocked: !this.testLocalStorage(),
      sessionStorageBlocked: !this.testSessionStorage()
    };
  }

  private async testThirdPartyCookies(): Promise<boolean> {
    try {
      // Test if third-party cookies are blocked
      const testCookie = 'privacy_test_3p=1; SameSite=None; Secure';
      document.cookie = testCookie;

      // Check if cookie was set
      const wasSet = document.cookie.includes('privacy_test_3p=1');

      // Clean up
      if (wasSet) {
        document.cookie = 'privacy_test_3p=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure';
      }

      return !wasSet;
    } catch {
      return true; // If error, assume blocked
    }
  }

  private testSameSiteCookie(sameSite: string): boolean {
    try {
      const testName = `privacy_test_${sameSite.toLowerCase()}`;
      const testValue = '1';
      const cookieString = `${testName}=${testValue}; SameSite=${sameSite}${sameSite === 'None' ? '; Secure' : ''}`;

      document.cookie = cookieString;
      const wasSet = document.cookie.includes(`${testName}=${testValue}`);

      // Clean up
      if (wasSet) {
        document.cookie = `${testName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=${sameSite}${sameSite === 'None' ? '; Secure' : ''}`;
      }

      return wasSet;
    } catch {
      return false;
    }
  }

  private testLocalStorage(): boolean {
    try {
      const testKey = 'privacy_test_ls';
      const testValue = 'test';

      localStorage.setItem(testKey, testValue);
      const wasSet = localStorage.getItem(testKey) === testValue;

      // Clean up
      if (wasSet) {
        localStorage.removeItem(testKey);
      }

      return wasSet;
    } catch {
      return false;
    }
  }

  private testSessionStorage(): boolean {
    try {
      const testKey = 'privacy_test_ss';
      const testValue = 'test';

      sessionStorage.setItem(testKey, testValue);
      const wasSet = sessionStorage.getItem(testKey) === testValue;

      // Clean up
      if (wasSet) {
        sessionStorage.removeItem(testKey);
      }

      return wasSet;
    } catch {
      return false;
    }
  }
} 