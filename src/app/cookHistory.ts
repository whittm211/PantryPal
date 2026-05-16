import type { CookHistoryEntry, Meal } from './data';

export function buildCookedMealUpdate(meal: Meal, now = Date.now()): {
  entry: CookHistoryEntry;
  pantryIdsToUse: string[];
} {
  return {
    entry: {
      id: `c-${now}`,
      mealId: meal.id,
      cookedAt: now,
      servings: meal.servings,
    },
    pantryIdsToUse: uniqueNonBlank(meal.usesIds),
  };
}

function uniqueNonBlank(values: string[]) {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    unique.push(trimmed);
  }
  return unique;
}
