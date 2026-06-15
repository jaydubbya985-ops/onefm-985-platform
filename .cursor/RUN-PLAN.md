# ONE FM RUN PLAN — Non-stop to launch

**Current score: 2/10** | **Target: 8/10 minimum for gov contract**

## Live verification (2026-06-15)

| Check | Status |
|-------|--------|
| Deploy pipeline (push → Netlify) | ✅ Working |
| Plemo removed | ✅ Live shows Tim Ahemt / ONE FM Breakfast |
| Real listener stats (39,375) | ✅ On homepage |
| Program guide from fm985 | ✅ Mostly correct |
| Latest Interviews widget | ❌ Was broken → fixing with proxy + fallback |
| Broken images (/community-event.jpg) | ❌ Fixing |
| Ops portal live (invoices, Stripe) | ❌ Needs env vars |
| Supabase auth | ❌ NEED JAY: VITE_SUPABASE_* on Netlify |
| Stripe payments | ❌ NEED JAY: VITE_STRIPE_PUBLISHABLE_KEY |
| Coverage map (Google Maps) | ❌ NEED JAY: VITE_GOOGLE_MAPS_API_KEY |
| World-class visual polish | ❌ Partial V3 brand only |

---

## Phase 1 — FIX WHAT'S BROKEN (now)
- [x] Auto-deploy on push to main
- [x] Remove Plemo, restore full homepage
- [ ] fm985 interview proxy + scraped fallback
- [ ] Fix all broken image paths
- [ ] Remove `[DATA_MISSING_FROM_SOURCE]` from public pages
- [ ] Fix UTF-8 encoding glitches on homepage

## Phase 2 — TRUTH & DATA (2–4 hrs)
- [ ] Single source of truth: `programGuide.ts` drives Home, Programs, BroadcastExplorer
- [ ] Reconcile Regional Voice vs afternoon hosts (guide vs marketing)
- [ ] AudienceAnalytics: label all non-live data clearly
- [ ] Ops demo data: banner "DEMO MODE" when Supabase not configured
- [ ] Grep purge: unsplash, fake millions, AI-Enhanced, placeholder stats

## Phase 3 — OPS PORTAL LIVE (4–6 hrs) — NEED JAY SECRETS
Jay must add to **Netlify → Site settings → Environment variables**:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STATION_EMAIL=admin@fm985.com.au
```
Then agent:
- [ ] Wire Supabase auth (exit demo password gate)
- [ ] Invoice PDF generate + download verified
- [ ] Invoice email via Resend (Supabase edge function secrets)
- [ ] Stripe test payment end-to-end on live URL
- [ ] Bank details BSB 083-894 on all invoices

## Phase 4 — PUBLIC SITE POLISH (6–10 hrs)
- [ ] Homepage: hero, player, interviews, stats — world-class pass
- [ ] Programs page: presenter photos, full weekly grid
- [ ] Heritage + Story: real timeline, no gaps
- [ ] Coverage map: 25 towns interactive (needs Maps API key)
- [ ] MediaKit: sourced demographics only
- [ ] SocialHub: 2026 template variations with real assets
- [ ] GVL / Football sponsorship pages
- [ ] Mobile responsive QA all pages

## Phase 5 — LAUNCH (2 hrs)
- [ ] Custom domain ops.fm985.com.au
- [ ] SSL verify
- [ ] Final truth audit
- [ ] Jay sign-off checklist

---

## Cloud agent prompt (copy to phone)

```
RUN PLAN Phase 1–2. Pull main. Build must pass. Push triggers auto-deploy.

Fix broken interviews feed, broken images, DATA_MISSING placeholders.
Unify all program data from programGuide.ts.
Truth grep entire src/ — zero fake stats on public pages.
When env vars missing, post NEED JAY: with exact key name only.
Do not stop until Phase 2 complete. Commit after each logical chunk.
```

## NEED JAY checklist (blocking Phase 3+)
1. Supabase URL + anon key → Netlify env vars
2. Stripe pk_test or pk_live → Netlify env vars  
3. Google Maps API key → Netlify env vars (coverage map)
4. Resend API key → Supabase secrets (invoice email)
