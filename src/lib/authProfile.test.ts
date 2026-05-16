import { describe, expect, it } from 'vitest';
import { buildAuthProfileMetadata, normalizeAuthProfileName } from './authProfile';

describe('buildAuthProfileMetadata', () => {
  it('stores the display name under common Supabase profile metadata keys', () => {
    expect(buildAuthProfileMetadata('  Alex   Lee  ')).toEqual({
      display_name: 'Alex Lee',
      full_name: 'Alex Lee',
      name: 'Alex Lee',
    });
  });

  it('normalizes extra whitespace in profile names', () => {
    expect(normalizeAuthProfileName('  Taylor   Morgan  ')).toBe('Taylor Morgan');
  });
});
