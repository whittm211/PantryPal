# PantryPal Android Signing

Last updated: 2026-05-17

Use this worksheet to prepare the signed Android App Bundle for Google Play internal testing.

## What This Creates

The local helper script creates:

- `.android-release/upload-keystore.jks`
- `.android-release/upload-keystore.base64.txt`

The `.jks` file is the private Android upload keystore. Keep it private and backed up somewhere safe. If the upload key is lost, Android release management becomes much harder.

Do not commit `.android-release/`, `.jks`, `.keystore`, password files, or copied GitHub secret values.

## Requirements

- A JDK installed locally.
- `keytool` available in PowerShell.
- Access to the PantryPal GitHub repository settings.

Run the preflight check before generating the upload keystore:

```powershell
.\scripts\check-android-signing-prereqs.ps1
```

You can also check `keytool` directly:

```powershell
keytool -help
```

If PowerShell cannot find `keytool`, install a JDK and make sure the JDK `bin` directory is on `PATH`.

## Generate The Upload Keystore

Run from the repo root:

```powershell
.\scripts\generate-android-keystore.ps1
```

The script will ask for:

- Android upload keystore password.
- Android upload key password.

Use strong passwords and save them in a password manager.

Default alias:

```text
pantrypal-upload
```

## Add GitHub Actions Secrets

Go to:

```text
GitHub -> PantryPal -> Settings -> Secrets and variables -> Actions -> New repository secret
```

Add:

- `ANDROID_KEYSTORE_BASE64`: contents of `.android-release/upload-keystore.base64.txt`
- `ANDROID_KEYSTORE_PASSWORD`: the keystore password you entered
- `ANDROID_KEY_ALIAS`: `pantrypal-upload`
- `ANDROID_KEY_PASSWORD`: the key password you entered

Do not paste the raw `.jks` file into chat or commit it to git.

The base64 file is written as plain ASCII text so it can be copied into GitHub Secrets without hidden encoding bytes.

Before adding secrets, verify the generated files:

```powershell
.\scripts\verify-android-keystore.ps1
```

This checks that the keystore exists, the base64 file exists, and the base64 value decodes back to the same byte length as the keystore. It does not print the base64 secret.

## Build The Signed App Bundle

After secrets are added, run:

```text
GitHub -> PantryPal -> Actions -> Mobile Android Release Bundle -> Run workflow
```

Successful runs upload:

```text
PantryPal-release-aab
```

Download the `.aab` artifact and upload it to a Google Play internal testing release after the Play Console app is available.

## Backup Checklist

- [ ] `.android-release/upload-keystore.jks` saved outside the repo.
- [ ] Keystore password saved in a password manager.
- [ ] Key password saved in a password manager.
- [ ] GitHub Actions secrets added.
- [ ] `Mobile Android Release Bundle` workflow passes.
- [ ] `.aab` downloaded from the workflow artifact.
