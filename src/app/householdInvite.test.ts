import { describe, expect, it } from 'vitest';
import {
  buildHouseholdInviteLink,
  createHouseholdInviteToken,
  readHouseholdInviteToken,
  removeHouseholdInviteParams,
} from './householdInvite';

describe('buildHouseholdInviteLink', () => {
  it('builds a stable invite link from the app origin and invite token', () => {
    expect(buildHouseholdInviteLink('http://127.0.0.1:5173/settings', 'invite token 1')).toBe(
      'http://127.0.0.1:5173/?invite=household&token=invite+token+1',
    );
  });

  it('trims invite tokens before adding them to the link', () => {
    expect(buildHouseholdInviteLink('https://pantrypal.example/app', '  abc123  ')).toBe(
      'https://pantrypal.example/?invite=household&token=abc123',
    );
  });
});

describe('createHouseholdInviteToken', () => {
  it('creates a compact url-safe token', () => {
    const token = createHouseholdInviteToken(() => 0);

    expect(token).toHaveLength(32);
    expect(token).toMatch(/^[a-z0-9]+$/);
  });
});

describe('readHouseholdInviteToken', () => {
  it('reads a household invite token from the current URL', () => {
    expect(readHouseholdInviteToken('http://127.0.0.1:5173/?invite=household&token=abc123')).toBe(
      'abc123',
    );
  });

  it('ignores non-household invite URLs', () => {
    expect(readHouseholdInviteToken('http://127.0.0.1:5173/?invite=recipe&token=abc123')).toBeNull();
  });
});

describe('removeHouseholdInviteParams', () => {
  it('removes invite params and keeps other query params', () => {
    expect(removeHouseholdInviteParams('http://127.0.0.1:5173/?invite=household&token=abc123&tab=home')).toBe(
      'http://127.0.0.1:5173/?tab=home',
    );
  });
});
