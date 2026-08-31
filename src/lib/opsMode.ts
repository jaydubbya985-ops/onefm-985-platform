import { isSupabaseConfigured } from '@/lib/supabase'

/** DEMO localStorage keys stay on the demo namespace. LIVE uses a separate key. */
export function opsStorageKey(base: string): string {
  return isSupabaseConfigured() ? `${base}__live` : base
}

/** DEMO seeds stay in DEMO mode. LIVE starts empty so #/ops is not a fake ledger. */
export function opsInitial<T>(demoSeed: T, liveEmpty: T): T {
  return isSupabaseConfigured() ? liveEmpty : demoSeed
}
