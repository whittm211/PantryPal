import type { DietTag, Meal } from '../data';

type RecipeDraft = {
  now?: number;
  name: string;
  emoji: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  time: string;
  servings: string;
  calories: string;
  difficulty: Meal['difficulty'];
  description: string;
  diets: readonly DietTag[];
  ingredients: { name: string; amount: string; unit: string }[];
  instructions: string[];
  imageUrl: string;
};

type BuildResult =
  | { ok: true; meal: Meal }
  | { ok: false; error: string };

export function buildUserRecipePayload(draft: RecipeDraft): BuildResult {
  const name = draft.name.trim();
  if (!name) return { ok: false, error: 'Please add a recipe name' };

  const ingredients = draft.ingredients
    .map((ingredient) => ({
      name: ingredient.name.trim(),
      amount: ingredient.amount.trim(),
      unit: ingredient.unit.trim(),
    }))
    .filter((ingredient) => ingredient.name);
  if (ingredients.length === 0) return { ok: false, error: 'Add at least one ingredient' };

  const instructions = draft.instructions.map((step) => step.trim()).filter(Boolean);
  if (instructions.length === 0) return { ok: false, error: 'Add at least one instruction' };

  const minutes = positiveIntOrDefault(draft.time, 30);
  const servings = positiveIntOrDefault(draft.servings, 2);
  const calories = positiveInt(draft.calories);
  const image = draft.imageUrl.trim();

  return {
    ok: true,
    meal: {
      id: `user-${draft.now ?? Date.now()}`,
      name,
      emoji: draft.emoji.trim() || '🍽️',
      time: `${minutes} min`,
      difficulty: draft.difficulty,
      usesIds: [],
      missingIds: [],
      description: draft.description.trim() || 'My own recipe.',
      servings,
      ingredients,
      instructions,
      calories,
      dietTags: [...draft.diets],
      mealType: draft.mealType,
      image: image || undefined,
    },
  };
}

function positiveInt(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function positiveIntOrDefault(value: string, fallback: number) {
  return positiveInt(value) ?? fallback;
}
