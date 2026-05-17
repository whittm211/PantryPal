import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildStaticPageChecks } from '../../scripts/smokeProduction.mjs';

describe('public privacy policy page', () => {
  it('ships a static browser-friendly privacy page for App Store review', () => {
    expect(existsSync('public/privacy.html')).toBe(true);

    const html = readFileSync('public/privacy.html', 'utf8');
    expect(html).toContain('<title>PantryPal Privacy Policy</title>');
    expect(html).toContain('PantryPal Privacy');
    expect(html).toContain('Supabase');
    expect(html).toContain('AI Chef');
  });

  it('uses the public privacy page URL in App Store release prep', () => {
    const docs = readFileSync('APP_STORE_RELEASE.md', 'utf8');

    expect(docs).toContain('Privacy Policy URL: `https://whittm211.github.io/PantryPal/privacy.html`');
    expect(docs).not.toContain('Privacy Policy URL: `https://whittm211.github.io/PantryPal/PRIVACY.md`');
  });

  it('includes the privacy page in production smoke checks', () => {
    expect(buildStaticPageChecks('https://whittm211.github.io/PantryPal/')).toContainEqual({
      label: 'privacy policy',
      url: 'https://whittm211.github.io/PantryPal/privacy.html',
    });
  });
});
