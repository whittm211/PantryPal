import { describe, expect, it } from 'vitest';
import type { FoodItem, Meal } from './data';
import {
  buildAIChefPromptContext,
  buildGroceryUnlocks,
  buildSmartSubstitutions,
  scoreMealForAI,
} from './aiChefContext';

const pantry: FoodItem[] = [
  { id: 'eggs', name: 'Eggs', quantity: 12, unit: 'count', location: 'fridge', category: 'Dairy', expiresInDays: 2, emoji: '🥚' },
  { id: 'yogurt', name: 'Greek yogurt', quantity: 1, unit: 'cup', location: 'fridge', category: 'Dairy', expiresInDays: 1, emoji: '🥣' },
];

const meal: Meal = {
  id: 'breakfast',
  name: 'Breakfast Tacos',
  emoji: '🌮',
  time: '15 min',
  difficulty: 'Easy',
  usesIds: ['eggs'],
  missingIds: ['tortilla', 'cheese'],
  description: 'Fast breakfast.',
  servings: 2,
  ingredients: [
    { pantryId: 'eggs', name: 'Eggs', amount: '2', unit: 'count' },
    { name: 'Tortilla', amount: '2', unit: 'count' },
    { name: 'Cheese', amount: '1', unit: 'oz' },
  ],
  instructions: ['Scramble eggs.', 'Fill tortillas.'],
  calories: 350,
  protein: 22,
  mealType: 'breakfast',
};

describe('scoreMealForAI', () => {
  it('returns pantry-aware match details and boosts fridge rescue matches', () => {
    const scored = scoreMealForAI(meal, pantry, {
      mode: 'fridge-rescue',
      prefs: {
        diets: [],
        allergies: [],
        dailyCalorieGoal: 2000,
        dislikedIngredients: [],
        preferredCookTime: 20,
        budgetLevel: 'low',
        servingSize: 2,
        cookingSkill: 'beginner',
      },
      recentMealIds: new Set(),
    });

    expect(scored.ownedIngredients).toEqual(['Eggs']);
    expect(scored.missingIngredients).toEqual(['Tortillas', 'Cheese']);
    expect(scored.expiringIngredients).toEqual(['Eggs']);
    expect(scored.matchScore).toBeGreaterThanOrEqual(60);
  });

  it('penalizes disliked ingredients and allergies', () => {
    const scored = scoreMealForAI(meal, pantry, {
      mode: 'lazy',
      prefs: {
        diets: [],
        allergies: ['cheese'],
        dailyCalorieGoal: 2000,
        dislikedIngredients: ['eggs'],
        preferredCookTime: 20,
        budgetLevel: 'medium',
        servingSize: 2,
        cookingSkill: 'beginner',
      },
      recentMealIds: new Set(),
    });

    expect(scored.preferenceWarnings).toContain('Includes disliked ingredient: eggs');
    expect(scored.preferenceWarnings).toContain('May conflict with allergy: cheese');
    expect(scored.score).toBeLessThan(0);
  });
});

describe('buildSmartSubstitutions', () => {
  it('suggests common substitutions for missing ingredients', () => {
    expect(buildSmartSubstitutions(['sour cream', 'butter', 'milk'])).toEqual([
      expect.objectContaining({ ingredient: 'sour cream', substitute: 'Greek yogurt' }),
      expect.objectContaining({ ingredient: 'butter', substitute: 'olive oil' }),
      expect.objectContaining({ ingredient: 'milk', substitute: 'cream + water or non-dairy milk' }),
    ]);
  });
});

describe('buildGroceryUnlocks', () => {
  it('summarizes small grocery additions that unlock more meals', () => {
    const unlocks = buildGroceryUnlocks([
      meal,
      { ...meal, id: 'quesadilla', name: 'Quesadilla', missingIds: ['tortilla', 'cheese'] },
      { ...meal, id: 'wrap', name: 'Wrap', missingIds: ['tortilla'] },
    ]);

    expect(unlocks[0]).toMatchObject({ ingredient: 'Tortillas', unlockCount: 3 });
  });
});

describe('buildAIChefPromptContext', () => {
  it('includes pantry, expiring items, preferences, and selected mode', () => {
    const prompt = buildAIChefPromptContext({
      pantry,
      meals: [meal],
      prefs: {
        diets: ['high-protein'],
        allergies: ['peanuts'],
        dailyCalorieGoal: 2200,
        dislikedIngredients: ['mushrooms'],
        preferredCookTime: 15,
        budgetLevel: 'low',
        servingSize: 2,
        cookingSkill: 'beginner',
      },
      history: [],
      mode: 'high-protein',
      servings: 2,
    });

    expect(prompt).toContain('Mode: High Protein');
    expect(prompt).toContain('Expiring soon: Greek yogurt, Eggs');
    expect(prompt).toContain('Allergies: peanuts');
    expect(prompt).toContain('Disliked ingredients: mushrooms');
  });
});
