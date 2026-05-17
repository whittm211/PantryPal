# PantryPal App Store Screenshots

Last updated: 2026-05-17

Use this worksheet to capture real PantryPal screenshots for App Store Connect after the iOS app record is available. The goal is a clean set of product screenshots that show the app doing actual food tracking and meal planning work.

## Capture Sizes

Prepare these iPhone screenshot sizes first:

- 6.9-inch display: `1290 x 2796`
- 6.7-inch display: `1290 x 2796`
- 6.5-inch display: `1242 x 2688`
- 6.3-inch display: `1179 x 2556`
- 5.5-inch display: `1242 x 2208`

If App Store Connect accepts a smaller subset for the current device matrix, keep the larger current-device screenshots as the source set and derive any older sizes from those.

## Capture Setup

Use real PantryPal screens. Avoid generic mockups, placeholder crops, or screenshots with browser chrome.

1. Open the local app or public app.
2. Continue as guest if a clean signed-in demo account is not ready.
3. Use the seeded pantry and grocery data for launch screenshots.
4. Keep text readable and avoid cropped buttons.
5. Use the same theme across the set.
6. Re-capture after major UI changes.

Recommended local URL:

```text
http://127.0.0.1:5173/?app-store-screenshots=1
```

## Shot List

1. Welcome
   - Show the PantryPal entry screen.
   - Purpose: make the app identity obvious.

2. Home dashboard
   - Show pantry status, expiring food, and quick actions.
   - Purpose: show daily kitchen overview.

3. Pantry
   - Show stocked items with expiration/low-stock signals.
   - Purpose: communicate food tracking and waste prevention.

4. AI Chef
   - Show pantry-aware suggestions with owned/missing ingredients.
   - Purpose: show smart meal recommendations.

5. Fridge Rescue
   - Show AI Chef or meal suggestions prioritizing expiring food.
   - Purpose: communicate expiring food rescue.

6. Grocery list
   - Show list items and pantry move/bought state if available.
   - Purpose: show shopping workflow.

7. Plans
   - Show Free and PantryPal Plus comparison.
   - Purpose: show the subscription surface before enabling purchases.

## Quality Bar

- No visible debug panels, dev overlays, browser UI, or broken image icons.
- No personal email addresses or real private pantry data.
- No clipped text, overlapped controls, or unreadable small labels.
- Screenshots should feel like the same app, not unrelated screens stitched together.
- If Plus is not purchasable yet, keep wording as coming soon or disabled.

## File Naming

Use predictable names when exporting screenshots:

```text
01-welcome-1290x2796.png
02-home-dashboard-1290x2796.png
03-pantry-1290x2796.png
04-ai-chef-1290x2796.png
05-fridge-rescue-1290x2796.png
06-grocery-list-1290x2796.png
07-plans-1290x2796.png
```

Store final App Store screenshots outside git unless the images are intentionally being versioned for a release package.
