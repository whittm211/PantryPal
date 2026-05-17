import { describe, expect, it } from 'vitest';
import { defaultDietPrefs, normalizeDietPreferences } from './data';

describe('normalizeDietPreferences', () => {
  it('fills newly added AI Chef preferences for older saved settings', () => {
    expect(normalizeDietPreferences({
      diets: ['vegetarian'],
      allergies: ['peanuts'],
      dailyCalorieGoal: 2100,
    })).toEqual({
      ...defaultDietPrefs,
      diets: ['vegetarian'],
      allergies: ['peanuts'],
      dailyCalorieGoal: 2100,
    });
  });

  it('rejects invalid enum values back to defaults', () => {
    expect(normalizeDietPreferences({
      diets: [],
      allergies: [],
      dailyCalorieGoal: 2000,
      dislikedIngredients: ['mushrooms'],
      preferredCookTime: -1,
      budgetLevel: 'expensive',
      servingSize: 0,
      cookingSkill: 'wizard',
    } as any)).toMatchObject({
      dislikedIngredients: ['mushrooms'],
      preferredCookTime: defaultDietPrefs.preferredCookTime,
      budgetLevel: defaultDietPrefs.budgetLevel,
      servingSize: defaultDietPrefs.servingSize,
      cookingSkill: defaultDietPrefs.cookingSkill,
    });
  });
});
