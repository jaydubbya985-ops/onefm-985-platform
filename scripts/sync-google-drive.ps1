# Pull assets from Google Drive into public/ folders (images, hosts, cinegraphs).
# Requires: scripts/connect-google-drive.ps1 completed once.
# Run: npm run sync:drive

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
  Write-Host "rclone not found. Run: winget install Rclone.Rclone" -ForegroundColor Red
  exit 1
}

$configPath = Join-Path $root "scripts\google-drive.config.json"
if (-not (Test-Path $configPath)) {
  Write-Host "Missing scripts/google-drive.config.json - run connect-google-drive.ps1 first." -ForegroundColor Red
  exit 1
}

$config = Get-Content $configPath -Raw | ConvertFrom-Json
$remote = $config.remoteName
if (-not $remote) { $remote = "onefm-drive" }

$check = Invoke-Rclone config show $remote
$checkText = $check.Output | Out-String
if ($check.ExitCode -ne 0 -or $checkText -notmatch 'type = drive') {
  Write-Host "Google Drive not connected. Run: npm run connect:drive" -ForegroundColor Red
  exit 1
}

Write-Host "`n=== ONE FM - Google Drive sync ===" -ForegroundColor Cyan
Write-Host "Remote: $remote`n"

$synced = 0
foreach ($folder in $config.folders) {
  $drivePath = $folder.drivePath -replace '\\', '/'
  $localRel = $folder.localPath -replace '/', '\'
  $localAbs = Join-Path $root $localRel
  $remoteSpec = "${remote}:${drivePath}"

  if (-not (Test-Path $localAbs)) {
    New-Item -ItemType Directory -Force -Path $localAbs | Out-Null
  }

  $include = @()
  foreach ($ext in $folder.extensions) {
    $include += "--include", "*$ext"
  }

  Write-Host "[$($folder.label)]" -ForegroundColor Yellow
  Write-Host "  Drive: $drivePath"
  Write-Host "  Local: $localRel"

  $copy = Invoke-Rclone copy $remoteSpec $localAbs --progress --update @include
  if ($copy.ExitCode -ne 0) {
    Write-Host "  Warning: sync issue for $drivePath (folder may not exist on Drive)" -ForegroundColor Red
    continue
  }

  $count = (Get-ChildItem -Path $localAbs -File -ErrorAction SilentlyContinue).Count
  Write-Host "  Files in destination: $count" -ForegroundColor Green
  $synced++
}

Write-Host "`nSynced $synced folder(s)." -ForegroundColor $(if ($synced -gt 0) { 'Green' } else { 'Yellow' })
Write-Host "Review filenames against src/lib/stationPhotos.ts and src/lib/cinegraphAssets.ts"
Write-Host ""
