import { FoodItem, Meal } from './data';

export function mealPantrySummary(meal: Meal, pantry: FoodItem[], expiringNames: string[] = []): string {
  if (expiringNames.length > 0) {
    return `Uses ${expiringNames.join(', ')} before they expire`;
  }

  const usedItems = meal.usesIds
    .map((id) => pantry.find((item) => item.id === id)?.name ?? id)
    .filter(Boolean);

  if (usedItems.length === 0) return 'Pantry-flexible recipe';

  return `Uses ${usedItems.join(', ')}`;
}

export function cookedMealActionLabel(meal: Meal): string {
  return meal.usesIds.length > 0
    ? 'I cooked this · Mark ingredients used'
    : 'I cooked this · Save to history';
}
