import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildStaticPageChecks } from '../../scripts/smokeProduction.mjs';

describe('public support page', () => {
  it('ships a static browser-friendly support page for App Store review', () => {
    expect(existsSync('public/support.html')).toBe(true);

    const html = readFileSync('public/support.html', 'utf8');
    expect(html).toContain('<title>PantryPal Support</title>');
    expect(html).toContain('Getting Help');
    expect(html).toContain('Export JSON');
    expect(html).toContain('account');
    expect(html).toContain('privacy.html');
  });

  it('uses the public support page URL in App Store release prep', () => {
    const docs = readFileSync('APP_STORE_RELEASE.md', 'utf8');

    expect(docs).toContain('Support URL: `https://whittm211.github.io/PantryPal/support.html`');
    expect(docs).not.toContain('Support URL: `https://github.com/whittm211/PantryPal/issues`');
  });

  it('includes the support page in production smoke checks', () => {
    expect(buildStaticPageChecks('https://whittm211.github.io/PantryPal/')).toContainEqual({
      label: 'support page',
      url: 'https://whittm211.github.io/PantryPal/support.html',
    });
  });
});
