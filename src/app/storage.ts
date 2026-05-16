import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { hasCloudMigrated, markCloudMigrated } from './cloudMigration';
import {
  buildHouseholdStateUpsert,
  buildUserStateUpsert,
  isSharedCloudStateKey,
  shouldApplyCloudState,
} from './cloudState';
import { CLOUD_SYNC_NOW_EVENT, emitCloudSyncStatus, type CloudSyncPhase } from './cloudSyncStatus';
import {
  createSupabaseHouseholdCloudStore,
  HOUSEHOLD_MEMBERSHIP_CHANGED_EVENT,
} from './householdCloud';

// Mirrors the original localStorage API while syncing authenticated users to
// Supabase. Household-scoped data moves to `household_state` once a membership
// exists; personal settings stay in `user_state`.

const PUSH_DEBOUNCE_MS = 600;

export function usePersistedState<T>(
  key: string,
  initial: T,
): [T, (v: T | ((p: T) => T)) => void] {
  const { user, mode } = useAuth();
  const [value, setValue] = useState<T>(() => readLocal(key, initial));
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const hydrated = useRef(false);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestValue = useRef(value);
  const localEditedAt = useRef<number | null>(null);
  const sharedKey = isSharedCloudStateKey(key);

  useEffect(() => {
    latestValue.current = value;
  }, [value]);

  useEffect(() => {
    if (mode !== 'authenticated' || !user || !sharedKey) {
      setHouseholdId(null);
      return;
    }

    let cancelled = false;
    async function refreshMembership() {
      const store = createSupabaseHouseholdCloudStore(supabase);
      try {
        const membership = await store.getMembership(user.id);
        if (!cancelled) setHouseholdId(membership?.householdId ?? null);
      } catch (error) {
        if (!cancelled) setHouseholdId(null);
        console.warn(`[cloud-state] household membership lookup failed for ${key}:`, error);
      }
    }

    refreshMembership();
    window.addEventListener(HOUSEHOLD_MEMBERSHIP_CHANGED_EVENT, refreshMembership);
    return () => {
      cancelled = true;
      window.removeEventListener(HOUSEHOLD_MEMBERSHIP_CHANGED_EVENT, refreshMembership);
    };
  }, [key, mode, sharedKey, user?.id]);

  // Pull from cloud on sign-in, and again when a household membership appears.
  useEffect(() => {
    if (mode !== 'authenticated' || !user) {
      hydrated.current = true;
      return;
    }

    let cancelled = false;
    hydrated.current = false;
    emitScopedCloudSyncStatus(key, 'syncing', householdId);

    (async () => {
      const scope = cloudScope(user.id, sharedKey ? householdId : null);
      const { data, error } = await pullCloudValue(scope, key);

      if (cancelled) return;
      if (error) {
        console.warn(`[cloud-state] pull failed for ${key}:`, error.message);
        emitScopedCloudSyncStatus(key, 'error', householdId, error.message);
        hydrated.current = true;
        return;
      }

      if (data?.value !== undefined && data.value !== null && shouldApplyCloudState(data.updated_at, localEditedAt.current)) {
        localEditedAt.current = null;
        setValue(data.value as T);
        writeLocal(key, data.value as T);
        emitScopedCloudSyncStatus(key, 'synced', householdId);
      } else if (!hasCloudMigrated(localStorage, scope.id, key)) {
        const local = readLocal<T>(key, initial);
        const { error: pushError } = await pushCloudValue(user.id, key, local, householdId);
        if (pushError) {
          console.warn(`[cloud-state] initial push failed for ${key}:`, pushError.message);
          emitScopedCloudSyncStatus(key, 'error', householdId, pushError.message);
        } else {
          localEditedAt.current = null;
          markCloudMigrated(localStorage, scope.id, key);
          emitScopedCloudSyncStatus(key, 'synced', householdId);
        }
      } else {
        emitScopedCloudSyncStatus(key, 'synced', householdId);
      }

      hydrated.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, mode, key, sharedKey, householdId]);

  useEffect(() => {
    if (mode !== 'authenticated' || !user || !sharedKey || !householdId) return;

    const refreshFromHousehold = () => {
      if (!hydrated.current) return;
      emitScopedCloudSyncStatus(key, 'syncing', householdId);
      const scope = cloudScope(user.id, householdId);
      pullCloudValue(scope, key).then(({ data, error }) => {
        if (error) {
          emitScopedCloudSyncStatus(key, 'error', householdId, error.message);
          return;
        }
        if (data?.value !== undefined && data.value !== null && shouldApplyCloudState(data.updated_at, localEditedAt.current)) {
          localEditedAt.current = null;
          setValue(data.value as T);
          writeLocal(key, data.value as T);
        }
        emitScopedCloudSyncStatus(key, 'synced', householdId);
      });
    };

    window.addEventListener('focus', refreshFromHousehold);
    const timer = window.setInterval(refreshFromHousehold, 15_000);
    return () => {
      window.removeEventListener('focus', refreshFromHousehold);
      window.clearInterval(timer);
    };
  }, [key, mode, sharedKey, user?.id, householdId]);

  // Always mirror to localStorage. Push to cloud (debounced) when authed.
  useEffect(() => {
    writeLocal(key, value);
    if (mode !== 'authenticated' || !user || !hydrated.current) return;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      pushCloudValue(user.id, key, value, householdId).then(({ error }) => {
        if (error) console.warn(`[cloud-state] push failed for ${key}:`, error.message);
        else localEditedAt.current = null;
      });
    }, PUSH_DEBOUNCE_MS);
    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [key, value, mode, user?.id, householdId]);

  useEffect(() => {
    if (mode !== 'authenticated' || !user) return;
    const handler = async () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
      if (!hydrated.current) return;
      const scope = cloudScope(user.id, sharedKey ? householdId : null);
      const { data, error: pullError } = await pullCloudValue(scope, key);
      if (pullError) {
        console.warn(`[cloud-state] manual pull failed for ${key}:`, pullError.message);
      } else if (data?.value !== undefined && data.value !== null && shouldApplyCloudState(data.updated_at, localEditedAt.current)) {
        localEditedAt.current = null;
        setValue(data.value as T);
        writeLocal(key, data.value as T);
        emitScopedCloudSyncStatus(key, 'synced', householdId);
        return;
      }

      pushCloudValue(user.id, key, latestValue.current, householdId).then(({ error }) => {
        if (error) console.warn(`[cloud-state] manual push failed for ${key}:`, error.message);
        else localEditedAt.current = null;
      });
    };
    window.addEventListener(CLOUD_SYNC_NOW_EVENT, handler);
    return () => window.removeEventListener(CLOUD_SYNC_NOW_EVENT, handler);
  }, [key, mode, user?.id, householdId, sharedKey]);

  const setPersistedValue = (next: T | ((previous: T) => T)) => {
    localEditedAt.current = Date.now();
    setValue(next);
  };

  return [value, setPersistedValue];
}

