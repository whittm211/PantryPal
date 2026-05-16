import { describe, expect, it } from 'vitest';
import { rootAppearanceAttributes } from './appearance';

describe('rootAppearanceAttributes', () => {
  it('returns root attributes for dark, large text, and high contrast modes', () => {
    expect(rootAppearanceAttributes({
      theme: 'dark',
      largeText: true,
      highContrast: true,
    })).toEqual({
      'data-pp-theme': 'dark',
      'data-pp-text': 'large',
      'data-pp-contrast': 'high',
    });
  });

  it('omits attributes for default appearance settings', () => {
    expect(rootAppearanceAttributes({
      theme: 'light',
      largeText: false,
      highContrast: false,
    })).toEqual({});
  });
});
