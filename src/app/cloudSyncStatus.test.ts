import { describe, expect, it } from 'vitest';
import { cloudSyncDetailRows, formatLastSynced, summarizeCloudSync, type CloudSyncStatusMap } from './cloudSyncStatus';

describe('summarizeCloudSync', () => {
  it('shows local-only status when cloud sync is unavailable', () => {
    expect(summarizeCloudSync({}, false)).toEqual({
      tone: 'neutral',
      title: 'Local only',
      detail: 'Sign in to sync pantry data across devices.',
    });
  });

  it('shows ready status before any cloud events have fired', () => {
    expect(summarizeCloudSync({}, true)).toEqual({
      tone: 'blue',
      title: 'Cloud sync ready',
      detail: 'Changes will sync after you edit your data.',
    });
  });

  it('prioritizes sync failures', () => {
    const statuses: CloudSyncStatusMap = {
      'pp:pantry': { key: 'pp:pantry', phase: 'synced', at: 100 },
      'pp:groceries': { key: 'pp:groceries', phase: 'error', at: 200, message: 'RLS blocked' },
    };

    expect(summarizeCloudSync(statuses, true)).toEqual({
      tone: 'red',
      title: 'Sync failed',
      detail: '1 data group needs attention.',
    });
  });

  it('shows syncing while any key is in flight', () => {
    const statuses: CloudSyncStatusMap = {
      'pp:pantry': { key: 'pp:pantry', phase: 'syncing', at: 100 },
      'pp:groceries': { key: 'pp:groceries', phase: 'synced', at: 90 },
    };

    expect(summarizeCloudSync(statuses, true, 5000)).toEqual({
      tone: 'yellow',
      title: 'Syncing changes',
      detail: '1 data group is uploading.',
      lastSyncedAt: 90,
    });
  });

  it('shows a long-running state when syncing takes too long', () => {
    const statuses: CloudSyncStatusMap = {
      'pp:pantry': { key: 'pp:pantry', phase: 'syncing', at: 100 },
      'pp:groceries': { key: 'pp:groceries', phase: 'synced', at: 90 },
    };

    expect(summarizeCloudSync(statuses, true, 11_000)).toEqual({
      tone: 'brown',
      title: 'Sync taking longer',
      detail: '1 data group is still uploading.',
      lastSyncedAt: 90,
    });
  });

  it('summarizes synced keys', () => {
    const statuses: CloudSyncStatusMap = {
      'pp:pantry': { key: 'pp:pantry', phase: 'synced', at: 100 },
      'pp:groceries': { key: 'pp:groceries', phase: 'synced', at: 200 },
    };

    expect(summarizeCloudSync(statuses, true)).toEqual({
      tone: 'green',
      title: 'Synced',
      detail: '2 data groups are up to date.',
      lastSyncedAt: 200,
    });
  });

  it('formats the last synced timestamp for the settings card', () => {
    const now = new Date('2026-05-15T12:00:00Z').getTime();

    expect(formatLastSynced(now - 10_000, now)).toBe('just now');
    expect(formatLastSynced(now - 120_000, now)).toBe('2 min ago');
  });

  it('builds readable detail rows for synced data groups', () => {
    const statuses: CloudSyncStatusMap = {
      'pp:pantry': { key: 'pp:pantry', phase: 'synced', at: 100, scope: 'household' },
      'pp:userMeals': { key: 'pp:userMeals', phase: 'error', at: 200, message: 'No access' },
    };

    expect(cloudSyncDetailRows(statuses)).toEqual([
      {
        key: 'pp:userMeals',
        label: 'Custom recipes',
        phase: 'error',
        at: 200,
        message: 'No access',
        scope: 'user',
        scopeLabel: 'Personal',
      },
      {
        key: 'pp:pantry',
        label: 'Pantry',
        phase: 'synced',
        at: 100,
        message: undefined,
        scope: 'household',
        scopeLabel: 'Shared household',
      },
    ]);
  });
});
