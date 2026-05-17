import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildStaticPageChecks } from '../../scripts/smokeProduction.mjs';

describe('public marketing page', () => {
  it('ships a static browser-friendly marketing page for App Store Connect', () => {
    expect(existsSync('public/marketing.html')).toBe(true);

    const html = readFileSync('public/marketing.html', 'utf8');
    expect(html).toContain('<title>PantryPal</title>');
    expect(html).toContain('Smart pantry tracking and meal ideas');
    expect(html).toContain('Pantry tracking');
    expect(html).toContain('AI Chef');
    expect(html).toContain('Fridge Rescue');
    expect(html).toContain('Grocery lists');
    expect(html).toContain('Household preferences');
    expect(html).toContain('./privacy.html');
    expect(html).toContain('./support.html');
    expect(html).toContain('./terms.html');
  });

  it('documents the public marketing URL in App Store release prep', () => {
    const docs = readFileSync('APP_STORE_RELEASE.md', 'utf8');

    expect(docs).toContain('Marketing URL: `https://whittm211.github.io/PantryPal/marketing.html`');
    expect(docs).not.toContain('Marketing URL: leave blank');
  });

  it('includes the marketing page in production smoke checks', () => {
    expect(buildStaticPageChecks('https://whittm211.github.io/PantryPal/')).toContainEqual({
      label: 'marketing page',
      url: 'https://whittm211.github.io/PantryPal/marketing.html',
    });
  });
});
