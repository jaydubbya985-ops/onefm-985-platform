import { useBOMWeather } from '@/hooks/useBOM';
import { formatTemp, formatWind, getWeatherIcon, getFireDangerColor } from '@/lib/bom';
import { Sun, Cloud, CloudRain, CloudLightning, Wind, Thermometer, AlertTriangle, RefreshCw, CloudSun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap: Record<string, React.ReactNode> = {
  'sun': <Sun className="h-5 w-5 text-one-gold" />,
  'cloud-sun': <CloudSun className="h-5 w-5 text-one-gold" />,
  'cloud': <Cloud className="h-5 w-5 text-one-muted" />,
  'cloud-rain': <CloudRain className="h-5 w-5 text-one-electric" />,
  'cloud-lightning': <CloudLightning className="h-5 w-5 text-one-red" />,
  'wind': <Wind className="h-5 w-5 text-one-muted" />,
};

export function WeatherWidget() {
  const { current, forecast, warnings, loading, refetch } = useBOMWeather();

  if (loading && !current) {
    return (
      <div className="flex items-center gap-2 text-one-muted text-xs">
        <RefreshCw className="h-3 w-3 animate-spin" />
        Loading weather...
      </div>
    );
  }

  if (!current) return null;

  const today = forecast[0];
  const fireDanger = today?.fire_danger ?? null;
  const hasWarnings = warnings.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3"
    >
      {/* Current temp */}
      <div className="flex items-center gap-1.5">
        {iconMap[getWeatherIcon(today?.icon_descriptor ?? 'partly-cloudy')] ?? <CloudSun className="h-5 w-5 text-one-gold" />}
        <span className="text-one-white font-h4 text-sm">
          {formatTemp(current.air_temp)}
        </span>
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-one-border" />

      {/* High/Low */}
      <div className="hidden sm:flex items-center gap-1 text-xs text-one-muted">
        <Thermometer className="h-3 w-3" />
        <span>H:{formatTemp(today?.temp_max ?? null)}</span>
        <span>L:{formatTemp(today?.temp_min ?? null)}</span>
      </div>

      {/* Wind */}
      <div className="hidden md:flex items-center gap-1 text-xs text-one-muted">
        <Wind className="h-3 w-3" />
        <span>{formatWind(current.wind_dir, current.wind_spd_kmh)}</span>
      </div>

      {/* Fire danger (if high) */}
      {fireDanger && (fireDanger.includes('High') || fireDanger.includes('Severe') || fireDanger.includes('Extreme')) && (
        <div className={`hidden lg:flex items-center gap-1 text-xs ${getFireDangerColor(fireDanger)}`}>
          <AlertTriangle className="h-3 w-3" />
          <span>Fire: {fireDanger}</span>
        </div>
      )}

      {/* Warnings badge */}
      <AnimatePresence>
        {hasWarnings && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-one-red/20 border border-one-red/40 text-one-red text-xs font-medium"
          >
            <AlertTriangle className="h-3 w-3" />
            {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refresh */}
      <button
        onClick={refetch}
        className="text-one-muted hover:text-one-gold transition-colors"
        title="Refresh weather"
      >
        <RefreshCw className="h-3 w-3" />
      </button>
    </motion.div>
  );
}

// Compact version for live player bar
export function WeatherMini() {
  const { current, loading } = useBOMWeather();

  if (loading || !current) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-one-muted">
      <CloudSun className="h-3.5 w-3.5 text-one-gold" />
      <span className="text-one-white font-medium">{Math.round(current.air_temp)}°</span>
      <span className="hidden sm:inline">{current.weather}</span>
    </div>
  );
}
