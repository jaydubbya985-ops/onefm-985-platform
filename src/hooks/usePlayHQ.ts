import { useState, useEffect, useCallback } from 'react';
import type { PlayHQGame, PlayHQGameSummary, GVLLadderTeam } from '@/lib/playhq';
import {
  GVL_LADDER,
  MOCK_GVL_GAMES,
  formatAFLScore,
  getGameStatusLabel,
  getTeamColor,
} from '@/lib/playhq';

export interface UsePlayHQGamesResult {
  games: PlayHQGame[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Hook for GVL games
export function usePlayHQGames(gradeId?: string): UsePlayHQGamesResult {
  const [games, setGames] = useState<PlayHQGame[]>(MOCK_GVL_GAMES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    // PlayHQ keys must stay server-side. Use static data until a Netlify proxy exists.
    setError(null);
    setLoading(false);
    setGames(MOCK_GVL_GAMES);
  }, [gradeId]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, loading, error, refetch: fetchGames };
}

// Hook for GVL ladder
export function usePlayHQLadder(): {
  ladder: GVLLadderTeam[];
  loading: boolean;
} {
  // Ladder is static data for now - could be fetched from PlayHQ if available
  return { ladder: GVL_LADDER, loading: false };
}

// Hook for game summary with player stats
export function usePlayHQGameSummary(gameId: string) {
  const [summary, setSummary] = useState<PlayHQGameSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    // PlayHQ live summary requires a server-side proxy to keep API keys private.
    setError(null);
    setLoading(false);
    setSummary(null);
  }, [gameId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
}

// Hook for live game polling (auto-refresh during games)
export function useLiveGamePolling(games: PlayHQGame[], intervalMs = 60000) {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const hasLiveGame = games.some(g => g.status === 'LIVE');
    if (!hasLiveGame) return;

    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, intervalMs);

    return () => clearInterval(interval);
  }, [games, intervalMs]);

  return lastUpdated;
}

// Re-export helpers for components
export { formatAFLScore, getGameStatusLabel, getTeamColor };
