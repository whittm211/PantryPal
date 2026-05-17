import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { isSupabaseConfigured, supabase } from './supabase';
import type { AIRequest, AISuggestion } from '../app/ai';
import { pickNovelImage } from '../app/ai';

const FN_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e808db2a/ai-chef`;

export async function getAIRecommendations(req: AIRequest): Promise<AISuggestion[]> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured for this deployment.');

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token ?? publicAnonKey;

  const res = await fetch(FN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      goal: req.goal,
      servings: req.servings,
      prefs: req.prefs,
      pantry: req.pantry,
      meals: req.meals,
      history: req.history,
    }),
  });

  if (!res.ok) {
    throw new Error(`AI Chef request failed: ${res.status}`);
  }

  const data = await res.json();
  const raw = Array.isArray(data?.suggestions) ? data.suggestions : [];

  const mealById = new Map(req.meals.map((m) => [m.id, m]));

  return raw.map((s: Partial<AISuggestion>, i: number) => {
    const matched = s.mealId ? mealById.get(s.mealId) : undefined;
    return {
      id: `ai-${Date.now()}-${i}`,
      mealId: s.mealId ?? undefined,
      name: String(s.name ?? 'Untitled dish'),
      emoji: String(s.emoji ?? '🍽️'),
      time: String(s.time ?? '30 min'),
      difficulty: (s.difficulty as AISuggestion['difficulty']) ?? 'Easy',
      calories: Number(s.calories ?? 0),
      rationale: String(s.rationale ?? ''),
      usesIngredients: Array.isArray(s.usesIngredients) ? s.usesIngredients : [],
      missingIngredients: Array.isArray(s.missingIngredients) ? s.missingIngredients : [],
      matchScore: Math.min(99, Math.max(40, Math.round(Number(s.matchScore ?? 70)))),
      image: matched?.image ?? pickNovelImage(req.goal),
    };
  });
}