function readLocal<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) return JSON.parse(raw) as T;
  } catch {}
  return initial;
}

function writeLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

async function pushCloudValue(userId: string, key: string, value: unknown, householdId?: string | null) {
  emitScopedCloudSyncStatus(key, 'syncing', householdId);
  const result = householdId
    ? await supabase
      .from('household_state')
      .upsert(buildHouseholdStateUpsert(householdId, userId, key, value), { onConflict: 'household_id,key' })
    : await supabase
      .from('user_state')
      .upsert(buildUserStateUpsert(userId, key, value), { onConflict: 'user_id,key' });

  if (result.error) {
    emitScopedCloudSyncStatus(key, 'error', householdId, result.error.message);
  } else {
    emitScopedCloudSyncStatus(key, 'synced', householdId);
  }

  return result;
}

function emitScopedCloudSyncStatus(
  key: string,
  phase: CloudSyncPhase,
  householdId?: string | null,
  message?: string,
) {
  emitCloudSyncStatus({
    key,
    phase,
    at: Date.now(),
    scope: householdId ? 'household' : 'user',
    message,
  });
}

function cloudScope(userId: string, householdId?: string | null) {
  return householdId
    ? { table: 'household_state' as const, idColumn: 'household_id' as const, id: householdId }
    : { table: 'user_state' as const, idColumn: 'user_id' as const, id: userId };
}

async function pullCloudValue(scope: ReturnType<typeof cloudScope>, key: string) {
  return supabase
    .from(scope.table)
    .select('value,updated_at')
    .eq(scope.idColumn, scope.id)
    .eq('key', key)
    .maybeSingle();
}
