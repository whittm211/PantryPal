# PantryPal Privacy

Last updated: 2026-05-17

This document describes the current PantryPal web app behavior for launch.

## Data PantryPal Stores

PantryPal may store:

- Pantry items.
- Grocery list items.
- Meal plans.
- Favorite and cooked recipes.
- Custom recipes.
- Household members and invite status.
- Diet and cooking preferences.
- App settings such as theme, reminders, and accessibility preferences.

## Guest Mode

Guest mode stores app data locally in the browser on the current device.

Guest data is not intended to sync across devices. Clearing browser data, changing browsers, or using a different device can remove or hide guest data.

Users can create a backup from Settings -> Data -> Export JSON.

## Signed-In Accounts

Signed-in accounts use Supabase for authentication and cloud sync.

When signed in, PantryPal can sync pantry, grocery, meal, household, recipe, preference, and settings data through Supabase-backed storage so the same account can access data across sessions.

## AI Chef

AI Chef uses pantry items, expiring items, preferences, meal history, selected mode, and available recipe data to suggest meals.

The app attempts to use the PantryPal backend for AI Chef requests. If the remote request fails or times out, PantryPal uses local fallback logic to produce meal suggestions.

Do not enter sensitive personal information into AI Chef prompts or recipe fields.

## Export And Import

Users can export app data from Settings -> Data -> Export JSON.

Importing a backup can replace current pantry data and, when included in the backup, app settings.

## Notifications

If enabled and supported by the browser, PantryPal can request notification permission for reminders such as expiring food, low-stock items, and meal prep. Browser notification permissions can be changed in browser or device settings.

## Third-Party Services

PantryPal currently uses:

- Supabase for authentication, cloud storage, and backend functions.
- Public product data sources for barcode lookup when available.
- Public image sources for recipe imagery, credited in `ATTRIBUTIONS.md` where applicable.

## User Responsibilities

Users should:

- Review ingredients for allergies and dietary restrictions.
- Treat nutrition information as an estimate.
- Export guest data before clearing browser storage.
- Keep account credentials private.

## Contact

For privacy or support questions, contact the PantryPal project owner or use the GitHub repository issue tracker.
