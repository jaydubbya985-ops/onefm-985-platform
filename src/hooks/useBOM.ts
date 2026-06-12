import { useState, useEffect, useCallback } from 'react';
import type { BOMObservation, BOMForecast, BOMWarning } from '@/lib/bom';
import { BOMClient } from '@/lib/bom';

const client = new BOMClient();

export interface UseBOMWeatherResult {
  current: BOMObservation | null;
  forecast: BOMForecast[];
  warnings: BOMWarning[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => void;
}

// Hook for current weather + forecast + warnings
export function useBOMWeather(): UseBOMWeatherResult {
  const [current, setCurrent] = useState<BOMObservation | null>(null);
  const [forecast, setForecast] = useState<BOMForecast[]>([]);
  const [warnings, setWarnings] = useState<BOMWarning[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [obs, fc, warn] = await Promise.all([
        client.getSheppartonObservation(),
        client.getSheppartonForecast(),
        client.getVictoriaWarnings(),
      ]);
      setCurrent(obs);
      setForecast(fc);
      setWarnings(warn);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    // Auto-refresh every 10 minutes (BOM updates roughly every 10 mins)
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { current, forecast, warnings, loading, error, lastUpdated, refetch: fetchWeather };
}

// Hook for just current conditions (lighter weight)
export function useBOMCurrent(): {
  current: BOMObservation | null;
  loading: boolean;
} {
  const [current, setCurrent] = useState<BOMObservation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const obs = await client.getSheppartonObservation();
      setCurrent(obs);
      setLoading(false);
    };
    fetch();
    const interval = setInterval(fetch, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { current, loading };
}
