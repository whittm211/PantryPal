$ErrorActionPreference = "Stop"

Write-Host "Checking Android signing prerequisites..."
Write-Host ""

$java = Get-Command java -ErrorAction SilentlyContinue
if (-not $java) {
  throw "java was not found on PATH. Install a JDK, then open a new PowerShell window."
}

$keytool = Get-Command keytool -ErrorAction SilentlyContinue
if (-not $keytool) {
  throw "keytool was not found on PATH. Install a JDK and make sure JAVA_HOME\bin is on PATH."
}

Write-Host "java: $($java.Source)"
Write-Host "keytool: $($keytool.Source)"

if ($env:JAVA_HOME) {
  Write-Host "JAVA_HOME: $env:JAVA_HOME"
  $javaHomeKeytool = Join-Path $env:JAVA_HOME "bin\keytool.exe"
  if (-not (Test-Path $javaHomeKeytool)) {
    Write-Warning "JAVA_HOME is set, but keytool.exe was not found at $javaHomeKeytool"
  }
} else {
  Write-Warning "JAVA_HOME is not set. Gradle can still work if Java is on PATH, but setting JAVA_HOME is recommended."
}

Write-Host ""
Write-Host "Java version:"
& java -version

Write-Host ""
Write-Host "Prerequisites look ready."
Write-Host "Next command:"
Write-Host ".\scripts\generate-android-keystore.ps1"
