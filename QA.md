# PantryPal Manual QA

Use this checklist before deploying a web MVP. Run it in a normal browser after starting the app with `npm run dev` or against a deployed preview URL.

## Automated Checks

Run these first:

```powershell
npm test
npm run typecheck
npm run build
```

## Guest Mode MVP Flow

- [x] Welcome screen loads.
- [x] `Continue as Guest` opens the home dashboard.
- [x] Home dashboard shows pantry counts, expiring items, low-stock items, and meal suggestions.
- [x] Add Food screen opens from bottom navigation.
- [x] A manually entered pantry item can be saved.
- [x] Save success state appears after adding a pantry item.
- [x] New pantry item appears in My Pantry.
- [x] Pantry item detail opens from the pantry list.
- [x] Pantry item can be deleted after confirmation.
- [x] Grocery List opens from bottom navigation.
- [x] A manually entered grocery item can be added.
- [x] Meal Ideas opens from bottom navigation.
- [x] Recipe detail opens from a meal card.
- [x] A recipe can be added to today's meal plan.
- [x] Settings opens from the profile button.
- [x] Settings shows local guest mode status.
- [x] Settings shows JSON/CSV export controls.
- [ ] Verify JSON export downloads a backup file in Chrome, Edge, or Firefox.
- [ ] Verify CSV export downloads a backup file in Chrome, Edge, or Firefox.
- [ ] Verify importing a JSON backup restores pantry, grocery, recipe, and settings data.

## Notes From Codex In-App Browser QA

The Codex in-app browser confirmed the main guest-mode flow and found no console errors during the checks above. It cannot complete real file downloads, so export/import must still be verified in a normal browser.

During QA, a temporary grocery item named `QA Bananas` was added. Remove it manually from the Grocery List if it is still present in local browser state.
