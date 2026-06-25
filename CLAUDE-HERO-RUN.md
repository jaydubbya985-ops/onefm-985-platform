# CLAUDE CONSOLE RUN — Home Hero · Element 1 · Design 6→8.5

**Repo:** `C:\Users\jaydu\Downloads\Kimi_Agent_ONE FM Project Consolidation\app`  
**Branch:** `main` (do not commit unless Jay asks)  
**Scope:** Home hero ONLY — not Coverage map, not Listen, not site-wide  
**Live:** https://onefmops.netlify.app/#/

---

## ONE SENTENCE IDEA (execute everywhere on Home hero only)

**"The headline arrives on the air — line by line, like sign-on."**

Not decorative motion. Typographic broadcast sign-on: mask reveals, character stagger, gold rule sync, mist breathes underneath. Zero rolling waveform bars. Zero map graphics.

---

## MODEL NOTE FOR JAY

Use **Claude Opus 4.8 (thinking/high)** for this run.  
Fable is better for narrative/copy passes; Opus is better for GSAP orchestration + React integration + taste under constraints.

---

## CURRENT STATE (already done — do not regress)

- `WaveformIdent` rolling canvas bars: **DELETED** — keep deleted
- `HeroSlideshow` 4-photo carousel: **DELETED** — keep single image
- `src/components/home/HeroAtmosphere.tsx` — regional landscape + CSS mist veils
- `src/pages/Home.tsx` — `font-hero` headline "THE VOICE / OF THE / VALLEY."
- Framer Motion used for simple `opacity/y` entrance — **replace hero headline motion with GSAP**

---

## STACK — USE WHAT'S ALREADY INSTALLED (no new deps unless justified)

| Package | Version in package.json | Job |
|---------|-------------------------|-----|
| **gsap** | ^3.15.0 | Headline split, stagger, timeline, `ScrollTrigger` for hero→live-strip handoff |
| **lenis** | ^1.3.23 | Smooth scroll root (wire once in `Layout` or hero scope) |
| **framer-motion** | ^12.38 | Keep for CTAs / cards below hero — NOT for main headline |

**Do NOT add:** Three.js, WebGL shaders, html2canvas, new animation libraries unless GSAP cannot achieve the effect.

**Optional add (only if needed):** `@gsap/react` for `useGSAP` hook — small, clean.

---

## IMPLEMENTATION SPEC

### 1. Create `src/components/home/HeroHeadline.tsx`

Reusable split-headline component:

```
THE VOICE          ← line 1: mask reveal, translateY 110% → 0, duration ~0.9s
OF THE             ← line 2: gold, char stagger OR word stagger, delay +0.12s
VALLEY.            ← line 3: white, char stagger, delay +0.08s after line 2
```

**Techniques (pick minimal combo — max 2 motion types):**
- `overflow-hidden` line masks + `gsap.from()` per line (Rock Hall editorial)
- OR char-level `<span class="char">` wrap + `stagger: 0.02` (premium but still minimal)
- Gold rule: `scaleX: 0 → 1`, `transformOrigin: left`, synced to end of line 2
- Section label `On the air`: fade only, no bounce

**Accessibility:**
```ts
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (reduced) gsap.set(lines, { opacity: 1, y: 0, clearProps: 'all' })
```

### 2. Update `Home.tsx`

- Import `HeroHeadline` — remove framer-motion from h1 block
- Keep `HeroAtmosphere` untouched (mist stays)
- Live strip + floating Now on Air card: light framer OK
- Descriptor + CTAs: stagger after headline timeline `onComplete` or `timeline` position parameter

### 3. Hero → Live strip scroll moment (ONE moment only)

`ScrollTrigger` on live strip section:
- Mist opacity dips 15% as user scrolls first 80px past hero
- OR live strip gold rule draws in on enter viewport
- Do NOT animate entire page on scroll

### 4. Lenis (if not global yet)

- Init in `Layout.tsx` or `App.tsx` once
- `lenis.on('scroll', ScrollTrigger.update)`
- `gsap.ticker.add((time) => lenis.raf(time * 1000))`
- `prefers-reduced-motion`: skip Lenis, native scroll

### 5. Typography tokens — do not change scale

Use existing `.font-hero` in `index.css`:
```css
font-size: clamp(5rem, 13vw, 11rem);
```
Headline must remain readable at 375px — test mobile.

### 6. Brand V3

- Gold `#D4AF37` on "OF THE" only
- Red `#E51636` live dot — keep `animate-pulse` (only pulse on page)
- Fluoro cyan `#00E5FF` — NOT in headline; mist only if already present
- Navy `#071D3A` / `#050D1A` backgrounds

---

## TRUTH RULES

- Copy unchanged: est. 39,375 weekly listeners
- Photo: `HOST_PHOTOS.regionalLandscape` only
- No fake stats, stock URLs, lorem

---

## FILES TO TOUCH

```
src/components/home/HeroHeadline.tsx   (NEW)
src/components/home/HeroAtmosphere.tsx (read only unless mist timing tweak)
src/pages/Home.tsx                     (wire headline, trim framer on h1)
src/components/Layout.tsx            (Lenis init — if not elsewhere)
src/index.css                          (only if .char or .line-mask helpers needed)
```

---

## FILES — DO NOT TOUCH

```
src/pages/CoverageMap.tsx
src/lib/coverageGlowCanvas.ts
src/pages/Listen.tsx
src/components/ops/*
```

---

## QUALITY BAR (self-score before returning)

| Check | Target |
|-------|--------|
| First paint | Headline readable < 100ms (SSR/hydration safe — no FOUC flash of unstyled chars) |
| Motion | Feels like Rock Hall sign-on, not PowerPoint |
| Mobile 375px | No overflow, no clipped descenders |
| `prefers-reduced-motion` | Final state instant |
| `npm run build` | Pass clean |
| Bundle | No Three.js import for this task |

**Target score:** Design 8–8.5/10 for hero element alone.

---

## VERIFY

```powershell
cd "C:\Users\jaydu\Downloads\Kimi_Agent_ONE FM Project Consolidation\app"
npm run build
npm run dev
```

Hard refresh `/#/` — watch headline sign-on 3× at desktop + mobile.

---

## RETURN FORMAT

1. What changed (files + motion decisions)
2. Why GSAP over framer for headline
3. Score self-assessment vs bar above
4. What would need Drive photos to reach 9/10
