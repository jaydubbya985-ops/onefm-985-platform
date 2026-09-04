#!/usr/bin/env node
/**
 * Leftover Cloud-shaped Supabase secrets must not become VITE_* during
 * `npm run build`. Vite inlines every VITE_* value into the public SPA.
 *
 * Writes GitHub Actions GITHUB_ENV lines to stdout. Never prints credential values.
 * Shape rules match scripts/verify-ops-config.ts (full https URL + eyJ / sb_publishable_).
 */

const url = (process.env.CANDIDATE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim()
const key = (process.env.CANDIDATE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim()

function looksLikeProjectUrl(value) {
  return (
    /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(value) &&
    !value.includes('your-project-id') &&
    !value.includes('placeholder.supabase.co')
  )
}

function looksLikeBrowserAnon(value) {
  if (!value) return false
  if (value === 'your-anon-key-here' || value === 'your-publishable-key-here') return false
  if (value.endsWith('.placeholder')) return false
  if (value.startsWith('sb_secret_') || value.startsWith('sb_service')) return false
  return value.startsWith('eyJ') || value.startsWith('sb_publishable_')
}

const pass = looksLikeProjectUrl(url) && looksLikeBrowserAnon(key)

if (pass) {
  console.log(`VITE_SUPABASE_URL=${url}`)
  console.log(`VITE_SUPABASE_ANON_KEY=${key}`)
  console.error('Supabase env: LIVE shape — full Project URL + browser anon/publishable key.')
} else {
  console.log('VITE_SUPABASE_URL=')
  console.log('VITE_SUPABASE_ANON_KEY=')
  console.error(
    'Supabase env: leftover or empty shape unset — public bundle stays DEMO. Need https://<ref>.supabase.co + eyJ / sb_publishable_ (never a project-ref-only URL or sb_secret_).',
  )
}
