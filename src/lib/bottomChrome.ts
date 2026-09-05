/** Routes where the floating mini player is hidden (full Listen desk or ops). */
export const MINI_PLAYER_HIDDEN_PATHS = ['/listen', '/ops'] as const

export function isMiniPlayerHidden(pathname: string): boolean {
  return MINI_PLAYER_HIDDEN_PATHS.some((path) => pathname === path)
}

/** Clearance so the consent bar sits above the mini player, not through it. */
export const MINI_PLAYER_CLEARANCE_CLASS = 'bottom-20'
