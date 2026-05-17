param(
  [string]$Alias = "pantrypal-upload",
  [string]$OutputDir = ".android-release",
  [string]$KeystorePassword,
  [string]$KeyPassword
)

$ErrorActionPreference = "Stop"

function Convert-SecureStringToPlainText {
  param([Security.SecureString]$SecureString)

  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
  try {
    [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  } finally {
    if ($ptr -ne [IntPtr]::Zero) {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
  }
}

if (-not (Get-Command keytool -ErrorAction SilentlyContinue)) {
  throw "keytool was not found. Install a JDK and make sure JAVA_HOME/bin is on PATH."
}

if (-not $KeystorePassword) {
  $secure = Read-Host "Android upload keystore password" -AsSecureString
  $KeystorePassword = Convert-SecureStringToPlainText $secure
}

if (-not $KeyPassword) {
  $secure = Read-Host "Android upload key password" -AsSecureString
  $KeyPassword = Convert-SecureStringToPlainText $secure
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$keystorePath = Join-Path $OutputDir "upload-keystore.jks"
$base64Path = Join-Path $OutputDir "upload-keystore.base64.txt"

if (Test-Path $keystorePath) {
  throw "$keystorePath already exists. Move it somewhere safe or delete it before generating a new upload keystore."
}

keytool `
  -genkeypair `
  -v `
  -keystore $keystorePath `
  -alias $Alias `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000 `
  -storepass $KeystorePassword `
  -keypass $KeyPassword `
  -dname "CN=PantryPal, OU=Mobile, O=PantryPal, L=Local, ST=NA, C=US"

$bytes = [System.IO.File]::ReadAllBytes((Resolve-Path $keystorePath))
[Convert]::ToBase64String($bytes) | Set-Content -Path $base64Path -NoNewline

Write-Host ""
Write-Host "Android upload keystore generated locally."
Write-Host "Do not commit files in $OutputDir."
Write-Host ""
Write-Host "Add these GitHub Actions secrets:"
Write-Host "ANDROID_KEYSTORE_BASE64 = contents of $base64Path"
Write-Host "ANDROID_KEYSTORE_PASSWORD = the keystore password you entered"
Write-Host "ANDROID_KEY_ALIAS = $Alias"
Write-Host "ANDROID_KEY_PASSWORD = the key password you entered"
