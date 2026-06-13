# ONE FM 98.5 — One-shot launch script (run in PowerShell)
# Usage:
#   $env:NETLIFY_AUTH_TOKEN = "your-token-here"
#   .\scripts\launch.ps1

$ErrorActionPreference = "Stop"
$AppRoot = Split-Path $PSScriptRoot -Parent
Set-Location $AppRoot

# Node (portable fallback)
$PortableNode = "$env:LOCALAPPDATA\node-portable\node-v24.16.0-win-x64"
if (Test-Path $PortableNode) {
  $env:Path = "$PortableNode;$env:Path"
}

Write-Host "`n=== ONE FM Launch ===" -ForegroundColor Cyan

# 1. Build
Write-Host "`n[1/4] Building..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed" }

# 2. Netlify deploy
Write-Host "`n[2/4] Deploying to Netlify..." -ForegroundColor Yellow
if (-not $env:NETLIFY_AUTH_TOKEN) {
  Write-Host "  SKIP: Set NETLIFY_AUTH_TOKEN first" -ForegroundColor DarkYellow
} else {
  npx netlify deploy --prod --dir=dist --site=8df4de74-d9a8-42ce-9316-61bd06475c94
}

# 3. GitHub push (optional)
Write-Host "`n[3/4] GitHub push..." -ForegroundColor Yellow
$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) {
  Write-Host "  SKIP: Install GitHub CLI (winget install GitHub.cli)" -ForegroundColor DarkYellow
} elseif (-not (gh auth status 2>$null)) {
  Write-Host "  SKIP: Run 'gh auth login' first" -ForegroundColor DarkYellow
} elseif (-not (git remote get-url origin 2>$null)) {
  gh repo create onefm-985-platform --private --source=. --remote=origin --push
} else {
  git push -u origin main
}

# 4. Reminders
Write-Host "`n[4/4] Manual steps remaining:" -ForegroundColor Yellow
Write-Host "  - Supabase: run supabase-schema-all.sql in SQL Editor"
Write-Host "  - Supabase: supabase secrets set RESEND_API_KEY=..."
Write-Host "  - Supabase: supabase functions deploy send-invoice send-enquiry"
Write-Host "  - Netlify: add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY env vars"
Write-Host "  - DNS: CNAME ops -> onefmops.netlify.app"
Write-Host "`nLive: https://onefmops.netlify.app/#/ops`n" -ForegroundColor Green
