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

Use [GOOGLE_PLAY_RELEASE.md](./GOOGLE_PLAY_RELEASE.md) for the Google Play listing, Data safety, internal testing, and subscription setup worksheet.

GitHub Actions runs `Mobile Android Build` on pushes and pull requests. It builds the web assets, syncs Capacitor Android, and runs a debug APK build with Gradle.

Successful runs upload a `PantryPal-debug-apk` artifact. Download it from the workflow run summary to install a debug build on an Android test device.

The manual `Mobile Android Release Bundle` workflow builds a signed `.aab` for Google Play after these repository secrets are added:

- `ANDROID_KEYSTORE_BASE64`: base64-encoded upload keystore file.
- `ANDROID_KEYSTORE_PASSWORD`: upload keystore password.
- `ANDROID_KEY_ALIAS`: upload key alias.
- `ANDROID_KEY_PASSWORD`: upload key password.

Generate the upload keystore outside the repo, then base64-encode it before adding the secret. Do not commit `.jks` or keystore password files.

On Windows, use `scripts/generate-android-keystore.ps1`:

```powershell
.\scripts\generate-android-keystore.ps1
```

Use [ANDROID_SIGNING.md](./ANDROID_SIGNING.md) for the full Android upload keystore, backup, GitHub secrets, and signed `.aab` workflow checklist.

It writes local-only files under `.android-release/`:

- `upload-keystore.jks`: keep this private and backed up.
- `upload-keystore.base64.txt`: paste this file's contents into `ANDROID_KEYSTORE_BASE64`.

The `.android-release/` directory and keystore file extensions are ignored by git.

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

The manual `Mobile iOS Build` workflow runs on a macOS GitHub runner. It builds the Capacitor iOS project as a simulator build with code signing disabled. This validates the Xcode project, but it does not create a signed App Store build.

The manual `Mobile iOS Release Archive` workflow builds a signed iOS archive for TestFlight/App Store release candidates after these repository secrets are added:

- `IOS_CERTIFICATE_BASE64`: base64-encoded Apple distribution `.p12` certificate.
- `IOS_CERTIFICATE_PASSWORD`: password for the `.p12` certificate.
- `IOS_PROVISION_PROFILE_BASE64`: base64-encoded App Store provisioning profile for `com.whittm211.pantrypal`.
- `IOS_EXPORT_OPTIONS_PLIST_BASE64`: base64-encoded `ExportOptions.plist` configured for App Store distribution.
- `IOS_KEYCHAIN_PASSWORD`: temporary CI keychain password used only during the GitHub Actions run.

Create the certificate and provisioning profile from the Apple Developer portal, create the matching app record in App Store Connect, and keep the original signing files backed up outside the repo. Do not commit certificates, provisioning profiles, or export option files.

On macOS, base64-encode each signing file before adding it as a GitHub Actions secret:

```bash
base64 -i ios_distribution.p12 | pbcopy
base64 -i PantryPal.mobileprovision | pbcopy
base64 -i ExportOptions.plist | pbcopy
```

Successful release workflow runs upload a `PantryPal-ios-release` artifact. Use the exported `.ipa` from that artifact for Transporter/App Store Connect upload, then send it through TestFlight before App Store review.

## Payments

- iOS: Apple StoreKit / In-App Purchase.
- Android: Google Play Billing.
- Web: Stripe can be added later for web-only subscriptions.

Do not route mobile users to Stripe for premium digital features inside the iOS or Android apps.
