# PantryPal Release Checklist

Last updated: 2026-05-17

## V1 Launch Readiness

- [x] Public GitHub Pages deployment is live.
- [x] Supabase backend function is deployed.
- [x] Production smoke test passes.
- [x] Guest mode works.
- [x] Sign up, email confirmation, and sign in flow tested by project owner.
- [x] Pantry add, edit, and delete flows work.
- [x] Grocery add, check, delete, and bought-item pantry flow work.
- [x] Meals page loads 50 recipes.
- [x] Recipe images are present for meals.
- [x] AI Chef returns pantry-aware suggestions.
- [x] AI Chef fallback returns useful suggestions if the remote request times out.
- [x] AI Chef shows owned ingredients, missing ingredients, match percentage, expiring food rescue, and grocery unlocks.
- [x] Recipe detail shows ingredients, instructions, prep time, cook time, difficulty, servings, and nutrition when available.
- [x] Settings includes preferences, sync status, export/import, and Privacy & support.
- [x] Source text encoding guard is in place.
- [x] App Store listing, privacy, screenshot, and subscription prep worksheet exists in [APP_STORE_RELEASE.md](./APP_STORE_RELEASE.md).

## Verification Commands

Run these before any public release announcement:

```powershell
npm run typecheck
npm test
npm run build
npm run smoke:prod
```

## Manual Public QA

Use the public app URL:

https://whittm211.github.io/PantryPal/

Check:

- [ ] Welcome screen loads.
- [ ] Guest mode opens the home dashboard.
- [ ] Sign in works with a confirmed account.
- [ ] Signed-in pantry data persists after refresh.
- [ ] Pantry item can be added, edited, and deleted.
- [ ] Grocery item can be added, checked, deleted, and moved to pantry.
- [ ] Meals page loads recipes and images.
- [ ] AI Chef produces suggestions and exits the generating state.
- [ ] AI Chef recipe navigation opens recipe detail.
- [ ] Settings shows sync status, preferences, export/import, and Privacy & support.

## Post-Launch Roadmap

- Improve barcode product coverage.
- Add receipt scanning.
- Add nutrition API support for richer estimates.
- Add a dedicated support/contact page or support email.
- Add admin cleanup tools for test accounts and test data.
- Consider packaged mobile distribution if PantryPal needs app store presence.
- Complete the Apple Developer membership activation, then follow [APP_STORE_RELEASE.md](./APP_STORE_RELEASE.md) for TestFlight.

## Admin Cleanup

After public QA, use [ADMIN_CLEANUP.md](./ADMIN_CLEANUP.md) to remove disposable QA users and test data from Supabase.
