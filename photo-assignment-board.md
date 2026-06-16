# ONE FM Photo Assignment Board

Updated: 2026-06-16 23:21:01

## 1) Inventory Summary (current local assets)

- Total web images scanned in `/public`: **53**
- Core station photo library in `/public/assets/images`: **31**
- Brand/logo/boards in `/public/brand`: **9**
- Other root-level assets (`community-event`, `regional-landscape`, hosts, etc.): **13**
- High-res threshold used by plan (`>= 2400px` width): only brand boards currently meet this.
- Best currently available editorial photos are mostly **512px** wide (legacy set), with some **1376×768** root assets and **896×1200** host portraits.

### Quality bands used

- **A (Best available now):** >= 1.0MP
- **B (Usable):** 0.20–0.99MP
- **C (Fallback only):** < 0.20MP

## 2) Scoring Snapshot (relevance × quality)

### Sport / Football candidates

- `assets/images/gvl-night-panorama.jpg` — B/C quality (0.11MP), very high relevance, hero mood image
- `assets/images/gvl-action-sprint.jpg` — C quality (0.18MP), high action relevance
- `assets/images/gvl-player-celebration.jpg` — C quality (0.15MP), high sponsor/sport relevance
- `assets/images/gvl-player-high-five.jpg` — C quality (0.15MP), sponsor/community relevance
- `assets/images/gvl-team-celebration.jpg` — C quality (0.17MP), sport/team relevance

### Studio / broadcast candidates

- `studio-control-room.jpg` — A quality (1.06MP), strong broadcast context
- `assets/images/studio-commentary-selfie.jpg` — B quality (0.20MP), presenter authenticity
- `assets/images/studio-sbs-diversity.jpg` — B quality (0.20MP), multicultural programming relevance
- `assets/images/commentary-box-action.jpg` — B quality (0.21MP), on-air context

### Regional / coverage / sponsorship candidates

- `regional-landscape.jpg` — A quality (1.06MP), broad valley context
- `assets/images/geo-lake-aerial.jpg` — C/B quality (0.17MP), strong coverage theme
- `assets/images/geo-town-aerial.jpg` — C quality (0.15MP), coverage map relevance
- `assets/images/geo-pink-orchard.jpg` — C/B quality (0.17MP), sponsor valley mood

### Community / social candidates

- `community-event.jpg` — A quality (1.06MP), strong community context
- `assets/images/community-outdoor-market.jpg` — B quality (0.21MP), community/programming relevance
- `assets/images/event-food-trucks.jpg` — B quality (0.26MP), event context
- `assets/images/culture-riverboat-murray.jpg` — C quality (0.18MP), regional story relevance

## 3) Section Mapping (primary + backups)

## Home

- **Primary:** `regional-landscape.jpg`
- **Backups:** `assets/images/geo-lake-aerial.jpg`, `assets/images/geo-rolling-green-hills.jpg`
- **Why:** strongest broad regional identity for first impression.
- **Crop note:** hero 16:9 and 21:9 safe; keep horizon in upper third.

## Home Quick Jobs

- **Listen Live:** `assets/images/commentary-box-action.jpg`
  - Backups: `studio-control-room.jpg`, `assets/images/studio-commentary-selfie.jpg`
  - Crop: 4:3 card crop, center subject.
- **Programs:** `assets/images/studio-sbs-diversity.jpg`
  - Backups: `assets/images/community-outdoor-market.jpg`, `community-event.jpg`
  - Crop: 4:3, preserve faces.
- **Broadcast:** `studio-control-room.jpg`
  - Backups: `assets/images/commentary-box-action.jpg`, `assets/images/studio-exterior-rainbow.jpg`
  - Crop: 4:3, keep desk/equipment visible.
- **Coverage:** `assets/images/geo-town-aerial.jpg`
  - Backups: `regional-landscape.jpg`, `assets/images/geo-lake-aerial.jpg`
  - Crop: 4:3, keep town/terrain detail.

## Listen

- **Primary:** `studio-control-room.jpg` (for cards/modules under cinegraph hero)
- **Backups:** `assets/images/commentary-box-action.jpg`, `assets/images/studio-commentary-selfie.jpg`
- **Why:** best available quality + direct “on air” context.
- **Crop note:** 16:9 for panels, 1:1 for social snippets.

## Programs

- **Primary host image set:** mix `assets/images/studio-commentary-selfie.jpg` + `assets/images/studio-sbs-diversity.jpg`
- **Backups:** `assets/images/commentary-box-action.jpg`, `community-event.jpg`
- **Why:** stronger presenter authenticity than generic scenic photos.
- **Crop note:** host cards prefer 1:1 or 4:5 from portrait-safe areas.

## Broadcast Explorer

- **Primary:** `studio-control-room.jpg`
- **Backups:** `assets/images/commentary-box-action.jpg`, `assets/images/studio-exterior-rainbow.jpg`
- **Why:** aligns with schedule, control room, and transmission story.
- **Crop note:** 16:9 hero, 1:1 avatar derivatives if needed.

## Coverage

- **Primary:** `regional-landscape.jpg`
- **Backups:** `assets/images/geo-town-aerial.jpg`, `assets/images/geo-lake-aerial.jpg`
- **Why:** best quality regional visual while map provides precision.
- **Crop note:** panoramic 16:9; avoid aggressive zoom.

## Football (GVL)

- **Primary:** `assets/images/gvl-night-panorama.jpg` (current poster identity)
- **Backups:** `assets/images/gvl-action-sprint.jpg`, `assets/images/gvl-player-celebration.jpg`
- **Why:** best game-day atmosphere despite lower pixel quality.
- **Crop note:** 16:9/21:9 with dark overlay for legible hero type.

## Sponsorship / Media Kit

- **Primary:** `regional-landscape.jpg`
- **Backups:** `assets/images/gvl-player-high-five.jpg`, `assets/images/geo-pink-orchard.jpg`
- **Why:** combines broad reach message + sponsor community connection.
- **Crop note:** 16:9 and 4:5 variants for deck and social placements.

## SocialHub Templates

- **Primary pool:** `community-event.jpg`, `assets/images/studio-commentary-selfie.jpg`, `assets/images/gvl-action-sprint.jpg`, `assets/images/event-food-trucks.jpg`
- **Backups:** existing SocialHub defaults where needed
- **Why:** stronger narrative variety across square/reel/story formats.
- **Crop note:** export derivatives in 1:1, 4:5, 9:16.

## 4) Locked Decisions

1. Use `regional-landscape.jpg` as the default high-quality regional hero fallback.
2. Use `studio-control-room.jpg` as primary broadcast/listen visual anchor.
3. Keep `gvl-night-panorama.jpg` as Football identity until higher-res GVL game shots are synced from Drive.
4. Prioritize replacing low-res 512px images with incoming OB folders in the next pass.

## 5) Next implementation pass (when approved)

- Update aliases in `src/lib/stationPhotos.ts` to point selected primaries.
- Update home job cards in `src/lib/siteNav.ts`.
- Update page-level hardcoded image refs in:
  - `src/pages/Programs.tsx`
  - `src/pages/BroadcastExplorer.tsx`
  - `src/pages/SocialHub.tsx`
- Re-run build and verify visual fit at desktop + mobile breakpoints.
