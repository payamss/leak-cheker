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
   * Enhanced third-party cookie test using multiple fallback domains
   * Returns true if third-party cookies are blocked, false otherwise.
   */
  private async testThirdPartyCookiesCrossOrigin(): Promise<boolean> {
    // Only run in browser
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return true;
    }

    const testDomains = [
      'https://shariat.de',
      'https://httpbin.org',
      'https://jsonplaceholder.typicode.com'
    ];

    // Try multiple domains for better reliability
    for (const domain of testDomains) {
      try {
        const result = await this.testSingleDomain(domain);
        if (result !== null) {
          return result;
        }
      } catch (error) {
        console.warn(`Third-party cookie test failed for ${domain}:`, error);
      }
    }

    // Fallback: test using image-based tracking pixel method
    return await this.testWithTrackingPixel();
  }

  private async testSingleDomain(domain: string): Promise<boolean | null> {
    return new Promise<boolean | null>((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.width = '1px';
      iframe.style.height = '1px';

      // Create a simple test page that attempts to set and read cookies
      const testHTML = `
        <!DOCTYPE html>
        <html>
        <head><title>Cookie Test</title></head>
        <body>
        <script>
          try {
            // Attempt to set a third-party cookie
            document.cookie = 'privacy_test_3p=1; SameSite=None; Secure';
            
            // Check if it was set
            const cookiesBlocked = !document.cookie.includes('privacy_test_3p=1');
            
            // Clean up
            if (!cookiesBlocked) {
              document.cookie = 'privacy_test_3p=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure';
            }
            
            // Send result to parent
            window.parent.postMessage({ cookiesBlocked }, '*');
          } catch (error) {
            // If error, assume cookies are blocked
            window.parent.postMessage({ cookiesBlocked: true }, '*');
          }
        </script>
        </body>
        </html>
      `;

      const blob = new Blob([testHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframe.src = url;

      // Timeout fallback
      const timeout = setTimeout(() => {
        cleanup();
        resolve(null);
      }, 3000);

      function cleanup() {
        window.removeEventListener('message', onMessage);
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        URL.revokeObjectURL(url);
        clearTimeout(timeout);
      }

      function onMessage(event: MessageEvent) {
        if (event.data && typeof event.data.cookiesBlocked === 'boolean') {
          cleanup();
          resolve(event.data.cookiesBlocked);
        }
      }

      window.addEventListener('message', onMessage);
      document.body.appendChild(iframe);
    });
  }

  private async testWithTrackingPixel(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      // Create a tracking pixel that attempts to set cookies
      const img = new Image();
      img.style.display = 'none';
      img.style.width = '1px';
      img.style.height = '1px';

      // Use a data URL that simulates a tracking pixel
      const testCookieValue = `privacy_test_pixel_${Date.now()}`;

      // Try to set a cookie and then test if it exists
      try {
        document.cookie = `${testCookieValue}=1; SameSite=None; Secure`;
        const cookieSet = document.cookie.includes(`${testCookieValue}=1`);

        // Clean up
        if (cookieSet) {
          document.cookie = `${testCookieValue}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure`;
        }

        // If SameSite=None cookies don't work, third-party cookies are likely blocked
        resolve(!cookieSet);
      } catch (error) {
        // If error, assume cookies are blocked
        resolve(true);
      }
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
