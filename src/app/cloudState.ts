export type UserStateUpsert = {
  user_id: string;
  key: string;
  value: unknown;
  updated_at: string;
};

export type HouseholdStateUpsert = {
  household_id: string;
  key: string;
  value: unknown;
  updated_by: string;
  updated_at: string;
};

const SHARED_CLOUD_STATE_KEYS = new Set([
  'pp:cookHistory',
  'pp:dietPrefs',
  'pp:favorites',
  'pp:groceries',
  'pp:history',
  'pp:household',
  'pp:householdType',
  'pp:mealPlan',
  'pp:pantry',
  'pp:userMeals',
]);

export function buildUserStateUpsert(
  userId: string,
  key: string,
  value: unknown,
  now = new Date(),
): UserStateUpsert {
  return {
    user_id: userId,
    key,
    value,
    updated_at: now.toISOString(),
  };
}

export function buildHouseholdStateUpsert(
  householdId: string,
  userId: string,
  key: string,
  value: unknown,
  now = new Date(),
): HouseholdStateUpsert {
  return {
    household_id: householdId,
    key,
    value,
    updated_by: userId,
    updated_at: now.toISOString(),
  };
}

export function isSharedCloudStateKey(key: string) {
  return SHARED_CLOUD_STATE_KEYS.has(key);
}

export function shouldApplyCloudState(cloudUpdatedAt: string | null | undefined, localEditedAt: number | null) {
  if (!cloudUpdatedAt) return false;
  if (!localEditedAt) return true;

  const cloudTime = Date.parse(cloudUpdatedAt);
  if (!Number.isFinite(cloudTime)) return false;

  return cloudTime >= localEditedAt;
}
