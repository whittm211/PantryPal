import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('google play release readiness worksheet', () => {
  it('captures the Google Play listing fields PantryPal needs before internal testing', () => {
    const docs = readFileSync('GOOGLE_PLAY_RELEASE.md', 'utf8');

    expect(docs).toContain('Package name: `com.whittm211.pantrypal`');
    expect(docs).toContain('App name: `PantryPal`');
    expect(docs).toContain('Short description');
    expect(docs).toContain('Full description');
    expect(docs).toContain('Feature graphic');
    expect(docs).toContain('Phone screenshots');
  });

  it('keeps Google Play data safety and subscription review details explicit', () => {
    const docs = readFileSync('GOOGLE_PLAY_RELEASE.md', 'utf8');

    expect(docs).toContain('Data safety');
    expect(docs).toContain('Supabase');
    expect(docs).toContain('Internal testing');
    expect(docs).toContain('Google Play Billing');
    expect(docs).toContain('pantrypal_plus_monthly');
    expect(docs).toContain('APP_STORE_RELEASE.md');
  });
});
