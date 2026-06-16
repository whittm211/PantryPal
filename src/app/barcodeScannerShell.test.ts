import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('barcode scanner mobile shell', () => {
  it('uses the rear camera and a viewport-level overlay', () => {
    const source = readFileSync('src/app/components/BarcodeScanner.tsx', 'utf8');

    expect(source).toContain('decodeFromConstraints');
    expect(source).toContain("facingMode: { ideal: 'environment' }");
    expect(source).toContain("position: 'fixed'");
    expect(source).toContain('env(safe-area-inset-top)');
    expect(source).toContain('env(safe-area-inset-bottom)');
  });

  it('provides a manual barcode fallback', () => {
    const source = readFileSync('src/app/components/BarcodeScanner.tsx', 'utf8');

    expect(source).toContain('manualCode');
    expect(source).toContain('Enter barcode manually');
    expect(source).toContain('Use manual barcode');
  });

  it('uses native barcode detection when the device browser supports it', () => {
    const source = readFileSync('src/app/components/BarcodeScanner.tsx', 'utf8');

    expect(source).toContain('BarcodeDetector');
    expect(source).toContain('startNativeBarcodeDetection');
    expect(source).toContain('startZxingBarcodeDetection');
  });
});
