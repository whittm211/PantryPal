import { describe, expect, it } from 'vitest';
import {
  buildHouseholdStateUpsert,
  buildUserStateUpsert,
  isSharedCloudStateKey,
  shouldApplyCloudState,
} from './cloudState';

describe('buildUserStateUpsert', () => {
  it('builds a conflict-safe user_state row with a fresh updated_at value', () => {
    expect(buildUserStateUpsert('user-1', 'pp:pantry', [{ id: 'milk' }], new Date('2026-05-15T10:30:00Z'))).toEqual({
      user_id: 'user-1',
      key: 'pp:pantry',
      value: [{ id: 'milk' }],
      updated_at: '2026-05-15T10:30:00.000Z',
    });
  });
});

describe('buildHouseholdStateUpsert', () => {
  it('builds rows keyed by household and state key', () => {
    const now = new Date('2026-05-15T12:00:00.000Z');

    expect(buildHouseholdStateUpsert('household-1', 'user-1', 'pp:pantry', [{ id: 'milk' }], now)).toEqual({
      household_id: 'household-1',
      key: 'pp:pantry',
      value: [{ id: 'milk' }],
      updated_by: 'user-1',
      updated_at: '2026-05-15T12:00:00.000Z',
    });
  });
});

describe('isSharedCloudStateKey', () => {
  it('shares household data but keeps personal settings user-scoped', () => {
    expect(isSharedCloudStateKey('pp:pantry')).toBe(true);
    expect(isSharedCloudStateKey('pp:groceries')).toBe(true);
    expect(isSharedCloudStateKey('pp:mealPlan')).toBe(true);
    expect(isSharedCloudStateKey('pp:theme')).toBe(false);
    expect(isSharedCloudStateKey('pp:notifs')).toBe(false);
  });
});

describe('shouldApplyCloudState', () => {
  it('applies cloud state when the cloud row is newer than the last local edit', () => {
    expect(shouldApplyCloudState('2026-05-15T12:00:05.000Z', 1000)).toBe(true);
  });

  it('keeps local state when there are newer unsynced local edits', () => {
    expect(shouldApplyCloudState('2026-05-15T12:00:00.000Z', Date.parse('2026-05-15T12:00:05.000Z'))).toBe(false);
  });

  it('applies cloud state when there has not been a local edit', () => {
    expect(shouldApplyCloudState('2026-05-15T12:00:00.000Z', null)).toBe(true);
  });
});
