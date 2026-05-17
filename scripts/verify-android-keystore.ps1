param(
  [string]$OutputDir = ".android-release"
)

$ErrorActionPreference = "Stop"

$keystorePath = Join-Path $OutputDir "upload-keystore.jks"
$base64Path = Join-Path $OutputDir "upload-keystore.base64.txt"

Write-Host "Checking generated Android signing files..."
Write-Host ""

if (-not (Test-Path $keystorePath)) {
  throw "Missing $keystorePath. Run .\scripts\generate-android-keystore.ps1 first."
}

if (-not (Test-Path $base64Path)) {
  throw "Missing $base64Path. Run .\scripts\generate-android-keystore.ps1 first."
}

$keystoreInfo = Get-Item $keystorePath
if ($keystoreInfo.Length -le 0) {
  throw "$keystorePath is empty."
}

$base64 = (Get-Content -Path $base64Path -Raw).Trim()
if (-not $base64) {
  throw "$base64Path is empty."
}

try {
  $decoded = [Convert]::FromBase64String($base64)
} catch {
  throw "$base64Path does not contain valid base64."
}

if ($decoded.Length -ne $keystoreInfo.Length) {
  throw "Decoded ANDROID_KEYSTORE_BASE64 length does not match upload-keystore.jks size."
}

Write-Host "Keystore file: $keystorePath"
Write-Host "Keystore size: $($keystoreInfo.Length) bytes"
Write-Host "Base64 file: $base64Path"
Write-Host "Decoded base64 size: $($decoded.Length) bytes"
Write-Host ""
Write-Host "Generated files look ready."
Write-Host "Add ANDROID_KEYSTORE_BASE64 from $base64Path to GitHub Actions secrets."
Write-Host "This script does not print the base64 secret."
