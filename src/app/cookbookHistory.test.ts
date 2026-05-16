import { describe, expect, it } from 'vitest';
import type { CookHistoryEntry, Meal } from './data';
import {
  buildCookbookHistory,
  formatCookedDate,
  formatServingsLabel,
} from './cookbookHistory';

const meals: Meal[] = [
  {
    id: 'rice',
    name: 'Rice Bowl',
    emoji: '🍚',
    time: '20 min',
    difficulty: 'Easy',
    usesIds: [],
    missingIds: [],
    description: 'A simple meal.',
    servings: 2,
    ingredients: [],
    instructions: ['Cook it.'],
  },
  {
    id: 'soup',
    name: 'Soup',
    emoji: '🥣',
    time: '30 min',
    difficulty: 'Easy',
    usesIds: [],
    missingIds: [],
    description: 'Warm soup.',
    servings: 4,
    ingredients: [],
    instructions: ['Simmer it.'],
  },
];

const history: CookHistoryEntry[] = [
  { id: 'old-rice', mealId: 'rice', cookedAt: 1000, servings: 2 },
  { id: 'missing', mealId: 'deleted-recipe', cookedAt: 5000, servings: 4 },
  { id: 'new-soup', mealId: 'soup', cookedAt: 9000, servings: 1 },
  { id: 'new-rice', mealId: 'rice', cookedAt: 8000, servings: 2 },
];

describe('buildCookbookHistory', () => {
  it('filters stale history and sorts recent meals by cooked date', () => {
    expect(buildCookbookHistory(meals, history)).toMatchObject({
      visibleCookCount: 3,
      recent: [
        { entry: { id: 'new-soup' }, meal: { id: 'soup' } },
        { entry: { id: 'new-rice' }, meal: { id: 'rice' } },
        { entry: { id: 'old-rice' }, meal: { id: 'rice' } },
      ],
    });
  });

  it('ranks top-cooked recipes by visible history count', () => {
    expect(buildCookbookHistory(meals, history).topCooked).toMatchObject([
      { meal: { id: 'rice' }, count: 2 },
      { meal: { id: 'soup' }, count: 1 },
    ]);
  });

  it('formats cooked dates and servings labels for the history tab', () => {
    const cookedAt = new Date(2026, 4, 15).getTime();

    expect(formatCookedDate(cookedAt)).toBe('May 15');
    expect(formatServingsLabel(1)).toBe('1 serving');
    expect(formatServingsLabel(3)).toBe('3 servings');
  });
});
