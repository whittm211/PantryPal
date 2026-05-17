import {
  CookHistoryEntry,
  DietPreferences,
  FoodItem,
  Meal,
  missingIngredientsMap,
} from './data';

export type AIChefMode =
  | 'fridge-rescue'
  | 'lazy'
  | 'budget'
  | 'high-protein'
  | 'healthy'
  | 'comfort'
  | 'kid-friendly'
  | '15-minute'
  | 'one-pan'
  | 'surprise';

export const aiChefModes: { value: AIChefMode; label: string; emoji: string; description: string }[] = [
  { value: 'fridge-rescue', label: 'Fridge Rescue', emoji: '🔥', description: 'Use food expiring soon.' },
  { value: 'lazy', label: 'Lazy Mode', emoji: '🛋️', description: 'Low effort, easy cleanup.' },
  { value: 'budget', label: 'Budget Meals', emoji: '💵', description: 'Use what is already on hand.' },
  { value: 'high-protein', label: 'High Protein', emoji: '💪', description: 'Prioritize protein-heavy meals.' },
  { value: 'healthy', label: 'Healthy', emoji: '🥗', description: 'Balanced, lighter options.' },
  { value: 'comfort', label: 'Comfort Food', emoji: '🍲', description: 'Warm and satisfying picks.' },
  { value: 'kid-friendly', label: 'Kid Friendly', emoji: '🧒', description: 'Simple flavors and familiar meals.' },
  { value: '15-minute', label: '15-Minute Meals', emoji: '⚡', description: 'Fastest options first.' },
  { value: 'one-pan', label: 'One-Pan Meals', emoji: '🍳', description: 'Minimal dishes and cleanup.' },
  { value: 'surprise', label: 'Surprise Me', emoji: '✨', description: 'A smart wildcard.' },
];

export type SmartSubstitution = {
  ingredient: string;
  substitute: string;
  note: string;
};

export type GroceryUnlock = {
  ingredient: string;
  unlockCount: number;
  mealNames: string[];
};

export type ScoredAIMeal = {
  meal: Meal;
  score: number;
  matchScore: number;
  ownedIngredients: string[];
  missingIngredients: string[];
  expiringIngredients: string[];
  substitutions: SmartSubstitution[];
  preferenceWarnings: string[];
};

type ScoreOptions = {
  mode: AIChefMode;
  prefs: DietPreferences;
  recentMealIds: Set<string>;
};

export type AIChefPromptRequest = {
  pantry: FoodItem[];
  meals: Meal[];
  prefs: DietPreferences;
  history: CookHistoryEntry[];
  mode: AIChefMode;
  servings: number;
};

const COMMON_SUBSTITUTIONS: Record<string, Omit<SmartSubstitution, 'ingredient'>> = {
  'sour cream': { substitute: 'Greek yogurt', note: 'Same tangy creaminess with more protein.' },
  butter: { substitute: 'olive oil', note: 'Use a little less oil than butter for sauteing.' },
  milk: { substitute: 'cream + water or non-dairy milk', note: 'Keeps the liquid and creaminess close.' },
  cream: { substitute: 'milk + butter', note: 'Good for sauces when cream is missing.' },
  buttermilk: { substitute: 'milk + lemon juice', note: 'Let it sit for 5 minutes before using.' },
  egg: { substitute: 'flax egg or yogurt', note: 'Works best in batters and binders.' },
  eggs: { substitute: 'tofu scramble or flax egg', note: 'Choose based on whether the egg is a main ingredient.' },
  cheese: { substitute: 'nutritional yeast or extra Greek yogurt', note: 'Adds savory flavor when cheese is missing.' },
  tortillas: { substitute: 'pita, lettuce cups, or toast', note: 'Use any wrap-like base you have.' },
  tortilla: { substitute: 'pita, lettuce cups, or toast', note: 'Use any wrap-like base you have.' },
  rice: { substitute: 'quinoa, pasta, or cauliflower rice', note: 'Match the cooking time to the swap.' },
};

export function modeLabel(mode: AIChefMode): string {
  return aiChefModes.find((item) => item.value === mode)?.label ?? 'Surprise Me';
}

export function buildSmartSubstitutions(ingredients: string[]): SmartSubstitution[] {
  return ingredients.flatMap((ingredient) => {
    const key = ingredient.toLowerCase();
    const direct = COMMON_SUBSTITUTIONS[key];
    if (direct) return [{ ingredient, ...direct }];
    const partial = Object.entries(COMMON_SUBSTITUTIONS).find(([name]) => key.includes(name));
    return partial ? [{ ingredient, ...partial[1] }] : [];
  });
}

export function buildGroceryUnlocks(meals: Meal[]): GroceryUnlock[] {
  const unlocks = new Map<string, string[]>();

  for (const meal of meals) {
    const missingNames = meal.missingIds.map(ingredientName).filter(Boolean);
    for (const name of new Set(missingNames)) {
      const current = unlocks.get(name) ?? [];
      current.push(meal.name);
      unlocks.set(name, current);
    }
  }

  return [...unlocks.entries()]
    .map(([ingredient, mealNames]) => ({ ingredient, unlockCount: mealNames.length, mealNames: mealNames.slice(0, 4) }))
    .filter((unlock) => unlock.unlockCount > 1)
    .sort((a, b) => b.unlockCount - a.unlockCount)
    .slice(0, 3);
}

