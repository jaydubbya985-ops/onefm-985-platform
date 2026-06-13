# ONE FM 98.5 — Interactive wiring: Supabase + Resend + GitHub CI
# Run:  cd app  &&  .\scripts\wire-all.ps1

$ErrorActionPreference = "Stop"
$AppRoot = Split-Path $PSScriptRoot -Parent
Set-Location $AppRoot

$PortableNode = "$env:LOCALAPPDATA\node-portable\node-v24.16.0-win-x64"
if (Test-Path $PortableNode) { $env:Path = "$PortableNode;$env:Path" }

$SiteId = "8df4de74-d9a8-42ce-9316-61bd06475c94"

Write-Host "`n=== ONE FM — Wire Supabase + Resend + GitHub ===" -ForegroundColor Cyan
Write-Host "Paste values when prompted. Keys are saved locally only (.env) and to Netlify/GitHub.`n"

# ── Collect credentials ──────────────────────────────────────
$SupabaseUrl = Read-Host "Supabase Project URL (https://xxxx.supabase.co)"
$SupabaseAnonKey = Read-Host "Supabase anon public key (eyJ...)"
$ResendApiKey = Read-Host "Resend API key (re_...) — Enter to skip for now"
$NetlifyToken = Read-Host "Netlify personal access token (nfp_...) — Enter if CLI not logged in"
$GitHubToken = Read-Host "GitHub PAT with repo scope (ghp_...) — Enter to skip GitHub"

if (-not $SupabaseUrl -or -not $SupabaseAnonKey) {
  Write-Host "Supabase URL and anon key are required." -ForegroundColor Red
  exit 1
}

# ── 1. Local .env ──────────────────────────────────────────────
@"
VITE_SUPABASE_URL=$SupabaseUrl
VITE_SUPABASE_ANON_KEY=$SupabaseAnonKey
VITE_STATION_EMAIL=admin@fm985.com.au
VITE_STATION_NAME=ONE FM 98.5
"@ | Set-Content -Path ".env" -Encoding UTF8
Write-Host "[1/7] .env written" -ForegroundColor Green

# ── 2. Netlify env + redeploy ────────────────────────────────
if ($NetlifyToken) { $env:NETLIFY_AUTH_TOKEN = $NetlifyToken }
npx netlify env:set VITE_SUPABASE_URL $SupabaseUrl --site=$SiteId --force
npx netlify env:set VITE_SUPABASE_ANON_KEY $SupabaseAnonKey --site=$SiteId --force
npx netlify env:set VITE_STATION_EMAIL "admin@fm985.com.au" --site=$SiteId --force
Write-Host "[2/7] Netlify env vars set" -ForegroundColor Green

npm run build
npx netlify deploy --prod --dir=dist --site=$SiteId
Write-Host "[3/7] Deployed → https://onefmops.netlify.app" -ForegroundColor Green

# ── 3. Supabase Edge Functions ───────────────────────────────
$ProjectRef = ($SupabaseUrl -replace '^https://', '' -replace '\.supabase\.co/?$', '')
if ($ResendApiKey) {
  $supabase = Get-Command supabase -ErrorAction SilentlyContinue
  if (-not $supabase) {
    Write-Host "[4/7] Installing Supabase CLI..." -ForegroundColor Yellow
    npm install -g supabase 2>$null
  }
  supabase secrets set "RESEND_API_KEY=$ResendApiKey" --project-ref $ProjectRef
  supabase secrets set 'RESEND_FROM=ONE FM 98.5 <accounts@fm985.com.au>' --project-ref $ProjectRef
  supabase secrets set 'STATION_EMAIL=admin@fm985.com.au' --project-ref $ProjectRef
  supabase functions deploy send-invoice --project-ref $ProjectRef
  supabase functions deploy send-enquiry --project-ref $ProjectRef
  Write-Host "[4/7] Edge functions deployed" -ForegroundColor Green
} else {
  Write-Host "[4/7] Skipped Resend edge functions (no API key)" -ForegroundColor Yellow
}

# ── 4. GitHub repo + secrets ─────────────────────────────────
if ($GitHubToken) {
  $env:GH_TOKEN = $GitHubToken
  $remote = git remote get-url origin 2>$null
  if (-not $remote) {
    gh repo create onefm-985-platform --private --source=. --remote=origin --push
  } else {
    git push -u origin main
  }
  if ($NetlifyToken) { gh secret set NETLIFY_AUTH_TOKEN --body $NetlifyToken }
  gh secret set NETLIFY_SITE_ID --body $SiteId
  gh secret set VITE_SUPABASE_URL --body $SupabaseUrl
  gh secret set VITE_SUPABASE_ANON_KEY --body $SupabaseAnonKey
  Write-Host "[5/7] GitHub repo + CI secrets configured" -ForegroundColor Green
} else {
  Write-Host "[5/7] Skipped GitHub — run: gh auth login, then git push" -ForegroundColor Yellow
}

Write-Host "`n[6/7] Supabase dashboard checklist:" -ForegroundColor Yellow
Write-Host "  • SQL Editor → paste supabase-schema-all.sql → Run (if not done)"
Write-Host "  • Authentication → Users → Add user: jason@onefm.com.au"
Write-Host "  • Project ref: $ProjectRef"

Write-Host "`n[7/7] Resend checklist:" -ForegroundColor Yellow
Write-Host "  • resend.com → Domains → verify fm985.com.au DNS records"

Write-Host "`nDone. Test: https://onefmops.netlify.app/#/ops`n" -ForegroundColor Green
