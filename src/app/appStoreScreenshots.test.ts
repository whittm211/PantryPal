import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('app store screenshot plan', () => {
  it('documents the required App Store screenshot scenes and capture sizes', () => {
    const docs = readFileSync('APP_STORE_SCREENSHOTS.md', 'utf8');

    expect(docs).toContain('1290 x 2796');
    expect(docs).toContain('1179 x 2556');
    expect(docs).toContain('Welcome');
    expect(docs).toContain('Home dashboard');
    expect(docs).toContain('Pantry');
    expect(docs).toContain('AI Chef');
    expect(docs).toContain('Fridge Rescue');
    expect(docs).toContain('Grocery list');
    expect(docs).toContain('Plans');
  });

  it('keeps screenshot prep linked from the release worksheet', () => {
    const releaseDocs = readFileSync('APP_STORE_RELEASE.md', 'utf8');

    expect(releaseDocs).toContain('APP_STORE_SCREENSHOTS.md');
    expect(releaseDocs).toContain('Screenshot Plan');
  });
});
