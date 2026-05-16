import { FoodItem, Meal } from './data';

export interface RankedMeal {
  meal: Meal;
  haveCount: number;
  missingCount: number;
  usesExpiring: boolean;
  expiringNames: string[];
  score: number;
}

export function rankMeals(meals: Meal[], pantry: FoodItem[]): RankedMeal[] {
  return meals
    .map((meal) => {
      const have = meal.usesIds.filter((id) => pantry.find((p) => p.id === id));
      const expiring = have
        .map((id) => pantry.find((p) => p.id === id)!)
        .filter((p) => p.expiresInDays <= 4);
      const score = have.length * 2 - meal.missingIds.length + expiring.length * 3;
      return {
        meal,
        haveCount: have.length,
        missingCount: meal.missingIds.length,
        usesExpiring: expiring.length > 0,
        expiringNames: expiring.map((e) => e.name),
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}
