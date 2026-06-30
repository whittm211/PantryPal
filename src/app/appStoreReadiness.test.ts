import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('app store readiness worksheet', () => {
  it('captures the App Store listing fields PantryPal needs before TestFlight', () => {
    const docs = readFileSync('APP_STORE_RELEASE.md', 'utf8');

    expect(docs).toContain('Bundle ID: `com.whittm211.pantrypal`');
    expect(docs).toContain('App name: `PantryPal`');
    expect(docs).toContain('Subtitle');
    expect(docs).toContain('Keywords');
    expect(docs).toContain('Support URL');
    expect(docs).toContain('Privacy Policy URL');
    expect(docs).toContain('Screenshots');
  });

  it('keeps privacy and subscription review details explicit for mobile release', () => {
    const docs = readFileSync('APP_STORE_RELEASE.md', 'utf8');

    expect(docs).toContain('Data Types');
    expect(docs).toContain('Supabase');
    expect(docs).toContain('Auto-renewable subscription');
    expect(docs).toContain('PantryPal Plus');
    expect(docs).toContain('Restore purchases');
    expect(docs).toContain('Apple Developer Program is active');
  });
});
