import { describe, expect, it } from 'vitest';
import {
  defaultReminderPreferences,
  reminderPreferencesFromOnboarding,
  normalizeReminderPreferences,
  updateReminderPreference,
} from './reminderPreferences';

describe('reminder preferences', () => {
  it('normalizes missing saved values to defaults', () => {
    expect(normalizeReminderPreferences(null)).toEqual(defaultReminderPreferences);
    expect(normalizeReminderPreferences({ expiration: false })).toEqual({
      expiration: false,
      lowStock: true,
      mealPrep: true,
    });
  });

  it('updates one reminder preference without changing the others', () => {
    expect(updateReminderPreference(defaultReminderPreferences, 'lowStock', false)).toEqual({
      expiration: true,
      lowStock: false,
      mealPrep: true,
    });
  });

  it('converts onboarding choices into saved reminder preferences', () => {
    expect(reminderPreferencesFromOnboarding({
      expiration: false,
      lowStock: true,
    })).toEqual({
      expiration: false,
      lowStock: true,
      mealPrep: true,
    });
  });
});
