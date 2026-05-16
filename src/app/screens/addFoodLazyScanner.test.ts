import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('AddFood barcode scanner loading', () => {
  it('does not statically import the barcode scanner bundle', () => {
    const source = readFileSync(new URL('./AddFood.tsx', import.meta.url), 'utf8');

    expect(source).not.toContain("import { BarcodeScanner } from '../components/BarcodeScanner'");
    expect(source).toContain("lazy(() => import('../components/BarcodeScanner')");
  });
});
