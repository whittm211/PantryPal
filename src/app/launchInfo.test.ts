import { describe, expect, it } from 'vitest';
import { launchInfoItems, launchInfoSummary } from './launchInfo';

describe('launchInfoItems', () => {
  it('covers local guest data, cloud sync, and support', () => {
    const text = launchInfoSummary(launchInfoItems).toLowerCase();

    expect(text).toContain('guest');
    expect(text).toContain('local browser storage');
    expect(text).toContain('supabase');
    expect(text).toContain('support');
  });
});
