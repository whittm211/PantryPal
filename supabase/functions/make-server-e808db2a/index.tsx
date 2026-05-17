import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";

const app = new Hono();

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-e808db2a/health", (c) => {
  return c.json({ status: "ok" });
});

// ---------- Barcode lookup ----------
// Proxies Open Food Facts so we can normalize the response shape and add
// our own caching / rate-limiting later. No API key required by OFF.
const OFF_BASE = "https://world.openfoodfacts.org/api/v2/product";

type LookupResult = {
  found: boolean;
  barcode: string;
  name?: string;
  brand?: string;
  category?: string;
  emoji?: string;
  suggestedExpiryDays?: number;
  imageUrl?: string;
};

function guessCategory(off: { categories_tags?: string[] } | undefined): { category: string; emoji: string; days: number } {
  const tags = (off?.categories_tags ?? []).join(" ");
  if (/dairy|milk|yogurt|cheese|butter/i.test(tags)) return { category: "Dairy", emoji: "🥛", days: 10 };
  if (/meat|fish|seafood|poultry|chicken|beef|pork/i.test(tags)) return { category: "Protein", emoji: "🥩", days: 4 };
  if (/fruit|vegetable|produce|salad/i.test(tags)) return { category: "Produce", emoji: "🥬", days: 7 };
  if (/bread|cereal|grain|rice|pasta|flour/i.test(tags)) return { category: "Grains", emoji: "🌾", days: 30 };
  if (/snack|chocolate|candy|cookie|chip|crisp/i.test(tags)) return { category: "Snacks", emoji: "🍪", days: 90 };
  if (/frozen/i.test(tags)) return { category: "Frozen", emoji: "🧊", days: 120 };
  return { category: "Other", emoji: "🛒", days: 14 };
}

app.get("/make-server-e808db2a/lookup-barcode/:code", async (c) => {
  const code = c.req.param("code")?.trim();
  if (!code || !/^\d{6,14}$/.test(code)) {
    return c.json({ error: "Invalid barcode" }, 400);
  }
  try {
    const res = await fetch(`${OFF_BASE}/${code}.json?fields=product_name,brands,categories_tags,image_front_small_url`);
    if (!res.ok) {
      return c.json<LookupResult>({ found: false, barcode: code }, 200);
    }
    const body = await res.json();
    if (body.status !== 1 || !body.product) {
      return c.json<LookupResult>({ found: false, barcode: code }, 200);
    }
    const p = body.product as {
      product_name?: string;
      brands?: string;
      categories_tags?: string[];
      image_front_small_url?: string;
    };
    const { category, emoji, days } = guessCategory(p);
    return c.json<LookupResult>({
      found: Boolean(p.product_name),
      barcode: code,
      name: p.product_name?.trim(),
      brand: p.brands?.split(",")[0]?.trim(),
      category,
      emoji,
      suggestedExpiryDays: days,
      imageUrl: p.image_front_small_url,
    });
  } catch (err) {
    console.error("[lookup-barcode]", err);
    return c.json({ error: "Lookup failed" }, 500);
  }
});

// ---------- AI Chef (OpenAI) ----------
// Server-side so the OPENAI_API_KEY never leaves the edge runtime. The fallback
// mirrors the client scorer so AI Chef stays useful if the model call fails.
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

type AIChefMode =
  | "fridge-rescue"
  | "lazy"
  | "budget"
  | "high-protein"
  | "healthy"
  | "comfort"
  | "kid-friendly"
  | "15-minute"
  | "one-pan"
  | "surprise";

type PantryItem = {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  expiresInDays: number;
  category?: string;
};

type MealInput = {
  id: string;
  name: string;
  emoji: string;
  time: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  calories?: number;
  protein?: number;
  dietTags?: string[];
  usesIds?: string[];
  missingIds?: string[];
  ingredients?: Array<{ name: string; amount?: string; unit?: string; pantryId?: string }>;
  instructions?: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: number;
};

