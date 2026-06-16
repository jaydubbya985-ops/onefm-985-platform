# Connect ONE FM project to Google Drive via rclone (one-time OAuth).
# Run from app root:  powershell -ExecutionPolicy Bypass -File scripts/connect-google-drive.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Invoke-Rclone {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$RcloneArgs)
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $output = & $script:rclone @RcloneArgs 2>&1
  $code = $LASTEXITCODE
  $ErrorActionPreference = $prev
  return @{ Output = $output; ExitCode = $code }
}

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
$script:rclone = (Get-Command rclone -ErrorAction SilentlyContinue).Source
if (-not $script:rclone) {
  Write-Host "rclone not found. Install: winget install Rclone.Rclone" -ForegroundColor Red
  exit 1
}

$remoteName = "onefm-drive"
$configPath = Join-Path $root "scripts\google-drive.config.json"
$examplePath = Join-Path $root "scripts\google-drive.config.example.json"

if (-not (Test-Path $configPath)) {
  Copy-Item $examplePath $configPath
  Write-Host "Created scripts/google-drive.config.json - edit drivePath values to match your Drive folders." -ForegroundColor Yellow
}

Write-Host "`n=== ONE FM - Google Drive connect ===" -ForegroundColor Cyan
Write-Host "Remote name: $remoteName"
Write-Host ""

$show = Invoke-Rclone config show $remoteName
$showText = $show.Output | Out-String
$alreadyConnected = $show.ExitCode -eq 0 -and $showText -match 'type = drive'
if ($alreadyConnected) {
  Write-Host "Already connected: $remoteName" -ForegroundColor Green
  $show.Output
  Write-Host "`nTo re-auth, run: rclone config delete $remoteName" -ForegroundColor Gray
  Write-Host "Then run this script again.`n"
  exit 0
}

Write-Host "A browser window will open for Google sign-in (read-only access)." -ForegroundColor White
Write-Host "Use the ONE FM / admin Google account that owns the photo folders.`n"

# Authorize read-only Drive scope, then create remote from token
$auth = Invoke-Rclone authorize drive drive.readonly
$token = ($auth.Output | Out-String).Trim()
if ($auth.ExitCode -ne 0 -or -not $token) {
  Write-Host "Authorization failed or was cancelled." -ForegroundColor Red
  exit 1
}

$create = Invoke-Rclone config create $remoteName drive config_token $token scope drive.readonly
if ($create.ExitCode -ne 0) {
  Write-Host "Failed to save rclone remote." -ForegroundColor Red
  exit 1
}

Write-Host "`nConnected successfully." -ForegroundColor Green
Write-Host "List your Drive root folders:"
$ls = Invoke-Rclone lsd "${remoteName}:"
$ls.Output

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Edit scripts/google-drive.config.json - set drivePath to your folder names"
Write-Host "  2. Run: npm run sync:drive"
Write-Host ""
