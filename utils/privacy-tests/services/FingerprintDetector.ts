import { FingerprintingResult } from '../types';

export class FingerprintDetector {
  private static instance: FingerprintDetector;

  public static getInstance(): FingerprintDetector {
    if (!FingerprintDetector.instance) {
      FingerprintDetector.instance = new FingerprintDetector();
    }
    return FingerprintDetector.instance;
  }

  public async detect(): Promise<FingerprintingResult> {
    const [canvasBlocked, webglBlocked, fontsDetected, pluginsDetected] = await Promise.all([
      this.testCanvasFingerprinting(),
      this.testWebGLFingerprinting(),
      this.detectFonts(),
      this.detectPlugins()
    ]);

    const uniquenessScore = this.calculateUniquenessScore({
      canvasBlocked,
      webglBlocked,
      fontsDetected,
      pluginsDetected,
      uniquenessScore: 0 // Will be calculated
    });

    return {
      canvasBlocked,
      webglBlocked,
      fontsDetected,
      pluginsDetected,
      uniquenessScore
    };
  }

  private async testCanvasFingerprinting(): Promise<boolean> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return true;

      // Draw test pattern
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Privacy test 🔒', 2, 2);

      const imageData1 = canvas.toDataURL();

      // Draw again with slight variation
      ctx.fillText('Privacy test 🔒', 2, 2);
      const imageData2 = canvas.toDataURL();

      // If canvas is blocked/randomized, results will differ
      return imageData1 !== imageData2;
    } catch {
      return true; // If error, assume blocked
    }
  }

  private async testWebGLFingerprinting(): Promise<boolean> {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;

      if (!gl) return true;

      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);

      // Check for common privacy tool signatures
      const blockedSignatures = [
        'generic-fake',
        'fake',
        'blocked',
        'privacy',
        'tor'
      ];

      const rendererStr = (renderer || '').toString().toLowerCase();
      const vendorStr = (vendor || '').toString().toLowerCase();

      return blockedSignatures.some(sig =>
        rendererStr.includes(sig) || vendorStr.includes(sig)
      );
    } catch {
      return true; // If error, assume blocked
    }
  }

  private async detectFonts(): Promise<string[]> {
    const commonFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
      'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
      'Trebuchet MS', 'Arial Black', 'Impact', 'Lucida Console',
      'Tahoma', 'Geneva', 'Monaco', 'Lucida Sans Unicode',
      'Century Gothic', 'Franklin Gothic Medium', 'Calibri',
      'Cambria', 'Consolas', 'Segoe UI', 'Candara'
    ];

    const detectedFonts: string[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return detectedFonts;

    // Baseline measurement with default font
    ctx.font = '72px monospace';
    const baselineWidth = ctx.measureText('Privacy Test Font Detection').width;

    for (const font of commonFonts) {
      try {
        ctx.font = `72px ${font}, monospace`;
        const width = ctx.measureText('Privacy Test Font Detection').width;

        // If width differs from baseline, font is available
        if (Math.abs(width - baselineWidth) > 1) {
          detectedFonts.push(font);
        }
      } catch {
        // Skip fonts that cause errors
        continue;
      }
    }

    return detectedFonts;
  }

  private async detectPlugins(): Promise<string[]> {
    const plugins: string[] = [];

    try {
      if (navigator.plugins && navigator.plugins.length > 0) {
        for (let i = 0; i < navigator.plugins.length; i++) {
          const plugin = navigator.plugins[i];
          if (plugin && plugin.name) {
            plugins.push(plugin.name);
          }
        }
      }
    } catch {
      // If plugins are blocked, return empty array
    }

    return plugins;
  }

  private calculateUniquenessScore(result: FingerprintingResult): number {
    let score = 0;

    // Canvas fingerprinting (0-30 points)
    if (!result.canvasBlocked) {
      score += 30;
    }

    // WebGL fingerprinting (0-25 points)
    if (!result.webglBlocked) {
      score += 25;
    }

    // Font count (0-25 points)
    const fontCount = result.fontsDetected.length;
    score += Math.min(25, fontCount * 1.2);

    // Plugin count (0-20 points)
    const pluginCount = result.pluginsDetected.length;
    score += Math.min(20, pluginCount * 4);

    return Math.round(score);
  }
} 