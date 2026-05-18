# PantryPal Google Play Release Prep

Last updated: 2026-05-17

Use this worksheet to prepare PantryPal for Android internal testing and Google Play review. Keep plan names, public URLs, and subscription wording aligned with [APP_STORE_RELEASE.md](./APP_STORE_RELEASE.md).

## App Identity

- App name: `PantryPal`
- Package name: `com.whittm211.pantrypal`
- Default language: English (United States)
- App type: App
- Category: Food & Drink
- Tags: pantry, groceries, recipes, meal planning
- Contact email: use the project owner email in Play Console.
- Website: `https://whittm211.github.io/PantryPal/marketing.html`
- Privacy policy: `https://whittm211.github.io/PantryPal/privacy.html`

## Store Listing Draft

- Short description: Smart pantry tracking and meal ideas.
- Full description: PantryPal helps households track what food they have, reduce waste, plan meals, build grocery lists, and get pantry-aware AI Chef suggestions. Use Fridge Rescue to prioritize expiring food, organize grocery needs, and keep meal ideas aligned with household preferences.

Required listing assets:

- App icon: use the Android launcher icon already generated for the Capacitor app.
- Feature graphic: create a `1024 x 500` graphic that clearly says PantryPal and shows pantry tracking / meal suggestions.
- Phone screenshots: capture Home, Pantry, AI Chef, Fridge Rescue, Grocery list, and Plans screens.
- Tablet screenshots: optional unless tablet support becomes a launch goal.

Use [APP_STORE_SCREENSHOTS.md](./APP_STORE_SCREENSHOTS.md) as the shared visual shot list, then export Android-specific sizes from the same source screens.

## App Content

Google Play Console will ask for app content declarations before release.

- App access: PantryPal supports guest mode and account sign-in. Provide review notes if a signed-in flow is required for a reviewed feature.
- Ads: no ads.
- Target audience: general household food planning. Do not target children unless the app is redesigned and reviewed for that audience.
- News app: no.
- Health apps: no. PantryPal provides general meal planning and nutrition estimates only.
- Financial features: no.

## Data Safety

Google Play's Data safety form should match the public privacy policy and real app behavior.

Likely Data safety entries:

- Personal info: email address for signed-in accounts through Supabase authentication.
- App activity or app info and performance: only mark if analytics/crash reporting is added later.
- User content: pantry items, grocery items, recipes, meal plans, household data, and preferences.
- Device or other IDs: Supabase user/session identifiers may apply for signed-in accounts.

Current use purposes:

- App functionality: account login, cloud sync, pantry tracking, groceries, recipes, preferences, and AI Chef context.
- Analytics: no, unless analytics are added later.
- Advertising or marketing: no.
- Data sharing: do not mark sharing unless a service receives data outside the processing needed for app functionality.

Services currently relevant to Data safety:

- Supabase for authentication, cloud storage, and backend functions.
- Public barcode/product data sources when barcode lookup is used.
- Public recipe image sources where applicable.

## Internal Testing

Use Google Play internal testing before production.

1. Create the Google Play Console app.
2. Complete app content, Data safety, store listing, and pricing/distribution setup.
3. Follow [ANDROID_SIGNING.md](./ANDROID_SIGNING.md) to create the upload keystore and add GitHub signing secrets.
4. Run the `Mobile Android Release Bundle` workflow after Android signing secrets are configured.
5. Upload the signed `.aab` artifact to an internal testing release.
6. Add internal testers.
7. Test sign-up, guest mode, pantry, grocery list, AI Chef, barcode camera permission, and Plans.
8. Verify install, update, and uninstall behavior on a real Android device.

Internal testing is the fastest Play Console testing lane and is the right first Android distribution step.

Current signed artifact workflow:

- Workflow: `Mobile Android Release Bundle`
- Artifact name: `PantryPal-release-aab`
- App bundle file inside artifact: `app-release.aab`
- First verified successful run: `26007003263`
- Successful artifact created from commit: `be1eab218672612a838f77d4a5c8710cec446eca`

Download a fresh artifact from the latest successful release workflow before each Google Play upload. GitHub Actions artifacts expire, so do not treat the downloaded `.zip` as the long-term source of truth. The long-term source of truth is the repo plus the backed-up private upload keystore.

## Play Console Upload Steps

1. Open Google Play Console.
2. Select the PantryPal app.
3. Go to `Testing` > `Internal testing`.
4. Create a new release.
5. Upload the `app-release.aab` from the `PantryPal-release-aab` artifact.
6. Add release notes, for example: `Initial PantryPal Android internal test build.`
7. Review and roll out to internal testing.
8. Add tester email addresses or a Google Group under the internal testing testers tab.
9. Open the opt-in link on an Android device and install PantryPal from Google Play.
10. Test sign-up, guest mode, pantry, AI Chef, grocery list, barcode camera permission, and Plans.

If Play Console rejects the upload, check the exact message first. Common first-upload blockers are a missing app content declaration, an incomplete Data safety form, or trying to upload a bundle signed with a different upload key than the app record expects.

## Google Play Billing

Use Google Play Billing for Android premium digital features. Do not send Android users to Stripe for PantryPal Plus inside the Android app.

Planned subscription:

- Subscription name: `PantryPal Plus Monthly`
- Product ID: `pantrypal_plus_monthly`
- Base plan: monthly auto-renewing
- Price target: `$4.99/mo`
- Benefits: AI Chef pantry-aware suggestions, Fridge Rescue, shared household barcode memory, and future receipt scanning support.

Before enabling paid Android subscriptions:

- Add Google Play Billing integration to the Android app.
- Add restore/entitlement behavior that matches iOS.
- Test subscription purchase, cancellation, renewal state, and restore state with license testers.
- Keep plan names and benefits aligned with the iOS App Store listing.

## Pre-Release Checklist

- [ ] Create Google Play Console app.
- [ ] Upload icon, feature graphic, and screenshots.
- [ ] Complete Data safety form.
- [ ] Complete app content declarations.
- [ ] Configure Android signing secrets in GitHub using [ANDROID_SIGNING.md](./ANDROID_SIGNING.md).
- [x] Run `Mobile Android Release Bundle`.
- [ ] Upload `.aab` to internal testing.
- [ ] Test Android install and core app flows.
- [ ] Configure Google Play Billing before enabling PantryPal Plus on Android.
