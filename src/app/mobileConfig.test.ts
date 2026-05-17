import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import capacitorConfig from '../../capacitor.config';

describe('mobile config', () => {
  it('uses the PantryPal mobile app id and web build output', () => {
    expect(capacitorConfig.appId).toBe('com.whittm211.pantrypal');
    expect(capacitorConfig.appName).toBe('PantryPal');
    expect(capacitorConfig.webDir).toBe('dist');
  });

  it('keeps local dev server clear for store builds', () => {
    expect(capacitorConfig.server).toBeUndefined();
  });

  it('declares camera permission for Android barcode scanning', () => {
    const manifest = readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');

    expect(manifest).toContain('android.permission.CAMERA');
  });

  it('declares iOS camera usage text for barcode scanning', () => {
    const plist = readFileSync('ios/App/App/Info.plist', 'utf8');

    expect(plist).toContain('NSCameraUsageDescription');
    expect(plist).toContain('scan barcodes');
  });
});
