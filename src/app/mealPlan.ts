import type { MealPlanEntry } from './data';

export function addMealToTodayPlan(
  plan: MealPlanEntry[],
  mealId: string,
  now = new Date(),
): { added: boolean; plan: MealPlanEntry[] } {
  const date = dateKey(now);
  if (plan.some((entry) => entry.date === date && entry.mealId === mealId)) {
    return { added: false, plan };
  }

  return {
    added: true,
    plan: [
      ...plan,
      {
        id: `mp-${date}-dinner-${mealId}`,
        date,
        mealId,
        slot: 'dinner',
      },
    ],
  };
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}
