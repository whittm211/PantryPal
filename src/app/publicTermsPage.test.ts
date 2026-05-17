import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildStaticPageChecks } from '../../scripts/smokeProduction.mjs';

describe('public terms page', () => {
  it('ships a static browser-friendly terms page for subscriptions and app review', () => {
    expect(existsSync('public/terms.html')).toBe(true);

    const html = readFileSync('public/terms.html', 'utf8');
    expect(html).toContain('<title>PantryPal Terms of Service</title>');
    expect(html).toContain('PantryPal Terms');
    expect(html).toContain('not medical, nutrition, allergy, or dietary advice');
    expect(html).toContain('PantryPal Plus');
    expect(html).toContain('Restore purchases');
    expect(html).toContain('privacy.html');
    expect(html).toContain('support.html');
  });

  it('documents the public terms URL in App Store release prep', () => {
    const docs = readFileSync('APP_STORE_RELEASE.md', 'utf8');

    expect(docs).toContain('Terms URL: `https://whittm211.github.io/PantryPal/terms.html`');
  });

  it('includes the terms page in production smoke checks', () => {
    expect(buildStaticPageChecks('https://whittm211.github.io/PantryPal/')).toContainEqual({
      label: 'terms page',
      url: 'https://whittm211.github.io/PantryPal/terms.html',
    });
  });
});
