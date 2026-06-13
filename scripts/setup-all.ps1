# ONE FM 98.5 — Wire Supabase + Resend + GitHub secrets
# Run from app folder after creating Supabase project + Resend account.
#
# Usage:
#   .\scripts\setup-all.ps1 `
#     -SupabaseUrl "https://xxxx.supabase.co" `
#     -SupabaseAnonKey "eyJ..." `
#     -ResendApiKey "re_..." `
#     -NetlifyToken "nfp_..." `
#     -GitHubToken "ghp_..."

param(
  [Parameter(Mandatory=$true)][string]$SupabaseUrl,
  [Parameter(Mandatory=$true)][string]$SupabaseAnonKey,
  [string]$ResendApiKey = "",
  [string]$NetlifyToken = $env:NETLIFY_AUTH_TOKEN,
  [string]$GitHubToken = "",
  [string]$SiteId = "8df4de74-d9a8-42ce-9316-61bd06475c94",
  [string]$StaffEmail = "jason@onefm.com.au"
)

$ErrorActionPreference = "Stop"
$AppRoot = Split-Path $PSScriptRoot -Parent
Set-Location $AppRoot

$PortableNode = "$env:LOCALAPPDATA\node-portable\node-v24.16.0-win-x64"
if (Test-Path $PortableNode) { $env:Path = "$PortableNode;$env:Path" }

Write-Host "`n=== ONE FM — Full Backend Setup ===" -ForegroundColor Cyan

# ── 1. Local .env (never commit) ─────────────────────────────
@"
VITE_SUPABASE_URL=$SupabaseUrl
VITE_SUPABASE_ANON_KEY=$SupabaseAnonKey
VITE_STATION_EMAIL=admin@fm985.com.au
VITE_STATION_NAME=ONE FM 98.5
"@ | Set-Content -Path ".env" -Encoding UTF8
Write-Host "[1/6] .env written (local only)" -ForegroundColor Green

# ── 2. Netlify env vars + redeploy ───────────────────────────
if ($NetlifyToken) {
  $env:NETLIFY_AUTH_TOKEN = $NetlifyToken
  npx netlify env:set VITE_SUPABASE_URL $SupabaseUrl --site=$SiteId --force
  npx netlify env:set VITE_SUPABASE_ANON_KEY $SupabaseAnonKey --site=$SiteId --force
  npx netlify env:set VITE_STATION_EMAIL "admin@fm985.com.au" --site=$SiteId --force
  Write-Host "[2/6] Netlify env vars set" -ForegroundColor Green
  npm run build
  npx netlify deploy --prod --dir=dist --site=$SiteId
  Write-Host "      Deployed to https://onefmops.netlify.app" -ForegroundColor Green
} else {
  Write-Host "[2/6] SKIP Netlify (no NETLIFY_AUTH_TOKEN)" -ForegroundColor Yellow
}

# ── 3. Supabase Edge Functions (Resend) ──────────────────────
$supabase = Get-Command supabase -ErrorAction SilentlyContinue
if ($supabase -and $ResendApiKey) {
  supabase secrets set RESEND_API_KEY=$ResendApiKey --project-ref ($SupabaseUrl -replace 'https://','' -replace '.supabase.co','')
  supabase secrets set RESEND_FROM="ONE FM 98.5 <accounts@fm985.com.au>"
  supabase secrets set STATION_EMAIL="admin@fm985.com.au"
  supabase functions deploy send-invoice --project-ref ($SupabaseUrl -replace 'https://','' -replace '.supabase.co','')
  supabase functions deploy send-enquiry --project-ref ($SupabaseUrl -replace 'https://','' -replace '.supabase.co','')
  Write-Host "[3/6] Edge functions deployed" -ForegroundColor Green
} else {
  Write-Host "[3/6] SKIP Edge functions (install Supabase CLI + Resend key)" -ForegroundColor Yellow
  Write-Host "      Manual: supabase link && supabase secrets set RESEND_API_KEY=..."
  Write-Host "              supabase functions deploy send-invoice send-enquiry"
}

# ── 4. GitHub repo + secrets ─────────────────────────────────
if ($GitHubToken) {
  $env:GH_TOKEN = $GitHubToken
  $remote = git remote get-url origin 2>$null
  if (-not $remote) {
    gh repo create onefm-985-platform --private --source=. --remote=origin
  }
  git push -u origin main 2>$null
  gh secret set NETLIFY_AUTH_TOKEN --body $NetlifyToken
  gh secret set NETLIFY_SITE_ID --body $SiteId
  gh secret set VITE_SUPABASE_URL --body $SupabaseUrl
  gh secret set VITE_SUPABASE_ANON_KEY --body $SupabaseAnonKey
  Write-Host "[4/6] GitHub secrets set + pushed" -ForegroundColor Green
} else {
  Write-Host "[4/6] SKIP GitHub (run: gh auth login, then git push)" -ForegroundColor Yellow
}

Write-Host "`n[5/6] Supabase SQL — run ONCE in dashboard if not done:" -ForegroundColor Yellow
Write-Host "      https://supabase.com/dashboard → SQL Editor → paste supabase-schema-all.sql"

Write-Host "`n[6/6] Resend domain — verify fm985.com.au at resend.com/domains" -ForegroundColor Yellow
Write-Host "      Add staff user in Supabase Auth: $StaffEmail"
Write-Host "`nLive: https://onefmops.netlify.app/#/ops`n" -ForegroundColor Green
