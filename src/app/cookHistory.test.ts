import { describe, expect, it } from 'vitest';
import type { Meal } from './data';
import { buildCookedMealUpdate } from './cookHistory';

const meal: Meal = {
  id: 'meal-1',
  name: 'Rice Bowl',
  emoji: '🍚',
  time: '20 min',
  difficulty: 'Easy',
  usesIds: ['rice', 'eggs', 'rice', ''],
  missingIds: [],
  description: 'A simple meal.',
  servings: 2,
  ingredients: [],
  instructions: ['Cook it.'],
};

describe('buildCookedMealUpdate', () => {
  it('creates a cook-history entry and unique pantry ids to consume', () => {
    expect(buildCookedMealUpdate(meal, 123)).toEqual({
      entry: {
        id: 'c-123',
        mealId: 'meal-1',
        cookedAt: 123,
        servings: 2,
      },
      pantryIdsToUse: ['rice', 'eggs'],
    });
  });

  it('keeps custom recipes cookable when they have no linked pantry ids', () => {
    expect(buildCookedMealUpdate({ ...meal, usesIds: [] }, 456)).toMatchObject({
      entry: {
        id: 'c-456',
        mealId: 'meal-1',
        cookedAt: 456,
        servings: 2,
      },
      pantryIdsToUse: [],
    });
  });
});
