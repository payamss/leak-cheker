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
    const [canvasBlocked, webglBlocked, fontsDetected, pluginsDetected, audioFingerprint, batteryInfo, gamepadInfo, mediaDevices] = await Promise.all([
      this.testCanvasFingerprinting(),
      this.testWebGLFingerprinting(),
      this.detectFonts(),
      this.detectPlugins(),
      this.generateAudioFingerprint(),
      this.detectBatteryAPI(),
      this.detectGamepadAPI(),
      this.detectMediaDevices()
    ]);

    const uniquenessScore = this.calculateUniquenessScore({
      canvasBlocked,
      webglBlocked,
      fontsDetected,
      pluginsDetected,
      uniquenessScore: 0, // Will be calculated
      audioFingerprint,
      batteryInfo,
      gamepadInfo,
      mediaDevices
    });

    return {
      canvasBlocked,
      webglBlocked,
      fontsDetected,
      pluginsDetected,
      uniquenessScore,
      audioFingerprint,
      batteryInfo,
      gamepadInfo,
      mediaDevices
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

  private async generateAudioFingerprint(): Promise<string | null> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

      oscillator.type = 'triangle';
      oscillator.frequency.value = 440;
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      oscillator.start(0);

      const audioData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(audioData);

      oscillator.stop(0);
      audioContext.close();

      return Array.from(audioData.slice(0, 20)).join('');
    } catch (error) {
      return null;
    }
  }

  private async detectBatteryAPI(): Promise<any> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return {
          charging: battery.charging,
          level: Math.round(battery.level * 100),
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private async detectGamepadAPI(): Promise<any[]> {
    try {
      if ('getGamepads' in navigator) {
        const gamepads = navigator.getGamepads();
        return Array.from(gamepads)
          .filter(gamepad => gamepad !== null)
          .map(gamepad => ({
            id: gamepad?.id,
            connected: gamepad?.connected,
            buttons: gamepad?.buttons.length,
            axes: gamepad?.axes.length
          }));
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  private async detectMediaDevices(): Promise<any[]> {
    try {
      if ('mediaDevices' in navigator && 'enumerateDevices' in navigator.mediaDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.map(device => ({
          kind: device.kind,
          label: device.label || 'Unknown',
          deviceId: device.deviceId ? 'present' : 'absent'
        }));
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  private calculateUniquenessScore(result: any): number {
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

    // Audio fingerprinting (0-15 points)
    if (result.audioFingerprint) {
      score += 15;
    }

    // Battery API (0-10 points)
    if (result.batteryInfo) {
      score += 10;
    }

    // Gamepad API (0-5 points)
    if (result.gamepadInfo && result.gamepadInfo.length > 0) {
      score += 5;
    }

    // Media devices (0-10 points)
    if (result.mediaDevices && result.mediaDevices.length > 0) {
      score += Math.min(10, result.mediaDevices.length * 2);
    }

    return Math.round(score);
  }
} 