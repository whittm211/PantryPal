export const CLOUD_SYNC_STATUS_EVENT = 'pp:cloud-sync-status';
export const CLOUD_SYNC_NOW_EVENT = 'pp:cloud-sync-now';

export type CloudSyncPhase = 'syncing' | 'synced' | 'error';
export type CloudSyncScope = 'user' | 'household';

export type CloudSyncStatusDetail = {
  key: string;
  phase: CloudSyncPhase;
  at: number;
  scope?: CloudSyncScope;
  message?: string;
};

export type CloudSyncStatusMap = Record<string, CloudSyncStatusDetail>;

export type CloudSyncSummary = {
  tone: 'neutral' | 'green' | 'red' | 'yellow' | 'blue' | 'brown';
  title: string;
  detail: string;
  lastSyncedAt?: number;
};

const SYNC_STALE_MS = 10_000;
const KEY_LABELS: Record<string, string> = {
  'pp:cookHistory': 'Cooking history',
  'pp:dietPrefs': 'Diet preferences',
  'pp:favorites': 'Favorites',
  'pp:groceries': 'Grocery list',
  'pp:haptics': 'Haptics',
  'pp:highContrast': 'High contrast',
  'pp:history': 'Purchase history',
  'pp:household': 'Household',
  'pp:householdType': 'Household type',
  'pp:largeText': 'Large text',
  'pp:mealPlan': 'Meal plan',
  'pp:notifs': 'Notifications',
  'pp:pantry': 'Pantry',
  'pp:reminderPrefs': 'Reminder preferences',
  'pp:theme': 'Theme',
  'pp:userMeals': 'Custom recipes',
};

export function emitCloudSyncStatus(detail: CloudSyncStatusDetail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<CloudSyncStatusDetail>(CLOUD_SYNC_STATUS_EVENT, { detail }));
}

export function emitCloudSyncNow() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CLOUD_SYNC_NOW_EVENT));
}

export function summarizeCloudSync(statuses: CloudSyncStatusMap, cloudEnabled: boolean, now = Date.now()): CloudSyncSummary {
  if (!cloudEnabled) {
    return {
      tone: 'neutral',
      title: 'Local only',
      detail: 'Sign in to sync pantry data across devices.',
    };
  }

  const values = Object.values(statuses);
  if (values.length === 0) {
    return {
      tone: 'blue',
      title: 'Cloud sync ready',
      detail: 'Changes will sync after you edit your data.',
    };
  }

  const failed = values.filter((status) => status.phase === 'error');
  if (failed.length > 0) {
    return {
      tone: 'red',
      title: 'Sync failed',
      detail: `${failed.length} data group${failed.length === 1 ? '' : 's'} need${failed.length === 1 ? 's' : ''} attention.`,
    };
  }

  const syncing = values.filter((status) => status.phase === 'syncing');
  const lastSyncedAt = latestSyncedAt(values);
  if (syncing.length > 0) {
    const stale = syncing.filter((status) => now - status.at > SYNC_STALE_MS);
    if (stale.length > 0) {
      return {
        tone: 'brown',
        title: 'Sync taking longer',
        detail: `${stale.length} data group${stale.length === 1 ? ' is' : 's are'} still uploading.`,
        lastSyncedAt,
      };
    }

    return {
      tone: 'yellow',
      title: 'Syncing changes',
      detail: `${syncing.length} data group${syncing.length === 1 ? ' is' : 's are'} uploading.`,
      lastSyncedAt,
    };
  }

  return {
    tone: 'green',
    title: 'Synced',
    detail: `${values.length} data group${values.length === 1 ? ' is' : 's are'} up to date.`,
    lastSyncedAt,
  };
}

export function formatLastSynced(at: number, now = Date.now()) {
  const elapsedMs = Math.max(0, now - at);
  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  if (elapsedMinutes < 1) return 'just now';
  if (elapsedMinutes < 60) return `${elapsedMinutes} min ago`;

  return new Date(at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function cloudSyncDetailRows(statuses: CloudSyncStatusMap) {
  return Object.values(statuses)
    .map((status) => ({
      key: status.key,
      label: KEY_LABELS[status.key] ?? status.key.replace(/^pp:/, ''),
      phase: status.phase,
      at: status.at,
      scope: status.scope ?? 'user',
      scopeLabel: (status.scope ?? 'user') === 'household' ? 'Shared household' : 'Personal',
      message: status.message,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function latestSyncedAt(values: CloudSyncStatusDetail[]) {
  const syncedAt = values
    .filter((status) => status.phase === 'synced')
    .map((status) => status.at);
  return syncedAt.length > 0 ? Math.max(...syncedAt) : undefined;
}
