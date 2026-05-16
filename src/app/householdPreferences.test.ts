import { describe, expect, it } from 'vitest';
import {
  defaultHouseholdType,
  householdTypeLabels,
  normalizeHouseholdType,
} from './householdPreferences';

describe('household preferences', () => {
  it('normalizes missing or invalid household types to the default', () => {
    expect(normalizeHouseholdType(null)).toBe(defaultHouseholdType);
    expect(normalizeHouseholdType('roommates')).toBe(defaultHouseholdType);
  });

  it('keeps valid household types and exposes labels', () => {
    expect(normalizeHouseholdType('student')).toBe('student');
    expect(householdTypeLabels.family).toBe('Family');
  });
});
