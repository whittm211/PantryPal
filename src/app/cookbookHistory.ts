import type { CookHistoryEntry, Meal } from './data';

export type CookbookHistory = {
  visibleCookCount: number;
  recent: { entry: CookHistoryEntry; meal: Meal }[];
  topCooked: { meal: Meal; count: number }[];
};

export function buildCookbookHistory(meals: Meal[], history: CookHistoryEntry[]): CookbookHistory {
  const mealsById = new Map(meals.map((meal) => [meal.id, meal]));
  const visible = history
    .map((entry) => {
      const meal = mealsById.get(entry.mealId);
      return meal ? { entry, meal } : null;
    })
    .filter((item): item is { entry: CookHistoryEntry; meal: Meal } => item != null);

  const counts = new Map<string, number>();
  for (const { meal } of visible) {
    counts.set(meal.id, (counts.get(meal.id) ?? 0) + 1);
  }

  const topCooked = [...counts.entries()]
    .map(([mealId, count]) => ({ meal: mealsById.get(mealId), count }))
    .filter((item): item is { meal: Meal; count: number } => item.meal != null)
    .sort((a, b) => b.count - a.count || a.meal.name.localeCompare(b.meal.name));

  return {
    visibleCookCount: visible.length,
    recent: [...visible].sort((a, b) => b.entry.cookedAt - a.entry.cookedAt).slice(0, 20),
    topCooked,
  };
}

export function formatCookedDate(cookedAt: number) {
  return new Date(cookedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatServingsLabel(servings: number) {
  return `${servings} serving${servings === 1 ? '' : 's'}`;
}
