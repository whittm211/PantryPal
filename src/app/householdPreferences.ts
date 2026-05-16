export type HouseholdType = 'student' | 'single' | 'family';

export const defaultHouseholdType: HouseholdType = 'family';

export const householdTypeLabels: Record<HouseholdType, string> = {
  student: 'Student',
  single: 'Single Adult',
  family: 'Family',
};

export const householdTypeDescriptions: Record<HouseholdType, string> = {
  student: 'Budget-friendly, fast meals',
  single: 'One person, easy planning',
  family: 'Multiple people, weekly meals',
};

export function normalizeHouseholdType(value: unknown): HouseholdType {
  return value === 'student' || value === 'single' || value === 'family'
    ? value
    : defaultHouseholdType;
}