type DietPrefs = {
  diets?: string[];
  allergies?: string[];
  dailyCalorieGoal?: number;
  dislikedIngredients?: string[];
  preferredCookTime?: number;
  budgetLevel?: "low" | "medium" | "flexible" | string;
  servingSize?: number;
  cookingSkill?: "beginner" | "intermediate" | "advanced" | string;
};

type AIChefRequest = {
  pantry?: PantryItem[];
  meals?: MealInput[];
  prefs?: DietPrefs;
  history?: Array<{ mealId: string }>;
  goal?: string;
  mode?: AIChefMode;
  servings?: number;
  promptContext?: string;
};

type MealSuggestion = {
  mealId: string | null;
  name: string;
  emoji: string;
  time: string;
  difficulty: "Easy" | "Medium" | "Hard";
  calories: number;
  rationale: string;
  usesIngredients: string[];
  missingIngredients: string[];
  expiringIngredients: string[];
  substitutions: Array<{ ingredient: string; substitute: string; note: string }>;
  groceryUnlocks: Array<{ ingredient: string; unlockCount: number; mealNames: string[] }>;
  matchScore: number;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
};

const AI_CHEF_SCHEMA = {
  name: "meal_recommendations",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      suggestions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            mealId: { type: ["string", "null"] },
            name: { type: "string" },
            emoji: { type: "string" },
            time: { type: "string" },
            difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
            calories: { type: "number" },
            rationale: { type: "string" },
            usesIngredients: { type: "array", items: { type: "string" } },
            missingIngredients: { type: "array", items: { type: "string" } },
            expiringIngredients: { type: "array", items: { type: "string" } },
            substitutions: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  ingredient: { type: "string" },
                  substitute: { type: "string" },
                  note: { type: "string" },
                },
                required: ["ingredient", "substitute", "note"],
              },
            },
            groceryUnlocks: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  ingredient: { type: "string" },
                  unlockCount: { type: "number" },
                  mealNames: { type: "array", items: { type: "string" } },
                },
                required: ["ingredient", "unlockCount", "mealNames"],
              },
            },
            matchScore: { type: "number" },
            prepTime: { type: "string" },
            cookTime: { type: "string" },
            servings: { type: "number" },
            ingredients: { type: "array", items: { type: "string" } },
            instructions: { type: "array", items: { type: "string" } },
          },
          required: [
            "mealId",
            "name",
            "emoji",
            "time",
            "difficulty",
            "calories",
            "rationale",
            "usesIngredients",
            "missingIngredients",
            "expiringIngredients",
            "substitutions",
            "groceryUnlocks",
            "matchScore",
            "prepTime",
            "cookTime",
            "servings",
            "ingredients",
            "instructions",
          ],
        },
      },
    },
    required: ["suggestions"],
  },
};

const SUBSTITUTIONS: Record<string, { substitute: string; note: string }> = {
  "sour cream": { substitute: "Greek yogurt", note: "Same tangy creaminess with more protein." },
  butter: { substitute: "olive oil", note: "Use a little less oil than butter for sauteing." },
  milk: { substitute: "cream + water or non-dairy milk", note: "Keeps the liquid and creaminess close." },
  cream: { substitute: "milk + butter", note: "Good for sauces when cream is missing." },
  buttermilk: { substitute: "milk + lemon juice", note: "Let it sit for 5 minutes before using." },
  egg: { substitute: "flax egg or yogurt", note: "Works best in batters and binders." },
  eggs: { substitute: "tofu scramble or flax egg", note: "Choose based on whether the egg is a main ingredient." },
  cheese: { substitute: "nutritional yeast or extra Greek yogurt", note: "Adds savory flavor when cheese is missing." },
  tortilla: { substitute: "pita, lettuce cups, or toast", note: "Use any wrap-like base you have." },
  tortillas: { substitute: "pita, lettuce cups, or toast", note: "Use any wrap-like base you have." },
  rice: { substitute: "quinoa, pasta, or cauliflower rice", note: "Match the cooking time to the swap." },
};

