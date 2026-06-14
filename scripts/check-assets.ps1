# ONE FM asset readiness check — run before deploy
$root = Split-Path -Parent $PSScriptRoot
$brand = Join-Path $root "public\brand"
$photos = Join-Path $root "public\photos"

$requiredBrand = @(
  "one-fm-logo-primary.png",
  "one-fm-logo-white.png"
)

$recommendedPhotos = @(
  "studio-control-room.jpg",
  "hero-station.jpg",
  "regional-landscape.jpg"
)

Write-Host "`n=== ONE FM Asset Check ===" -ForegroundColor Cyan

$missing = 0
foreach ($f in $requiredBrand) {
  $p = Join-Path $brand $f
  if (Test-Path $p) {
    Write-Host "[OK] brand/$f" -ForegroundColor Green
  } else {
    Write-Host "[MISSING] brand/$f  <-- CRITICAL for world-class look" -ForegroundColor Red
    $missing++
  }
}

foreach ($f in $recommendedPhotos) {
  $p = Join-Path $photos $f
  if (Test-Path $p) {
    Write-Host "[OK] photos/$f" -ForegroundColor Green
  } else {
    Write-Host "[MISSING] photos/$f" -ForegroundColor Yellow
  }
}

$photoCount = (Get-ChildItem -Path $photos -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -match '\.(jpg|jpeg|png|webp)$' }).Count
Write-Host "`nPhotos in /public/photos/: $photoCount" -ForegroundColor $(if ($photoCount -ge 5) { 'Green' } else { 'Yellow' })

if ($missing -gt 0) {
  Write-Host "`nExport from Canva or fm985.com.au into:" -ForegroundColor White
  Write-Host "  $brand" -ForegroundColor Gray
  exit 1
}

Write-Host "`nBrand assets ready." -ForegroundColor Green
exit 0
