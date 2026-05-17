import { describe, expect, it } from 'vitest';
import { buildFunctionUrl, maskValue } from './smokeSupabase.mjs';

describe('supabase smoke helpers', () => {
  it('builds the function health url from a project ref', () => {
    expect(buildFunctionUrl('lpmgqgyyzmdpujuwovrp')).toBe(
      'https://lpmgqgyyzmdpujuwovrp.supabase.co/functions/v1/make-server-e808db2a/health',
    );
  });

  it('accepts a full Supabase url when building the health url', () => {
    expect(buildFunctionUrl('https://lpmgqgyyzmdpujuwovrp.supabase.co')).toBe(
      'https://lpmgqgyyzmdpujuwovrp.supabase.co/functions/v1/make-server-e808db2a/health',
    );
  });

  it('masks secret-ish values in messages', () => {
    expect(maskValue('abc123456789')).toBe('abc1...');
  });
});
