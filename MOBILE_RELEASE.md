# PantryPal Mobile Release

PantryPal uses Capacitor to ship the same React/Vite app to web, Android, and iOS.

## Shared App Identity

- App name: `PantryPal`
- App ID / bundle ID: `com.whittm211.pantrypal`
- Web build output: `dist`

## Local Commands

```bash
npm run build
npx cap sync
npx cap open android
npx cap open ios
```

The npm shortcuts are:

```bash
npm run mobile:sync
npm run mobile:android
npm run mobile:ios
```

## Android

1. Install Android Studio.
2. Install a JDK and set `JAVA_HOME` so Gradle can run.
3. Open the generated `android/` project with `npm run mobile:android`.
4. Confirm camera permission behavior for barcode scanning.
5. Create a Google Play Console app.
6. Configure Google Play Billing before enabling paid Android subscriptions.
7. Generate a signed Android App Bundle (`.aab`) for Play Store upload.
8. Use Google Play internal testing before production release.

GitHub Actions runs `Mobile Android Build` on pushes and pull requests. It builds the web assets, syncs Capacitor Android, and runs a debug APK build with Gradle.

Successful runs upload a `PantryPal-debug-apk` artifact. Download it from the workflow run summary to install a debug build on an Android test device.

To run the same Android debug build locally after Java is installed:

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug --no-daemon
```

## iOS

1. Use a Mac with Xcode installed for building and signing.
2. Open the generated `ios/` project with `npm run mobile:ios`.
3. Select the Apple Developer team in Xcode signing settings.
4. Confirm camera permission text for barcode scanning.
5. Create the app in App Store Connect.
6. Configure StoreKit subscriptions before enabling paid iOS subscriptions.
7. Upload to TestFlight before App Store review.

## Payments

- iOS: Apple StoreKit / In-App Purchase.
- Android: Google Play Billing.
- Web: Stripe can be added later for web-only subscriptions.

Do not route mobile users to Stripe for premium digital features inside the iOS or Android apps.
