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
   * Real third-party cookie test using actual cross-origin requests
   * Returns true if third-party cookies are blocked, false otherwise.
   */
  private async testThirdPartyCookiesCrossOrigin(): Promise<boolean> {
    // Only run in browser
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return true;
    }

    try {
      // Method 1: Use shariat.de (primary test - most reliable)
      const shariatTest = await this.testWithShariatDe();
      if (shariatTest !== null) {
        return shariatTest;
      }

      // Method 2: Fallback to httpbin.org cross-origin test
      const crossOriginTest = await this.testWithRealCrossOriginIframe();
      if (crossOriginTest !== null) {
        return crossOriginTest;
      }

      // Method 3: Use fetch to test if cookies are sent in cross-origin requests
      const fetchTest = await this.testCrossOriginFetch();
      if (fetchTest !== null) {
        return fetchTest;
      }

      // Method 4: Browser feature detection as final fallback
      return this.detectThirdPartyCookieBlocking();
    } catch (error) {
      console.warn('All third-party cookie tests failed, assuming blocked:', error);
      return true; // Assume blocked if all tests fail
    }
  }

  private async testWithShariatDe(): Promise<boolean | null> {
    return new Promise<boolean | null>((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.width = '1px';
      iframe.style.height = '1px';

      // Use the established shariat.de cookie test page
      const thirdPartyOrigin = 'https://shariat.de';
      iframe.src = `${thirdPartyOrigin}/cookie-checker.html`;

      // Timeout fallback (assume blocked if no response in 3s)
      const timeout = setTimeout(() => {
        cleanup();
        resolve(null); // Test inconclusive
      }, 3000);

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

  private async testWithRealCrossOriginIframe(): Promise<boolean | null> {
    return new Promise<boolean | null>((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.width = '1px';
      iframe.style.height = '1px';

      // Use a real external domain that cooperates with cookie testing
      // This is a simple page that tries to set a cookie and reports back
      iframe.src = 'https://httpbin.org/cookies/set/privacy_test/1';

      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(null); // Test inconclusive
        }
      }, 5000);

      function cleanup() {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
        clearTimeout(timeout);
      }

      iframe.onload = () => {
        if (!resolved) {
          resolved = true;
          cleanup();

          // Try to make a follow-up request to see if cookies were set
          fetch('https://httpbin.org/cookies', {
            method: 'GET',
            credentials: 'include' // Include cookies in cross-origin request
          })
            .then(response => response.json())
            .then(data => {
              // If cookies are blocked, the privacy_test cookie won't be there
              const cookiesBlocked = !data.cookies || !data.cookies.privacy_test;
              resolve(cookiesBlocked);
            })
            .catch(() => {
              resolve(null); // Test failed, inconclusive
            });
        }
      };

      iframe.onerror = () => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(null); // Test failed, inconclusive
        }
      };

      document.body.appendChild(iframe);
    });
  }

  private async testCrossOriginFetch(): Promise<boolean | null> {
    try {
      // First, try to set a cookie via a cross-origin request
      await fetch('https://httpbin.org/cookies/set/fetch_test/1', {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
      });

      // Then check if the cookie was actually set and sent back
      const response = await fetch('https://httpbin.org/cookies', {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
      });

      const data = await response.json();

      // If third-party cookies are blocked, the cookie won't be there
      const cookiesBlocked = !data.cookies || !data.cookies.fetch_test;
      return cookiesBlocked;
    } catch (error) {
      // Network error or CORS issue, test inconclusive
      return null;
    }
  }

  private detectThirdPartyCookieBlocking(): boolean {
    // Browser feature detection as fallback
    try {
      // Check for known privacy settings and browser behaviors

      // Chrome's third-party cookie blocking
      if ('cookieStore' in window) {
        // Modern browsers with cookie store API
        return true; // Assume blocking in modern privacy-conscious browsers
      }

      // Firefox Enhanced Tracking Protection
      if (navigator.userAgent.includes('Firefox')) {
        // Firefox typically blocks third-party cookies in strict mode
        return true;
      }

      // Safari's Intelligent Tracking Prevention
      if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
        return true; // Safari blocks third-party cookies by default
      }

      // Brave browser
      if ((navigator as any).brave || navigator.userAgent.includes('Brave')) {
        return true; // Brave blocks third-party cookies by default
      }

      // Edge privacy features
      if (navigator.userAgent.includes('Edg/')) {
        return false; // Edge allows third-party cookies by default (but this is changing)
      }

      // Try to detect if we're in a private browsing mode
      if (this.isPrivateBrowsing()) {
        return true; // Private browsing typically blocks third-party cookies
      }

      // Test SameSite=None behavior as a proxy
      return !this.testSameSiteCookie('None');
    } catch (error) {
      return false; // If detection fails, assume not blocked
    }
  }

  private isPrivateBrowsing(): boolean {
    try {
      // Various methods to detect private browsing

      // Test 1: Storage quota in private mode is usually much lower
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
          return (estimate.quota || 0) < 50 * 1024 * 1024; // Less than 50MB suggests private mode
        });
      }

      // Test 2: IndexedDB behavior in private mode
      if ('indexedDB' in window) {
        try {
          const request = indexedDB.open('test');
          request.onerror = () => true; // Error opening IndexedDB suggests private mode
        } catch (e) {
          return true;
        }
      }

      // Test 3: WebRTC in private mode often behaves differently
      if ('RTCPeerConnection' in window) {
        try {
          const pc = new RTCPeerConnection();
          pc.close();
          return false; // WebRTC available, probably not private mode
        } catch (e) {
          return true; // WebRTC blocked, might be private mode
        }
      }

      return false;
    } catch (error) {
      return false;
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
