# Meal Photo Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop PantryPal from showing broad cuisine photos as if they were exact recipe photos.

**Architecture:** Add a focused photo resolver that only returns approved meal-specific photos from a registry. Generated curated meals will no longer receive cuisine-level shared `image` URLs, and UI surfaces will resolve photos through the registry before rendering `ImageWithFallback`.

**Tech Stack:** React 18, TypeScript, Vite, Vitest.

---

### Task 1: Meal Photo Registry

**Files:**
- Create: `src/app/mealPhotos.ts`
- Test: `src/app/mealPhotos.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import type { Meal } from './data';
import { getMealPhoto, mealPhotoRegistry } from './mealPhotos';

const baseMeal: Meal = {
  id: 'unknown',
  name: 'Unknown Meal',
  emoji: '🍽️',
  time: '10 min',
  difficulty: 'Easy',
  usesIds: [],
  missingIds: [],
  description: 'Test meal.',
  servings: 1,
  ingredients: [],
  instructions: [],
  image: 'https://images.unsplash.com/photo-generic-cuisine',
};

describe('getMealPhoto', () => {
  it('returns a registry-approved exact or close photo by meal id', () => {
    const meal = { ...baseMeal, id: 'efr', name: 'Egg Fried Rice' };

    expect(getMealPhoto(meal)).toMatchObject({
      url: mealPhotoRegistry.efr.url,
      alt: 'Egg Fried Rice',
      match: 'close',
    });
  });

  it('does not trust generic image fields on meals without registry entries', () => {
    expect(getMealPhoto(baseMeal)).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/app/mealPhotos.test.ts`

Expected: FAIL because `src/app/mealPhotos.ts` does not exist.

- [ ] **Step 3: Add the registry and resolver**

```ts
import type { Meal } from './data';

export type MealPhoto = {
  url: string;
  alt: string;
  source: string;
  credit?: string;
  match: 'exact' | 'close';
};

export const mealPhotoRegistry: Record<string, MealPhoto> = {
  efr: {
    url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Egg Fried Rice',
    source: 'Unsplash',
    match: 'close',
  },
};

export function getMealPhoto(meal: Meal): MealPhoto | null {
  return mealPhotoRegistry[meal.id] ?? null;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/app/mealPhotos.test.ts`

Expected: PASS.

### Task 2: Stop Assigning Shared Cuisine Photos

**Files:**
- Modify: `src/app/curatedMeals.ts`

- [ ] **Step 1: Write the failing assertion**

Extend `src/app/mealPhotos.test.ts`:

```ts
import { curatedMeals } from './curatedMeals';

it('generated curated meals do not carry shared cuisine image URLs', () => {
  expect(curatedMeals.some((meal) => meal.image)).toBe(false);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/app/mealPhotos.test.ts`

Expected: FAIL because generated curated meals currently set `image: cat.image`.

- [ ] **Step 3: Remove the shared image assignment**

In `src/app/curatedMeals.ts`, remove `image: cat.image` from the generated `meal` object. Leave category image constants untouched for now to keep the change small.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/app/mealPhotos.test.ts`

Expected: PASS.

### Task 3: Render Only Approved Photos

**Files:**
- Modify: `src/app/screens/Meals.tsx`
- Modify: `src/app/screens/RecipeDetail.tsx`
- Modify: `src/app/screens/AIChef.tsx`
- Modify: `src/app/ai.ts`
- Modify: `src/lib/aiChef.ts`

- [ ] **Step 1: Update meal-card surfaces**

Import `getMealPhoto` and use `const photo = getMealPhoto(meal)` before rendering. Render `ImageWithFallback` only when `photo` exists, using `photo.url` and `photo.alt`.

- [ ] **Step 2: Update AI mapped suggestions**

When an AI suggestion maps to an existing meal, set `image` from `getMealPhoto(meal)?.url` instead of `meal.image`.

- [ ] **Step 3: Keep novel AI images optional**

Novel AI dishes may keep the current goal-based image only if they are not tied to an existing meal. Existing meal recommendations must not inherit unapproved `meal.image`.

### Task 4: Verify

**Files:**
- Existing test and build commands.

- [ ] **Step 1: Run full tests**

Run: `npm test`

Expected: all test files pass.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`

Expected: no TypeScript errors.

- [ ] **Step 3: Run production build**

Run: `$env:VITE_BASE_PATH='/PantryPal/'; npm run build`

Expected: build succeeds.

- [ ] **Step 4: Browser QA**

Open `http://127.0.0.1:5173/`, enter guest mode, open Meal Ideas, and confirm recipes without registry-approved photos show emoji/gradient fallback instead of old cuisine-level photos.
