import { describe, expect, it } from 'vitest';
import { FoodItem, Meal } from './data';
import { mealPantrySummary } from './mealDisplay';

const baseMeal: Meal = {
  id: 'meal',
  name: 'Meal',
  emoji: '🍽️',
  time: '20 min',
  difficulty: 'Easy',
  usesIds: [],
  missingIds: [],
  description: 'Test meal.',
  servings: 2,
  ingredients: [],
  instructions: [],
};

const pantry: FoodItem[] = [
  {
    id: 'eggs',
    name: 'Eggs',
    quantity: 12,
    unit: 'count',
    location: 'fridge',
    category: 'Dairy',
    expiresInDays: 3,
    emoji: '🥚',
  },
];

describe('mealPantrySummary', () => {
  it('names linked pantry items when a meal uses them', () => {
    expect(mealPantrySummary({ ...baseMeal, usesIds: ['eggs'] }, pantry)).toBe('Uses Eggs');
  });

  it('uses a helpful fallback when generated meals have no linked pantry ids', () => {
    expect(mealPantrySummary(baseMeal, pantry)).toBe('Pantry-flexible recipe');
  });

  it('prioritizes expiring item copy when supplied', () => {
    expect(mealPantrySummary(baseMeal, pantry, ['Milk', 'Yogurt'])).toBe(
      'Uses Milk, Yogurt before they expire',
    );
  });
});