function modeLabel(mode?: AIChefMode): string {
  const labels: Record<AIChefMode, string> = {
    "fridge-rescue": "Fridge Rescue",
    lazy: "Lazy Mode",
    budget: "Budget Meals",
    "high-protein": "High Protein",
    healthy: "Healthy",
    comfort: "Comfort Food",
    "kid-friendly": "Kid Friendly",
    "15-minute": "15-Minute Meals",
    "one-pan": "One-Pan Meals",
    surprise: "Surprise Me",
  };
  return labels[mode ?? "surprise"] ?? "Surprise Me";
}

function titleCase(value: string): string {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()).trim();
}

function clampMatchScore(value: number): number {
  return Math.min(99, Math.max(40, Math.round(value)));
}

function parseMinutes(value?: string): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : 30;
}

function normalizeDifficulty(value?: string): "Easy" | "Medium" | "Hard" {
  if (value === "Hard" || value === "Medium") return value;
  return "Easy";
}

function ingredientNames(meal: MealInput): string[] {
  if (meal.ingredients?.length) {
    return meal.ingredients.map((item) => [item.amount, item.unit, item.name].filter(Boolean).join(" ").trim());
  }
  return [...(meal.usesIds ?? []), ...(meal.missingIds ?? [])].map(titleCase);
}

function smartSubstitutions(missingIngredients: string[]): MealSuggestion["substitutions"] {
  return missingIngredients.flatMap((ingredient) => {
    const normalized = ingredient.toLowerCase();
    const direct = SUBSTITUTIONS[normalized];
    if (direct) return [{ ingredient, ...direct }];
    const partial = Object.entries(SUBSTITUTIONS).find(([key]) => normalized.includes(key));
    return partial ? [{ ingredient, ...partial[1] }] : [];
  });
}

function groceryUnlocks(meals: MealInput[]): MealSuggestion["groceryUnlocks"] {
  const unlocks = new Map<string, string[]>();
  for (const meal of meals) {
    const missing = (meal.missingIds ?? []).map(titleCase);
    for (const ingredient of new Set(missing)) {
      unlocks.set(ingredient, [...(unlocks.get(ingredient) ?? []), meal.name]);
    }
  }
  return [...unlocks.entries()]
    .map(([ingredient, mealNames]) => ({ ingredient, unlockCount: mealNames.length, mealNames: mealNames.slice(0, 4) }))
    .filter((unlock) => unlock.unlockCount > 1)
    .sort((a, b) => b.unlockCount - a.unlockCount)
    .slice(0, 3);
}

function mealScore(meal: MealInput, body: AIChefRequest): number {
  const pantryById = new Map((body.pantry ?? []).map((item) => [item.id, item]));
  const owned = (meal.usesIds ?? []).map((id) => pantryById.get(id)).filter(Boolean) as PantryItem[];
  const missingCount = meal.missingIds?.length ?? 0;
  const expiringCount = owned.filter((item) => item.expiresInDays <= 4).length;
  const minutes = parseMinutes(meal.time);
  const recentIds = new Set((body.history ?? []).slice(-5).map((entry) => entry.mealId));
  const prefs = body.prefs ?? {};

  let score = owned.length * 12 - missingCount * 5 + expiringCount * (body.mode === "fridge-rescue" ? 16 : 8);
  if (body.mode === "15-minute" && minutes <= 15) score += 18;
  if (body.mode === "lazy" && meal.difficulty === "Easy") score += 10;
  if (body.mode === "budget" && missingCount <= 1) score += 14;
  if (body.mode === "high-protein" && (meal.protein ?? 0) >= 25) score += 14;
  if (body.mode === "healthy" && (meal.calories ?? 999) <= 500) score += 8;
  if (body.mode === "comfort" && /pasta|soup|stew|cheese|burger|curry/i.test(meal.name)) score += 8;
  if (body.mode === "one-pan" && /skillet|stir fry|bowl|sheet pan|frittata/i.test(meal.name)) score += 10;
  if (prefs.preferredCookTime && minutes > prefs.preferredCookTime) score -= 8;
  if (prefs.cookingSkill === "beginner" && meal.difficulty === "Hard") score -= 12;
  if (recentIds.has(meal.id)) score -= 10;

  const searchable = [meal.name, ...(meal.ingredients ?? []).map((item) => item.name)].join(" ").toLowerCase();
  for (const allergy of prefs.allergies ?? []) {
    if (allergy && searchable.includes(allergy.toLowerCase())) score -= 35;
  }
  for (const disliked of prefs.dislikedIngredients ?? []) {
    if (disliked && searchable.includes(disliked.toLowerCase())) score -= 18;
  }
  return score;
}

