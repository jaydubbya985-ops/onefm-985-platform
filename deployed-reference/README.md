# Deployed Site Reference

Source recovered from the live ONE FM deployment:

**URL:** https://vuvsbxc5bsqi2.kimi.page/

## Assets

| File | Purpose |
|------|---------|
| `assets/index-B_LB8Wq9.js` | Main app bundle (routes, Navbar, Home, etc.) |
| `assets/OpsPortal-dIeH6Okr.js` | Operations Portal modules (~788KB) |
| `assets/EnquiryDashboard-C3KbjDYm.js` | Enquiry Management dashboard |
| `assets/index-Dh6bHaQi.css` | Production styles |

## Recovery method

The production build embeds `"code-path":"src/..."` attributes (from `plugin-inspect-react-code`).
These were used to identify missing source files and reconstruct TypeScript in `src/`.

See `scripts/paths-output.txt` for the full list of source paths found in bundles.

## Ops portal access (local)

- Route: `#/ops`
- Password: `onefm2026` (stored in `sessionStorage` as `ops_unlocked`)
