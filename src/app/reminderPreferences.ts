export type ReminderPreferences = {
  expiration: boolean;
  lowStock: boolean;
  mealPrep: boolean;
};

export type ReminderPreferenceKey = keyof ReminderPreferences;

export type OnboardingReminderChoices = Pick<ReminderPreferences, 'expiration' | 'lowStock'>;

export const defaultReminderPreferences: ReminderPreferences = {
  expiration: true,
  lowStock: true,
  mealPrep: true,
};

export function normalizeReminderPreferences(value: unknown): ReminderPreferences {
  if (!value || typeof value !== 'object') return defaultReminderPreferences;
  const saved = value as Partial<Record<ReminderPreferenceKey, unknown>>;

  return {
    expiration: typeof saved.expiration === 'boolean' ? saved.expiration : defaultReminderPreferences.expiration,
    lowStock: typeof saved.lowStock === 'boolean' ? saved.lowStock : defaultReminderPreferences.lowStock,
    mealPrep: typeof saved.mealPrep === 'boolean' ? saved.mealPrep : defaultReminderPreferences.mealPrep,
  };
}

export function updateReminderPreference(
  current: ReminderPreferences,
  key: ReminderPreferenceKey,
  value: boolean,
): ReminderPreferences {
  return { ...normalizeReminderPreferences(current), [key]: value };
}

export function reminderPreferencesFromOnboarding(
  choices: OnboardingReminderChoices,
): ReminderPreferences {
  return {
    ...defaultReminderPreferences,
    expiration: choices.expiration,
    lowStock: choices.lowStock,
  };
}
