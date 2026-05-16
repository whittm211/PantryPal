import { describe, expect, it } from 'vitest';
import type { Meal } from '../data';
import { exportToJSON, importFromJSON, validateExportData } from './exportImport';

function jsonFile(data: unknown) {
  return new File([JSON.stringify(data)], 'backup.json', { type: 'application/json' });
}

const validPantryItem = {
  id: 'p-1',
  name: 'Spinach',
  quantity: 1,
  unit: 'bag',
  location: 'fridge',
  category: 'Produce',
  expiresInDays: 4,
  emoji: 'SPINACH',
};

const validUserMeal: Meal = {
  id: 'meal-1',
  name: 'Rice Bowl',
  emoji: 'BOWL',
  time: '15 min',
  difficulty: 'Easy',
  usesIds: [],
  missingIds: [],
  description: 'A quick meal.',
  servings: 2,
  ingredients: [{ name: 'Rice', amount: '1', unit: 'cup' }],
  instructions: ['Cook rice.'],
};

describe('validateExportData', () => {
  it('accepts a valid backup and fills optional arrays', () => {
    const result = validateExportData({
      version: '1.0',
      exportDate: '2026-05-15T00:00:00.000Z',
      pantry: [validPantryItem],
    });

    expect(result).toEqual({
      version: '1.0',
      exportDate: '2026-05-15T00:00:00.000Z',
      pantry: [validPantryItem],
      groceries: [],
      purchaseHistory: [],
      userMeals: [],
    });
  });

  it('accepts newer backups with settings and user meals', () => {
    const result = validateExportData({
      version: '2.0',
      exportDate: '2026-05-15T00:00:00.000Z',
      pantry: [validPantryItem],
      groceries: [],
      purchaseHistory: [],
      userMeals: [validUserMeal],
      settings: {
        householdType: 'student',
        dietPrefs: { diets: ['vegetarian'], allergies: [], dailyCalorieGoal: 2200 },
        theme: 'dark',
        largeText: true,
        highContrast: true,
        haptics: false,
        notifsEnabled: true,
        reminderPrefs: { expiration: false, lowStock: true, mealPrep: false },
      },
    });

    expect(result).toMatchObject({
      version: '2.0',
      userMeals: [validUserMeal],
      settings: {
        householdType: 'student',
        theme: 'dark',
        highContrast: true,
      },
    });
  });

  it('rejects pantry items with invalid locations', () => {
    const result = validateExportData({
      pantry: [{ ...validPantryItem, location: 'garage' }],
      groceries: [],
      purchaseHistory: [],
    });

    expect(result).toBeNull();
  });

  it('rejects grocery items with invalid suggestion values', () => {
    const result = validateExportData({
      pantry: [],
      groceries: [{
        id: 'g-1',
        name: 'Milk',
        quantity: 1,
        unit: 'gallon',
        bought: false,
        suggestion: 'coupon',
        emoji: 'MILK',
      }],
      purchaseHistory: [],
    });

    expect(result).toBeNull();
  });

  it('rejects history entries with invalid timestamps', () => {
    const result = validateExportData({
      pantry: [],
      groceries: [],
      purchaseHistory: [{
        itemName: 'Rice',
        category: 'Grains',
        avgExpiryDays: 30,
        purchaseCount: 3,
        lastPurchased: 'yesterday',
        emoji: 'RICE',
      }],
    });

    expect(result).toBeNull();
  });
});

describe('importFromJSON', () => {
  it('returns null for malformed JSON files', async () => {
    const file = new File(['{ nope'], 'backup.json', { type: 'application/json' });

    await expect(importFromJSON(file)).resolves.toBeNull();
  });

  it('uses the same validation when importing files', async () => {
    await expect(importFromJSON(jsonFile({ pantry: [validPantryItem] }))).resolves.toMatchObject({
      pantry: [validPantryItem],
      groceries: [],
      purchaseHistory: [],
      userMeals: [],
    });
  });
});

describe('exportToJSON', () => {
  it('exports full app settings and user meals when provided', () => {
    const parsed = JSON.parse(exportToJSON([], [], [], {
      userMeals: [validUserMeal],
      settings: {
        householdType: 'single',
        dietPrefs: { diets: [], allergies: [], dailyCalorieGoal: 1800 },
        theme: 'light',
        largeText: false,
        highContrast: true,
        haptics: true,
        notifsEnabled: false,
        reminderPrefs: { expiration: true, lowStock: false, mealPrep: true },
      },
    }));

    expect(parsed.version).toBe('2.0');
    expect(parsed.userMeals).toEqual([validUserMeal]);
    expect(parsed.settings.highContrast).toBe(true);
    expect(parsed.settings.householdType).toBe('single');
  });
});
