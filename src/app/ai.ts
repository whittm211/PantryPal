import { CookHistoryEntry, DietPreferences, FoodItem, Meal } from './data';
import { getMealPhoto } from './mealPhotos';
import {
  AIChefMode,
  buildAIChefPromptContext,
  buildGroceryUnlocks,
  GroceryUnlock,
  scoreMealForAI,
  SmartSubstitution,
} from './aiChefContext';

export interface AISuggestion {
  id: string;
  mealId?: string;
  name: string;
  emoji: string;
  time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calories: number;
  rationale: string;
  usesIngredients: string[];
  missingIngredients: string[];
  expiringIngredients: string[];
  substitutions: SmartSubstitution[];
  groceryUnlocks: GroceryUnlock[];
  matchScore: number;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  ingredients?: string[];
  instructions?: string[];
  image?: string;
}

export const novelDishImages: Record<AIChefMode, string> = {
  'fridge-rescue': 'https://images.unsplash.com/photo-1524394071506-4c3fde76077b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
  lazy: 'https://images.unsplash.com/photo-1631233190752-35764ef80331?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
  budget: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
  'high-protein': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
  healthy: 'https://images.unsplash.com/photo-1505576633757-0ac1084af824?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
  comfort: 'https://images.unsplash.com/photo-1667499989723-c4ab9549d63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
  'kid-friendly': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
  '15-minute': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
  'one-pan': 'https://images.unsplash.com/photo-1559847844-5315695dadae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
  surprise: 'https://images.unsplash.com/photo-1566670735661-a3af40a3b4df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
};

export function pickNovelImage(mode: string): string {
  return novelDishImages[mode as AIChefMode] ?? novelDishImages.surprise;
}

export interface AIRequest {
  pantry: FoodItem[];
  meals: Meal[];
  prefs: DietPreferences;
  history: CookHistoryEntry[];
  mode: AIChefMode;
  servings: number;
  promptContext?: string;
}

const AI_API_KEY = 'YOUR_API_KEY_HERE';

export async function generateMealRecommendations(req: AIRequest): Promise<AISuggestion[]> {
  await new Promise((resolve) => setTimeout(resolve, 650 + Math.random() * 450));

  // This structured prompt is intentionally built outside the UI. A future real
  // provider can consume the same context while the local fallback stays useful.
  const promptContext = req.promptContext ?? buildAIChefPromptContext(req);
  void AI_API_KEY;
  void promptContext;

  const recentMealIds = new Set(req.history.slice(-3).map((entry) => entry.mealId));
  const groceryUnlocks = buildGroceryUnlocks(req.meals);
  const scored = req.meals
    .map((meal) => {
      const dietsOk =
        req.prefs.diets.length === 0 ||
        req.prefs.diets.every((diet) => meal.dietTags?.includes(diet));
      return {
        ...scoreMealForAI(meal, req.pantry, { mode: req.mode, prefs: req.prefs, recentMealIds }),
        dietsOk,
      };
    })
    .filter((item) => item.dietsOk)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const suggestions: AISuggestion[] = scored.map((item, index) => ({
    id: `ai-${Date.now()}-${index}`,
    mealId: item.meal.id,
    name: item.meal.name,
    emoji: item.meal.emoji,
    time: item.meal.time,
    difficulty: item.meal.difficulty,
    calories: item.meal.calories ?? 0,
    rationale: buildRationale(item, req.mode),
    usesIngredients: item.ownedIngredients,
    missingIngredients: item.missingIngredients,
    expiringIngredients: item.expiringIngredients,
    substitutions: item.substitutions,
    groceryUnlocks,
    matchScore: item.matchScore,
    prepTime: item.meal.prepTime,
    cookTime: item.meal.cookTime,
    servings: req.servings,
    ingredients: item.meal.ingredients.map((ingredient) => `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`.trim()),
    instructions: item.meal.instructions,
    image: getMealPhoto(item.meal)?.url,
  }));

  if (req.pantry.length >= 3) {
    const picks = [...req.pantry]
      .sort((a, b) => a.expiresInDays - b.expiresInDays)
      .slice(0, 3);
    suggestions.push({
      id: `ai-novel-${Date.now()}`,
      name: `${picks[1].name} & ${picks[0].name} Bowl`,
      emoji: '🥣',
      time: '25 min',
      difficulty: 'Easy',
      calories: 420,
      rationale: `Improvised dish using your ${picks.map((item) => item.name.toLowerCase()).join(', ')} — minimal cleanup.`,
      usesIngredients: picks.map((item) => item.name),
      missingIngredients: ['seasoning'],
      expiringIngredients: picks.filter((item) => item.expiresInDays <= 4).map((item) => item.name),
      substitutions: [],
      groceryUnlocks,
      matchScore: 78,
      prepTime: '10 min',
      cookTime: '15 min',
      servings: req.servings,
      ingredients: [...picks.map((item) => item.name), 'seasoning'],
      instructions: ['Prep the pantry ingredients.', 'Cook everything together in a skillet or bowl base.', 'Season to taste and serve warm.'],
      image: pickNovelImage(req.mode),
    });
  }

  return suggestions;
}

function buildRationale(item: ReturnType<typeof scoreMealForAI>, mode: AIChefMode): string {
  const bits: string[] = [];
  if (item.expiringIngredients.length > 0) bits.push(`rescues ${item.expiringIngredients.join(' & ')}`);
  if (item.missingIngredients.length === 0) bits.push('all key ingredients on hand');
  else if (item.missingIngredients.length === 1) bits.push('only one item to buy');
  if (mode === '15-minute' && parseInt(item.meal.time, 10) <= 15) bits.push('15 minutes or less');
  if (mode === 'healthy' && item.meal.calories && item.meal.calories < 500) bits.push('balanced option');
  if (mode === 'high-protein' && (item.meal.protein ?? 0) >= 25) bits.push('high protein');
  if (item.preferenceWarnings.length > 0) bits.push('check preference warnings');
  return bits.length > 0 ? bits.join(' · ') : 'a solid match for what you have';
}
