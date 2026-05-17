# Meal Photo Registry Design

## Goal

PantryPal should stop showing misleading meal photos. A recipe card should only show a real photo when the image is a close match for that exact recipe or a very tight food type match. Broad cuisine-level images should not be reused across many unrelated recipes.

## Current Problem

The curated meal library stores `image` on meal objects. Many generated recipes reuse one shared image for an entire cuisine, so recipe names and photos drift apart. This creates bad matches such as a breakfast, soup, sandwich, or dessert showing a generic cuisine photo.

## Approach

Add a meal photo registry that maps meal IDs to curated photo metadata:

```ts
type MealPhoto = {
  url: string;
  alt: string;
  source: string;
  credit?: string;
  match: 'exact' | 'close';
};
```

The UI will resolve images through this registry instead of trusting broad recipe image fields. A meal can show a real photo only when the registry has an approved entry. Meals without an approved photo use the existing emoji/gradient fallback.

## Matching Rules

- `exact`: the photo clearly represents the named meal, for example `Chicken Teriyaki Bowl` uses a chicken teriyaki bowl photo.
- `close`: the photo matches a tight dish format and primary ingredients, for example a generic egg fried rice photo for `Egg Fried Rice`.
- Do not use cuisine-level photos for individual recipes.
- Do not use abstract, atmospheric, cropped, or ingredient-only photos for recipe cards.
- Do not use a photo if it would make a reasonable user think the meal is a different dish.

## Initial Scope

Implement the registry and migrate the rendering path first. Then seed exact or close photos for the most visible recipes:

- Initial home and AI Chef recommendations.
- First visible breakfast, lunch, and dinner recipe cards.
- Any existing hand-curated seed meals in `src/app/data.ts`.

The remaining large generated cookbook can keep emoji fallback until each recipe is curated. This prevents wrong photos while allowing the photo library to improve incrementally.

## Components

- `src/app/mealPhotos.ts`: registry and `getMealPhoto(meal)` helper.
- `src/app/mealPhotos.test.ts`: tests for exact lookup, fallback behavior, and rejecting generic cuisine images.
- Meal card surfaces: `Meals`, `RecipeDetail`, `AIChef`, and any home card that renders `meal.image`.
- Data cleanup: stop assigning shared cuisine images to generated curated meals, or make the resolver ignore those images unless they are registry-approved.

## Data Flow

1. A screen receives a `Meal`.
2. The screen calls `getMealPhoto(meal)`.
3. If an approved registry photo exists, render it with `ImageWithFallback`.
4. If no approved photo exists, render the current emoji/gradient fallback.

## Testing

- Unit tests verify registry lookup by meal ID.
- Unit tests verify missing registry entries return no photo.
- Unit tests verify generated cuisine-level image URLs are not used as approved photos.
- Existing app tests, typecheck, and production build must pass.
- Browser QA should verify that visible meal cards no longer show broad mismatched cuisine photos.

## Release Notes

This is a visual correctness change. It may reduce the number of visible meal photos at first, but any photo that remains should be intentionally matched. The app will look more trustworthy because it will prefer no photo over a wrong photo.
