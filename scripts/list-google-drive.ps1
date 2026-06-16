# List folders/files on Google Drive (after connect).
# Run: npm run list:drive
# Optional: npm run list:drive -- "Rumbalara v Nathalia A Grade"

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

$configPath = Join-Path $root "scripts\google-drive.config.json"
$config = Get-Content $configPath -Raw | ConvertFrom-Json
$remote = if ($config.remoteName) { $config.remoteName } else { "onefm-drive" }

$show = Invoke-Rclone config show $remote
$showText = $show.Output | Out-String
if ($show.ExitCode -ne 0 -or $showText -notmatch 'type = drive') {
  Write-Host "Not connected yet. Run: npm run connect:drive" -ForegroundColor Red
  exit 1
}

$subPath = $args -join '/'
$target = if ($subPath) { "${remote}:${subPath}" } else { "${remote}:" }

Write-Host "`n=== Google Drive: $target ===" -ForegroundColor Cyan
$ls = Invoke-Rclone lsd $target
if ($ls.ExitCode -ne 0) {
  Write-Host "Path not found. Copy the exact folder name from Drive and try:" -ForegroundColor Yellow
  Write-Host '  npm run list:drive -- "Your Folder Name"' -ForegroundColor Gray
  $ls.Output
  exit 1
}
$ls.Output

Write-Host "`nTip: paste the exact folder name into scripts/google-drive.config.json drivePath" -ForegroundColor Gray
Write-Host ""