function fallbackSuggestions(body: AIChefRequest): { suggestions: MealSuggestion[]; fallback: true } {
  const pantryById = new Map((body.pantry ?? []).map((item) => [item.id, item]));
  const unlocks = groceryUnlocks(body.meals ?? []);
  const suggestions = (body.meals ?? [])
    .map((meal) => {
      const owned = (meal.usesIds ?? []).map((id) => pantryById.get(id)).filter(Boolean) as PantryItem[];
      const missing = (meal.missingIds ?? []).map(titleCase);
      const expiring = owned.filter((item) => item.expiresInDays <= 4).map((item) => item.name);
      const linkedCount = owned.length + missing.length;
      const matchBase = linkedCount > 0 ? (owned.length / linkedCount) * 100 : 55;
      const score = mealScore(meal, body);

      return {
        mealId: meal.id,
        name: meal.name,
        emoji: meal.emoji || "🍽️",
        time: meal.time || "30 min",
        difficulty: normalizeDifficulty(meal.difficulty),
        calories: meal.calories ?? 0,
        rationale: `${modeLabel(body.mode)} pick using ${owned.length ? owned.map((item) => item.name).join(", ") : "your current pantry"}${expiring.length ? `, especially ${expiring.join(", ")} before it expires` : ""}.`,
        usesIngredients: owned.map((item) => item.name),
        missingIngredients: missing,
        expiringIngredients: expiring,
        substitutions: smartSubstitutions(missing),
        groceryUnlocks: unlocks,
        matchScore: clampMatchScore(matchBase + score * 0.6),
        prepTime: meal.prepTime ?? "10 min",
        cookTime: meal.cookTime ?? meal.time ?? "30 min",
        servings: meal.servings ?? body.servings ?? body.prefs?.servingSize ?? 2,
        ingredients: ingredientNames(meal),
        instructions: meal.instructions?.length ? meal.instructions : ["Gather ingredients.", "Cook until hot and seasoned to taste.", "Serve while fresh."],
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 4);

  return { suggestions, fallback: true };
}

function normalizeAISuggestions(parsed: unknown, body: AIChefRequest): { suggestions: MealSuggestion[] } | null {
  const raw = (parsed as { suggestions?: unknown })?.suggestions;
  if (!Array.isArray(raw)) return null;
  const mealById = new Map((body.meals ?? []).map((meal) => [meal.id, meal]));
  const unlocks = groceryUnlocks(body.meals ?? []);

  return {
    suggestions: raw.slice(0, 4).map((item, index) => {
      const suggestion = item as Partial<MealSuggestion>;
      const meal = suggestion.mealId ? mealById.get(suggestion.mealId) : undefined;
      const missing = Array.isArray(suggestion.missingIngredients) ? suggestion.missingIngredients : [];
      return {
        mealId: suggestion.mealId ?? meal?.id ?? null,
        name: suggestion.name ?? meal?.name ?? `Kitchen idea ${index + 1}`,
        emoji: suggestion.emoji ?? meal?.emoji ?? "🍽️",
        time: suggestion.time ?? meal?.time ?? "30 min",
        difficulty: normalizeDifficulty(suggestion.difficulty ?? meal?.difficulty),
        calories: Number(suggestion.calories ?? meal?.calories ?? 0),
        rationale: suggestion.rationale ?? "A pantry-aware suggestion based on your current kitchen context.",
        usesIngredients: Array.isArray(suggestion.usesIngredients) ? suggestion.usesIngredients : [],
        missingIngredients: missing,
        expiringIngredients: Array.isArray(suggestion.expiringIngredients) ? suggestion.expiringIngredients : [],
        substitutions: Array.isArray(suggestion.substitutions) ? suggestion.substitutions : smartSubstitutions(missing),
        groceryUnlocks: Array.isArray(suggestion.groceryUnlocks) ? suggestion.groceryUnlocks : unlocks,
        matchScore: clampMatchScore(Number(suggestion.matchScore ?? 70)),
        prepTime: suggestion.prepTime ?? meal?.prepTime ?? "10 min",
        cookTime: suggestion.cookTime ?? meal?.cookTime ?? suggestion.time ?? meal?.time ?? "30 min",
        servings: Number(suggestion.servings ?? meal?.servings ?? body.servings ?? body.prefs?.servingSize ?? 2),
        ingredients: Array.isArray(suggestion.ingredients) ? suggestion.ingredients : (meal ? ingredientNames(meal) : []),
        instructions: Array.isArray(suggestion.instructions) ? suggestion.instructions : meal?.instructions ?? [],
      };
    }),
  };
}

app.post("/make-server-e808db2a/ai-chef", async (c) => {
  const apiKey = Deno.env.get("OPENAI_API_KEY");

  let body: AIChefRequest = {};
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  if (!apiKey) {
    console.warn("[ai-chef] OPENAI_API_KEY not configured; using fallback suggestions");
    return c.json(fallbackSuggestions(body));
  }

  const system = [
    "You are PantryPal's AI Chef, a practical smart kitchen assistant.",
    "Recommend meals using the user's pantry, expiring food, preferences, and selected meal mode.",
    "Prefer meals from the provided library when a strong fit exists (set mealId to that meal's id).",
    "When improvising a novel dish, set mealId to null.",
    "Prioritize ingredients expiring soon, especially in Fridge Rescue mode.",
    "Respect allergies and disliked ingredients. Avoid meals the user cooked very recently.",
    "Suggest substitutions for missing ingredients and small grocery additions that unlock more meals.",
    "Return 3-4 suggestions, sorted best-first. matchScore is 40-99.",
  ].join(" ");

  const user = JSON.stringify({
    mode: body.mode ?? body.goal,
    modeLabel: modeLabel(body.mode),
    servings: body.servings ?? body.prefs?.servingSize,
    prefs: body.prefs,
    pantry: (body.pantry ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      unit: p.unit,
      category: p.category,
      expiresInDays: p.expiresInDays,
    })),
    expiringItems: (body.pantry ?? [])
      .filter((p) => p.expiresInDays <= 4)
      .sort((a, b) => a.expiresInDays - b.expiresInDays)
      .map((p) => ({ id: p.id, name: p.name, expiresInDays: p.expiresInDays })),
    meals: (body.meals ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      emoji: m.emoji,
      time: m.time,
      difficulty: m.difficulty,
      calories: m.calories,
      protein: m.protein,
      dietTags: m.dietTags,
      usesIds: m.usesIds,
      missingIds: m.missingIds,
      prepTime: m.prepTime,
      cookTime: m.cookTime,
      servings: m.servings,
      ingredients: m.ingredients,
      instructions: m.instructions,
    })),
    recentlyCookedMealIds: (body.history ?? []).slice(-5).map((h) => h.mealId),
    promptContext: body.promptContext,
  });

  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_schema", json_schema: AI_CHEF_SCHEMA },
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[ai-chef] OpenAI error", res.status, errText);
      return c.json(fallbackSuggestions(body));
    }

    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content ?? "{}";
    const normalized = normalizeAISuggestions(JSON.parse(content), body);
    return c.json(normalized ?? fallbackSuggestions(body));
  } catch (err) {
    console.error("[ai-chef]", err);
    return c.json(fallbackSuggestions(body));
  }
});

Deno.serve(app.fetch);
