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
      thirdPartyCookiesBlocked: await this.testThirdPartyCookiesCrossOrigin(),
      sameSiteNoneBlocked: !this.testSameSiteCookie('None'),
      sameSiteLaxBlocked: !this.testSameSiteCookie('Lax'),
      sameSiteStrictBlocked: !this.testSameSiteCookie('Strict'),
      localStorageBlocked: !this.testLocalStorage(),
      sessionStorageBlocked: !this.testSessionStorage()
    };
  }

  /**
   * Real third-party cookie test using a cross-origin iframe (e.g., shariat.de/cookie-checker.html)
   * Returns true if third-party cookies are blocked, false otherwise.
   */
  private async testThirdPartyCookiesCrossOrigin(): Promise<boolean> {
    // Only run in browser
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return true;
    }

    return new Promise<boolean>((resolve) => {
      const thirdPartyOrigin = 'https://shariat.de';
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `${thirdPartyOrigin}/cookie-checker.html`;

      // Timeout fallback (assume blocked if no response in 2s)
      const timeout = setTimeout(() => {
        cleanup();
        resolve(true);
      }, 2000);

      function cleanup() {
        window.removeEventListener('message', onMessage);
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        clearTimeout(timeout);
      }

      function onMessage(event: MessageEvent) {
        if (event.origin !== thirdPartyOrigin) return;
        if (event.data && typeof event.data.cookiesBlocked === 'boolean') {
          cleanup();
          resolve(event.data.cookiesBlocked);
        }
      }

      window.addEventListener('message', onMessage);
      document.body.appendChild(iframe);
    });
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
