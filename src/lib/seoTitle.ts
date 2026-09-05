/** Browser tab / OG title. Brand once — never "ONE FM 98.5 | ONE FM 98.5". */

export const SITE_BRAND = 'ONE FM 98.5'

export function formatPageTitle(title: string): string {
  const t = title.trim()
  if (!t) return SITE_BRAND
  if (t === SITE_BRAND) return t
  if (t.endsWith(` | ${SITE_BRAND}`) || t.endsWith(` — ${SITE_BRAND}`) || t.endsWith(` - ${SITE_BRAND}`)) {
    return t
  }
  if (t.includes(SITE_BRAND)) return t
  return `${t} | ${SITE_BRAND}`
}
