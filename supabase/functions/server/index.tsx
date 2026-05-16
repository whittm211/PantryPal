import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

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
// Server-side so the OPENAI_API_KEY never leaves the edge runtime. Uses
// structured JSON output so we can trust the shape on the client.
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

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
            matchScore: { type: "number" },
          },
          required: [
            "mealId", "name", "emoji", "time", "difficulty", "calories",
            "rationale", "usesIngredients", "missingIngredients", "matchScore",
          ],
        },
      },
    },
    required: ["suggestions"],
  },
};

app.post("/make-server-e808db2a/ai-chef", async (c) => {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return c.json({ error: "OPENAI_API_KEY not configured" }, 500);
  }

  let body: {
    pantry?: Array<{ id: string; name: string; expiresInDays: number; category?: string }>;
    meals?: Array<{ id: string; name: string; emoji: string; time: string; difficulty: string; calories?: number; dietTags?: string[] }>;
    prefs?: { diets?: string[]; allergies?: string[]; dailyCalorieGoal?: number };
    history?: Array<{ mealId: string }>;
    goal?: string;
    servings?: number;
  } = {};
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const system = [
    "You are PantryPal's AI Chef. You recommend meals using the user's pantry,",
    "honoring their dietary preferences and the requested goal.",
    "Prefer meals from the provided library when a strong fit exists (set mealId to that meal's id).",
    "When improvising a novel dish, set mealId to null.",
    "Prioritize ingredients expiring soon. Avoid meals the user cooked very recently.",
    "Return 3–4 suggestions, sorted best-first. matchScore is 40–99.",
  ].join(" ");

  const user = JSON.stringify({
    goal: body.goal,
    servings: body.servings,
    prefs: body.prefs,
    pantry: (body.pantry ?? []).map((p) => ({
      id: p.id, name: p.name, category: p.category, expiresInDays: p.expiresInDays,
    })),
    meals: (body.meals ?? []).map((m) => ({
      id: m.id, name: m.name, emoji: m.emoji, time: m.time,
      difficulty: m.difficulty, calories: m.calories, dietTags: m.dietTags,
    })),
    recentlyCookedMealIds: (body.history ?? []).slice(-5).map((h) => h.mealId),
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
      return c.json({ error: "AI request failed" }, 502);
    }

    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);
    return c.json(parsed);
  } catch (err) {
    console.error("[ai-chef]", err);
    return c.json({ error: "AI request failed" }, 500);
  }
});

Deno.serve(app.fetch);
