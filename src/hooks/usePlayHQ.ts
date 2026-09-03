import { useState, useEffect, useCallback } from 'react'
import type { PlayHQGame, PlayHQGameSummary, GVLLadderTeam } from '@/lib/playhq'
import { GVL_LADDER, formatAFLScore, getGameStatusLabel, getTeamColor } from '@/lib/playhq'
import { PLAYHQ_HOOK_ERROR } from '@/lib/playhqCopy'

export interface UsePlayHQGamesResult {
  games: PlayHQGame[]
  loading: boolean
  error: string | null
  refetch: () => void
}

/** No invented fixtures. Empty until a Netlify PlayHQ proxy exists. */
export function usePlayHQGames(gradeId?: string): UsePlayHQGamesResult {
  const [games, setGames] = useState<PlayHQGame[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(PLAYHQ_HOOK_ERROR)

  const fetchGames = useCallback(async () => {
    setLoading(false)
    setGames([])
    setError(PLAYHQ_HOOK_ERROR)
  }, [gradeId])

  useEffect(() => {
    void fetchGames()
  }, [fetchGames])

  return { games, loading, error, refetch: fetchGames }
}

export function usePlayHQLadder(): {
  ladder: GVLLadderTeam[]
  loading: boolean
  error: string | null
} {
  return { ladder: GVL_LADDER, loading: false, error: PLAYHQ_HOOK_ERROR }
}

export function usePlayHQGameSummary(gameId: string) {
  const [summary, setSummary] = useState<PlayHQGameSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(PLAYHQ_HOOK_ERROR)

  const fetchSummary = useCallback(async () => {
    setLoading(false)
    setSummary(null)
    setError(PLAYHQ_HOOK_ERROR)
  }, [gameId])

  useEffect(() => {
    void fetchSummary()
  }, [fetchSummary])

  return { summary, loading, error, refetch: fetchSummary }
}

export function useLiveGamePolling(games: PlayHQGame[], intervalMs = 60000) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const hasLiveGame = games.some((g) => g.status === 'LIVE')
    if (!hasLiveGame) return

    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, intervalMs)

    return () => clearInterval(interval)
  }, [games, intervalMs])

  return lastUpdated
}

export { formatAFLScore, getGameStatusLabel, getTeamColor }
