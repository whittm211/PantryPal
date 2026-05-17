import { describe, expect, it } from 'vitest';
import { buildChecks, buildStaticPageChecks, extractAssetUrls, normalizeBaseUrl } from './smokeProduction.mjs';

describe('production smoke helpers', () => {
  it('normalizes app urls with a trailing slash', () => {
    expect(normalizeBaseUrl('https://example.com/PantryPal')).toBe('https://example.com/PantryPal/');
  });

  it('extracts script and stylesheet assets from built html', () => {
    const html = [
      '<link rel="stylesheet" href="/PantryPal/assets/index.css">',
      '<script type="module" src="/PantryPal/assets/index.js"></script>',
    ].join('');

    expect(extractAssetUrls(html, 'https://whittm211.github.io/PantryPal/')).toEqual([
      'https://whittm211.github.io/PantryPal/assets/index.css',
      'https://whittm211.github.io/PantryPal/assets/index.js',
    ]);
  });

  it('builds page and asset checks from live html', () => {
    const checks = buildChecks(
      'https://whittm211.github.io/PantryPal/',
      '<script type="module" src="/PantryPal/assets/index.js"></script>',
    );

    expect(checks).toEqual([
      { label: 'app shell', url: 'https://whittm211.github.io/PantryPal/' },
      { label: 'privacy policy', url: 'https://whittm211.github.io/PantryPal/privacy.html' },
      { label: 'support page', url: 'https://whittm211.github.io/PantryPal/support.html' },
      { label: 'terms page', url: 'https://whittm211.github.io/PantryPal/terms.html' },
      { label: 'marketing page', url: 'https://whittm211.github.io/PantryPal/marketing.html' },
      { label: 'asset 1', url: 'https://whittm211.github.io/PantryPal/assets/index.js' },
    ]);
  });

  it('builds static page checks for App Store required public pages', () => {
    expect(buildStaticPageChecks('https://whittm211.github.io/PantryPal/')).toEqual([
      { label: 'privacy policy', url: 'https://whittm211.github.io/PantryPal/privacy.html' },
      { label: 'support page', url: 'https://whittm211.github.io/PantryPal/support.html' },
      { label: 'terms page', url: 'https://whittm211.github.io/PantryPal/terms.html' },
      { label: 'marketing page', url: 'https://whittm211.github.io/PantryPal/marketing.html' },
    ]);
  });
});
