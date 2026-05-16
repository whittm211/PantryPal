import { describe, expect, it } from 'vitest';
import type { ExportData } from './exportImport';
import { buildImportSummary } from './importSummary';

const backup: ExportData = {
  version: '2.0',
  exportDate: '2026-05-15T00:00:00.000Z',
  pantry: [{ id: 'p1', name: 'Milk', quantity: 1, unit: 'gallon', location: 'fridge', category: 'Dairy', expiresInDays: 3, emoji: 'MILK' }],
  groceries: [{ id: 'g1', name: 'Bread', quantity: 1, unit: 'loaf', bought: false, emoji: 'BREAD' }],
  purchaseHistory: [{ itemName: 'Eggs', category: 'Protein', avgExpiryDays: 14, purchaseCount: 3, lastPurchased: 1, emoji: 'EGGS' }],
  userMeals: [{
    id: 'm1',
    name: 'Toast',
    emoji: 'TOAST',
    time: '5 min',
    difficulty: 'Easy',
    usesIds: [],
    missingIds: [],
    description: 'Toast bread.',
    servings: 1,
    ingredients: [{ name: 'Bread', amount: '1', unit: 'slice' }],
    instructions: ['Toast bread.'],
  }],
  settings: {
    householdType: 'single',
    dietPrefs: { diets: [], allergies: [], dailyCalorieGoal: 2000 },
    theme: 'light',
    largeText: false,
    highContrast: false,
    haptics: true,
    notifsEnabled: false,
    reminderPrefs: { expiration: true, lowStock: true, mealPrep: true },
  },
};

describe('buildImportSummary', () => {
  it('summarizes backup contents before import', () => {
    expect(buildImportSummary(backup)).toEqual({
      pantryCount: 1,
      groceryCount: 1,
      historyCount: 1,
      userMealCount: 1,
      includesSettings: true,
      version: '2.0',
      exportedAt: 'May 15, 2026',
    });
  });

  it('handles older backups without settings', () => {
    expect(buildImportSummary({ ...backup, version: '1.0', settings: undefined, userMeals: [] })).toMatchObject({
      includesSettings: false,
      userMealCount: 0,
      version: '1.0',
    });
  });
});
