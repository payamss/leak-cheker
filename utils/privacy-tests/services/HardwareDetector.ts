import { HardwareInfo, ScreenInfo } from '../types';

export class HardwareDetector {
  private static instance: HardwareDetector;

  public static getInstance(): HardwareDetector {
    if (!HardwareDetector.instance) {
      HardwareDetector.instance = new HardwareDetector();
    }
    return HardwareDetector.instance;
  }

  public detect(): HardwareInfo {
    return {
      cpuCores: this.getCpuCores(),
      deviceMemory: this.getDeviceMemory(),
      screen: this.getScreenInfo()
    };
  }

  private getCpuCores(): number {
    return navigator.hardwareConcurrency || 4;
  }

  private getDeviceMemory(): number {
    // Device memory in GB, with fallback
    return (navigator as any).deviceMemory || 4;
  }

  private getScreenInfo(): ScreenInfo {
    return {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1
    };
  }
} 