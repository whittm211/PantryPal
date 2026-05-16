import { describe, expect, it } from 'vitest';
import type { MealPlanEntry } from './data';
import { addMealToTodayPlan } from './mealPlan';

const today = new Date('2026-05-15T12:00:00Z');

describe('addMealToTodayPlan', () => {
  it('adds a meal to today dinner by default', () => {
    expect(addMealToTodayPlan([], 'rice', today)).toEqual({
      added: true,
      plan: [
        {
          id: 'mp-2026-05-15-dinner-rice',
          date: '2026-05-15',
          mealId: 'rice',
          slot: 'dinner',
        },
      ],
    });
  });

  it('does not duplicate a meal already planned today', () => {
    const plan: MealPlanEntry[] = [
      { id: 'existing', date: '2026-05-15', mealId: 'rice', slot: 'lunch' },
    ];

    expect(addMealToTodayPlan(plan, 'rice', today)).toEqual({
      added: false,
      plan,
    });
  });

  it('keeps the same meal on a different date and adds it today', () => {
    const plan: MealPlanEntry[] = [
      { id: 'tomorrow', date: '2026-05-16', mealId: 'rice', slot: 'dinner' },
    ];

    expect(addMealToTodayPlan(plan, 'rice', today)).toEqual({
      added: true,
      plan: [
        ...plan,
        {
          id: 'mp-2026-05-15-dinner-rice',
          date: '2026-05-15',
          mealId: 'rice',
          slot: 'dinner',
        },
      ],
    });
  });
});
