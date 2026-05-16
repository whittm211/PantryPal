import { FoodItem, Meal, DietPreferences, CookHistoryEntry, dietLabels } from './data';

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
  matchScore: number;
  image?: string;
}

// Curated fallback images for AI-improvised (novel) dishes. Keyed by goal so
// the result still feels relevant when there's no underlying meal in the
// library to borrow an image from.
export const novelDishImages: Record<string, string> = {
  'use-expiring': 'https://images.unsplash.com/photo-1524394071506-4c3fde76077b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
  'quick': 'https://images.unsplash.com/photo-1631233190752-35764ef80331?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
  'healthy': 'https://images.unsplash.com/photo-1505576633757-0ac1084af824?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
  'comfort': 'https://images.unsplash.com/photo-1667499989723-c4ab9549d63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
  'surprise': 'https://images.unsplash.com/photo-1566670735661-a3af40a3b4df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
};

export function pickNovelImage(goal: string): string {
  return novelDishImages[goal] ?? novelDishImages['surprise'];
}

export interface AIRequest {
  pantry: FoodItem[];
  meals: Meal[];
  prefs: DietPreferences;
  history: CookHistoryEntry[];
  goal: 'use-expiring' | 'quick' | 'healthy' | 'comfort' | 'surprise';
  servings: number;
}

// Mock LLM call. Swap with a real provider by setting AI_API_KEY and
// replacing the body with a fetch to your /chat/completions endpoint.
const AI_API_KEY = 'YOUR_API_KEY_HERE';

export async function generateMealRecommendations(req: AIRequest): Promise<AISuggestion[]> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 900 + Math.random() * 700));

  // Real-world: POST to provider with a structured prompt and parse JSON back.
  // For the prototype we score the curated meal library + improvise one novel idea.
  void AI_API_KEY;

  const expiringIds = new Set(
    req.pantry.filter((p) => p.expiresInDays <= 4).map((p) => p.id),
  );
  const pantryNames = new Set(req.pantry.map((p) => p.name.toLowerCase()));
  const recentMealIds = new Set(req.history.slice(-3).map((h) => h.mealId));

  const scored = req.meals.map((m) => {
    const have = m.usesIds.filter((id) => req.pantry.some((p) => p.id === id));
    const missing = m.usesIds.filter((id) => !req.pantry.some((p) => p.id === id));
    const usesExpiring = m.usesIds.some((id) => expiringIds.has(id));
    const minutes = parseInt(m.time, 10) || 30;
    const dietsOk =
      req.prefs.diets.length === 0 ||
      req.prefs.diets.every((d) => m.dietTags?.includes(d));
    const calorieFit =
      m.calories && req.prefs.dailyCalorieGoal
        ? 1 - Math.min(1, Math.abs(m.calories - req.prefs.dailyCalorieGoal / 3) / 600)
        : 0.5;

    let score = have.length * 2 - missing.length * 1.2;
    if (usesExpiring) score += 4;
    if (recentMealIds.has(m.id)) score -= 2;
    if (req.goal === 'use-expiring' && usesExpiring) score += 3;
    if (req.goal === 'quick' && minutes <= 20) score += 3;
    if (req.goal === 'healthy') score += calorieFit * 2;
    if (req.goal === 'comfort' && m.difficulty !== 'Hard') score += 1;
    if (!dietsOk) score -= 10;

    return { meal: m, have, missing, usesExpiring, score, dietsOk };
  });

  const top = scored
    .filter((s) => s.dietsOk)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const rationale = (s: typeof scored[number]): string => {
    const bits: string[] = [];
    if (s.usesExpiring) {
      const names = s.meal.usesIds
        .filter((id) => expiringIds.has(id))
        .map((id) => req.pantry.find((p) => p.id === id)?.name)
        .filter(Boolean) as string[];
      if (names.length) bits.push(`uses ${names.join(' & ')} before they expire`);
    }
    if (s.have.length === s.meal.usesIds.length) bits.push('all ingredients on hand');
    else if (s.missing.length === 1) bits.push('only one item to buy');
    if (req.goal === 'quick' && parseInt(s.meal.time, 10) <= 20) bits.push('under 20 minutes');
    if (req.goal === 'healthy' && s.meal.calories && s.meal.calories < 450) bits.push('balanced macros');
    if (req.prefs.diets.length) bits.push(`matches ${req.prefs.diets.map((d) => dietLabels[d]).join(', ')}`);
    if (bits.length === 0) bits.push('a solid match for what you have');
    return bits.join(' · ');
  };

  const suggestions: AISuggestion[] = top.map((s, i) => ({
    id: `ai-${Date.now()}-${i}`,
    mealId: s.meal.id,
    name: s.meal.name,
    emoji: s.meal.emoji,
    time: s.meal.time,
    difficulty: s.meal.difficulty,
    calories: s.meal.calories ?? 0,
    rationale: rationale(s),
    usesIngredients: s.meal.usesIds
      .map((id) => req.pantry.find((p) => p.id === id)?.name)
      .filter(Boolean) as string[],
    missingIngredients: s.meal.missingIds,
    matchScore: Math.min(99, Math.max(40, Math.round(60 + s.score * 4))),
    image: s.meal.image,
  }));

  // Improvised novel idea if we have ≥3 pantry items with names
  if (req.pantry.length >= 3) {
    const picks = [...req.pantry]
      .sort((a, b) => a.expiresInDays - b.expiresInDays)
      .slice(0, 3);
    const novel: AISuggestion = {
      id: `ai-novel-${Date.now()}`,
      name: `${picks[1].name} & ${picks[0].name} Bowl`,
      emoji: '🥣',
      time: '25 min',
      difficulty: 'Easy',
      calories: 420,
      rationale: `Improvised dish using your ${picks.map((p) => p.name.toLowerCase()).join(', ')} — minimal cleanup.`,
      usesIngredients: picks.map((p) => p.name),
      missingIngredients: ['seasoning'],
      matchScore: 78,
      image: pickNovelImage(req.goal),
    };
    suggestions.push(novel);
  }

  return suggestions;
}
