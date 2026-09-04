import { isSupabaseConfigured } from '@/lib/supabase'

/**
 * DEMO and LIVE must not share a localStorage key.
 * Bare keys (onefm_payments, onefm_sponsors, …) are leftover from before
 * the suffix — do not read them. DEMO seed stays in `__demo`. LIVE stays empty
 * in `__live` so #/ops is not a fake ledger.
 */
export function opsStorageKey(base: string, live = isSupabaseConfigured()): string {
  return live ? `${base}__live` : `${base}__demo`
}

/**
 * DEMO seeds stay in DEMO mode. LIVE starts empty.
 * Clone the seed so a DEMO desk cannot mutate the module export.
 */
export function opsInitial<T>(demoSeed: T, liveEmpty: T, live = isSupabaseConfigured()): T {
  if (live) return liveEmpty
  return structuredClone(demoSeed)
}
