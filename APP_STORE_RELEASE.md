# PantryPal App Store Release Prep

Last updated: 2026-05-29

Use this worksheet now that the Apple Developer Program is active. The next milestone is creating the App Store Connect app record, generating signing assets, adding GitHub Actions secrets, and sending the first PantryPal build to TestFlight.

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
- Terms URL: `https://whittm211.github.io/PantryPal/terms.html`
- Marketing URL: `https://whittm211.github.io/PantryPal/marketing.html`

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

## App Store Connect Setup

1. Open [Apple Developer Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/).
2. Create an explicit App ID for `com.whittm211.pantrypal`.
3. Enable capabilities only when PantryPal actually uses them. Camera access for barcode scanning does not require a special App ID capability.
4. Open [App Store Connect](https://appstoreconnect.apple.com/).
5. Create a new app using:
   - Name: `PantryPal`
   - Bundle ID: `com.whittm211.pantrypal`
   - SKU: `pantrypal-ios`
   - Primary category: `Food & Drink`
6. Add Support, Privacy Policy, Terms, and Marketing URLs from this document.
7. Fill in app privacy answers using the Privacy Answers section below.

## iOS Signing Assets

Create these files outside the repo and keep backups somewhere private:

- Apple Distribution certificate exported as `.p12`
- App Store provisioning profile for `com.whittm211.pantrypal`
- `ExportOptions.plist` for App Store distribution

Add these GitHub Actions secrets after base64-encoding the files:

- `IOS_CERTIFICATE_BASE64`
- `IOS_CERTIFICATE_PASSWORD`
- `IOS_PROVISION_PROFILE_BASE64`
- `IOS_EXPORT_OPTIONS_PLIST_BASE64`
- `IOS_KEYCHAIN_PASSWORD`

Do not commit certificates, provisioning profiles, `.p12` files, or export option files.

On a Mac, base64-copy the files like this:

```bash
base64 -i ios_distribution.p12 | pbcopy
base64 -i PantryPal.mobileprovision | pbcopy
base64 -i ExportOptions.plist | pbcopy
```

## Active Developer Checklist

- [ ] Accept any required Apple agreements in App Store Connect.
- [ ] Create App ID for `com.whittm211.pantrypal`.
- [ ] Create the App Store Connect app record.
- [ ] Prepare app listing text.
- [x] Prepare Support URL.
- [x] Confirm Privacy Policy URL is publicly reachable.
- [x] Prepare Terms URL.
- [x] Prepare Marketing URL.
- [ ] Capture screenshot set from the live or local app.
- [ ] Draft subscription group and product names.
- [ ] Create Apple Distribution certificate.
- [ ] Create App Store provisioning profile.
- [ ] Create `ExportOptions.plist`.
- [ ] Add iOS signing secrets to GitHub Actions.
- [ ] Keep Apple signing files out of git.

## TestFlight Release

- [ ] Run `Mobile iOS Build`.
- [ ] Run `Mobile iOS Release Archive`.
- [ ] Upload the `.ipa` to App Store Connect.
- [ ] Test in TestFlight before App Store review.
