import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { isSupabaseConfigured, supabase } from './supabase';
import type { AIRequest, AISuggestion } from '../app/ai';
import { pickNovelImage } from '../app/ai';
import { buildAIChefPromptContext, buildGroceryUnlocks, scoreMealForAI } from '../app/aiChefContext';
import { getMealPhoto } from '../app/mealPhotos';

const FN_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e808db2a/ai-chef`;
const AI_CHEF_TIMEOUT_MS = 8000;

export async function postAIChefRequest({
  token,
  payload,
  fetchImpl = fetch,
  timeoutMs = AI_CHEF_TIMEOUT_MS,
}: {
  token: string;
  payload: unknown;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}): Promise<unknown> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchImpl(FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`AI Chef request failed: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('AI Chef request timed out');
    }
    throw err;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export async function getAIRecommendations(req: AIRequest): Promise<AISuggestion[]> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured for this deployment.');

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token ?? publicAnonKey;

  const data = await postAIChefRequest({
    token,
    payload: {
      mode: req.mode,
      servings: req.servings,
      prefs: req.prefs,
      pantry: req.pantry,
      meals: req.meals,
      history: req.history,
      promptContext: req.promptContext ?? buildAIChefPromptContext(req),
    },
  });
  const rawData = data as { suggestions?: unknown };
  const raw = Array.isArray(rawData?.suggestions) ? rawData.suggestions : [];

  const mealById = new Map(req.meals.map((m) => [m.id, m]));
  const recentMealIds = new Set(req.history.slice(-3).map((entry) => entry.mealId));
  const groceryUnlocks = buildGroceryUnlocks(req.meals);

  return raw.map((s: Partial<AISuggestion>, i: number) => {
    const matched = s.mealId ? mealById.get(s.mealId) : undefined;
    const matchedPhoto = matched ? getMealPhoto(matched) : null;
    const localScore = matched
      ? scoreMealForAI(matched, req.pantry, { mode: req.mode, prefs: req.prefs, recentMealIds })
      : null;
    return {
      id: `ai-${Date.now()}-${i}`,
      mealId: s.mealId ?? undefined,
      name: String(s.name ?? 'Untitled dish'),
      emoji: String(s.emoji ?? '🍽️'),
      time: String(s.time ?? '30 min'),
      difficulty: (s.difficulty as AISuggestion['difficulty']) ?? 'Easy',
      calories: Number(s.calories ?? 0),
      rationale: String(s.rationale ?? ''),
      usesIngredients: Array.isArray(s.usesIngredients) && s.usesIngredients.length > 0
        ? s.usesIngredients
        : localScore?.ownedIngredients ?? [],
      missingIngredients: Array.isArray(s.missingIngredients) && s.missingIngredients.length > 0
        ? s.missingIngredients
        : localScore?.missingIngredients ?? [],
      expiringIngredients: Array.isArray(s.expiringIngredients) && s.expiringIngredients.length > 0
        ? s.expiringIngredients
        : localScore?.expiringIngredients ?? [],
      substitutions: Array.isArray(s.substitutions) && s.substitutions.length > 0
        ? s.substitutions
        : localScore?.substitutions ?? [],
      groceryUnlocks: Array.isArray(s.groceryUnlocks) && s.groceryUnlocks.length > 0 ? s.groceryUnlocks : groceryUnlocks,
      matchScore: Math.min(99, Math.max(40, Math.round(Number(s.matchScore ?? localScore?.matchScore ?? 70)))),
      prepTime: typeof s.prepTime === 'string' ? s.prepTime : matched?.prepTime,
      cookTime: typeof s.cookTime === 'string' ? s.cookTime : matched?.cookTime,
      servings: Number(s.servings ?? req.servings),
      ingredients: Array.isArray(s.ingredients)
        ? s.ingredients
        : matched?.ingredients.map((ingredient) => `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`.trim()) ?? [],
      instructions: Array.isArray(s.instructions) ? s.instructions : matched?.instructions ?? [],
      image: matched ? matchedPhoto?.url : pickNovelImage(req.mode),
    };
  });
}
