# PantryPal App Store Release Prep

Last updated: 2026-05-17

Use this worksheet while the Apple Developer Program status is **Membership pending**. The signed archive and TestFlight upload wait until Apple activates the account, but the listing, privacy answers, screenshots, and subscription copy can be prepared now.

## App Identity

- App name: `PantryPal`
- Bundle ID: `com.whittm211.pantrypal`
- Primary category: Food & Drink
- Secondary category: Productivity
- SKU: `pantrypal-ios`
- Platforms: iOS first, Android through Google Play separately

## App Store Listing Draft

- Subtitle: Smart pantry tracking and meal ideas.
- Promotional text: Track what you have, rescue expiring food, and get meal ideas that match your kitchen.
- Short description: PantryPal helps households track food, plan meals, build grocery lists, and reduce waste with pantry-aware suggestions.
- Keywords: pantry, groceries, meal planner, recipes, food tracker, fridge, leftovers, shopping list
- Support URL: `https://whittm211.github.io/PantryPal/support.html`
- Privacy Policy URL: `https://whittm211.github.io/PantryPal/privacy.html`
- Marketing URL: leave blank until a dedicated landing page exists.

## Screenshot Plan

Screenshots should show real PantryPal screens, not generic mockups.

- Welcome or home dashboard.
- Pantry list with expiration signals.
- AI Chef pantry-aware suggestions.
- Fridge Rescue / expiring item suggestion.
- Grocery list.
- Plans screen showing PantryPal Plus as coming soon or enabled, depending on payment status.

Prepare iPhone screenshots for the required App Store Connect device sizes. Reuse the same content across sizes only after checking that text is readable and not cropped. Use [APP_STORE_SCREENSHOTS.md](./APP_STORE_SCREENSHOTS.md) for the capture sizes, shot list, naming, and quality bar.

## Privacy Answers

Apple App Privacy requires the data collected by the app and third-party services to be disclosed in App Store Connect.

Likely PantryPal Data Types:

- Contact Info: email address for signed-in accounts through Supabase authentication.
- User Content: pantry items, grocery items, recipes, meal plans, household data, and preferences.
- Identifiers: Supabase user ID and account/session identifiers.
- Diagnostics: only if crash/error reporting is added later.

Current uses:

- App Functionality: account login, cloud sync, pantry tracking, recipes, grocery lists, preferences, and AI Chef context.
- Analytics: do not mark this unless analytics are added.
- Third-Party Advertising: no.
- Tracking: no, unless future ad or cross-app tracking SDKs are added.

Supabase is used for authentication, cloud storage, and backend functions. Barcode lookups and public recipe imagery may use public data sources as described in `PRIVACY.md` and `ATTRIBUTIONS.md`.

## Subscription Copy

Use the same plan names and benefits in PantryPal, App Store Connect, and Google Play.

- Subscription group display name: `PantryPal Plus`
- Auto-renewable subscription display name: `PantryPal Plus Monthly`
- Product ID: `pantrypal_plus_monthly`
- Price target: `$4.99/mo`
- Review note: PantryPal Plus unlocks advanced AI Chef suggestions, Fridge Rescue, shared household barcode memory, and future receipt scanning support.
- Restore purchases wording: `Restore purchases`

Do not send iOS users to Stripe for premium digital features. Use Apple In-App Purchase for iOS subscriptions.

## Pre-Activation Tasks

- [ ] Prepare app listing text.
- [x] Prepare Support URL.
- [x] Confirm Privacy Policy URL is publicly reachable.
- [ ] Capture screenshot set from the live or local app.
- [ ] Draft subscription group and product names.
- [ ] Keep Apple signing files out of git.

## After Membership Is Active

- [ ] Accept any required Apple agreements in App Store Connect.
- [ ] Create the App ID for `com.whittm211.pantrypal`.
- [ ] Create the App Store Connect app record.
- [ ] Create Apple Distribution certificate and App Store provisioning profile.
- [ ] Add iOS signing secrets to GitHub Actions.
- [ ] Run `Mobile iOS Build`.
- [ ] Run `Mobile iOS Release Archive`.
- [ ] Upload the `.ipa` to App Store Connect.
- [ ] Test in TestFlight before App Store review.
