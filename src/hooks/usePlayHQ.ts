import { useState, useEffect, useCallback } from 'react';
import type { PlayHQGame, PlayHQGameSummary, GVLLadderTeam } from '@/lib/playhq';
import {
  PlayHQClient,
  GVL_LADDER,
  MOCK_GVL_GAMES,
  formatAFLScore,
  getGameStatusLabel,
  getTeamColor,
} from '@/lib/playhq';

// Configuration from environment
const config = {
  apiKey: import.meta.env.VITE_PLAYHQ_API_KEY || '',
  tenant: import.meta.env.VITE_PLAYHQ_TENANT || 'gvl',
};

const client = new PlayHQClient(config);

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
    // If no API key, use mock data (demo mode)
    if (!config.apiKey) {
      setGames(MOCK_GVL_GAMES);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const grade = gradeId || 'gvl-senior';
      const response = await client.getGamesForGrade(grade);
      setGames(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games');
      // Fallback to mock data on error
      setGames(MOCK_GVL_GAMES);
    } finally {
      setLoading(false);
    }
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
    if (!config.apiKey) {
      // Demo mode - generate mock summary from game
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await client.getGameSummary(gameId);
      setSummary(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch summary');
    } finally {
      setLoading(false);
    }
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
