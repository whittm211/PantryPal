import { describe, expect, it } from 'vitest';
import { buildAuthRedirectUrl } from './authRedirect';

describe('buildAuthRedirectUrl', () => {
  it('keeps the GitHub Pages base path in auth redirects', () => {
    expect(buildAuthRedirectUrl('https://whittm211.github.io', '/PantryPal/')).toBe(
      'https://whittm211.github.io/PantryPal/',
    );
  });

  it('uses the site origin when deployed at the root', () => {
    expect(buildAuthRedirectUrl('https://pantrypal.example', '/')).toBe('https://pantrypal.example/');
  });
});