export function scoreMealForAI(meal: Meal, pantry: FoodItem[], options: ScoreOptions): ScoredAIMeal {
  const pantryById = new Map(pantry.map((item) => [item.id, item]));
  const owned = meal.usesIds.map((id) => pantryById.get(id)).filter(Boolean) as FoodItem[];
  const expiring = owned.filter((item) => item.expiresInDays <= 4);
  const missingNames = meal.missingIds.map(ingredientName);
  const minutes = parseInt(meal.time, 10) || 30;
  const preferenceWarnings = preferenceConflicts(meal, options.prefs);
  const linkedIngredientCount = meal.usesIds.length + meal.missingIds.length;
  const baseMatch = linkedIngredientCount > 0
    ? Math.round((owned.length / linkedIngredientCount) * 100)
    : 55;

  let score = baseMatch / 10;
  score += owned.length * 1.4;
  score -= missingNames.length * 0.8;
  score += expiring.length * (options.mode === 'fridge-rescue' ? 5 : 2);
  if (options.recentMealIds.has(meal.id)) score -= 2;
  if (options.mode === '15-minute' && minutes <= 15) score += 5;
  if (options.mode === 'lazy' && meal.difficulty === 'Easy') score += 3;
  if (options.mode === 'budget' && missingNames.length <= 1) score += 4;
  if (options.mode === 'high-protein' && (meal.protein ?? 0) >= 25) score += 4;
  if (options.mode === 'healthy' && (meal.calories ?? 999) <= 500) score += 2;
  if (options.mode === 'comfort' && /pasta|soup|stew|cheese|burger|curry/i.test(meal.name)) score += 2;
  if (options.mode === 'kid-friendly' && meal.difficulty !== 'Hard') score += 2;
  if (options.mode === 'one-pan' && /skillet|stir fry|bowl|sheet pan|frittata/i.test(meal.name)) score += 3;
  if (options.prefs.preferredCookTime && minutes > options.prefs.preferredCookTime) score -= 2;
  if (options.prefs.cookingSkill === 'beginner' && meal.difficulty === 'Hard') score -= 4;
  if (options.prefs.cookingSkill === 'advanced' && meal.difficulty === 'Hard') score += 1;
  if (options.prefs.budgetLevel === 'low' && missingNames.length === 0) score += 2;
  if (options.prefs.budgetLevel === 'low' && missingNames.length > 2) score -= 2;
  score -= preferenceWarnings.length * 7;

  return {
    meal,
    score,
    matchScore: Math.min(99, Math.max(35, Math.round(baseMatch + score * 3.5))),
    ownedIngredients: owned.map((item) => item.name),
    missingIngredients: missingNames,
    expiringIngredients: expiring.map((item) => item.name),
    substitutions: buildSmartSubstitutions(missingNames),
    preferenceWarnings,
  };
}

export function buildAIChefPromptContext(req: AIChefPromptRequest): string {
  const expiring = req.pantry
    .filter((item) => item.expiresInDays <= 4)
    .sort((a, b) => a.expiresInDays - b.expiresInDays)
    .map((item) => item.name);

  return [
    'You are PantryPal AI Chef, a smart kitchen assistant.',
    `Mode: ${modeLabel(req.mode)}`,
    `Servings: ${req.servings}`,
    `Pantry: ${req.pantry.map((item) => `${item.name} (${item.quantity} ${item.unit}, ${item.expiresInDays}d left)`).join(', ') || 'empty'}`,
    `Expiring soon: ${expiring.join(', ') || 'none'}`,
    `Diets: ${req.prefs.diets.join(', ') || 'none'}`,
    `Allergies: ${req.prefs.allergies.join(', ') || 'none'}`,
    `Disliked ingredients: ${req.prefs.dislikedIngredients.join(', ') || 'none'}`,
    `Preferred cook time: ${req.prefs.preferredCookTime} min`,
    `Budget: ${req.prefs.budgetLevel}`,
    `Cooking skill: ${req.prefs.cookingSkill}`,
    `Available meals: ${req.meals.map((meal) => `${meal.id}: ${meal.name}, ${meal.time}, ${meal.difficulty}`).join(' | ')}`,
    'Return JSON suggestions using mealId when a listed meal is the best fit. Include owned ingredients, missing ingredients, substitutions, grocery unlock ideas, match percentage, and rationale.',
  ].join('\n');
}

function ingredientName(id: string): string {
  return missingIngredientsMap[id]?.name ?? toTitleCase(id.replace(/-/g, ' '));
}

function preferenceConflicts(meal: Meal, prefs: DietPreferences): string[] {
  const searchable = [
    meal.name,
    meal.description,
    ...meal.ingredients.map((ingredient) => ingredient.name),
  ].join(' ').toLowerCase();

  const warnings: string[] = [];
  for (const ingredient of prefs.dislikedIngredients) {
    const normalized = ingredient.trim().toLowerCase();
    if (normalized && searchable.includes(normalized)) warnings.push(`Includes disliked ingredient: ${ingredient.trim()}`);
  }
  for (const allergy of prefs.allergies) {
    const normalized = allergy.trim().toLowerCase();
    if (normalized && searchable.includes(normalized)) warnings.push(`May conflict with allergy: ${allergy.trim()}`);
  }
  return warnings;
}

function toTitleCase(value: string): string {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
