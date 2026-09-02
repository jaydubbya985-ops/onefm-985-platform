import { Sun, Cloud, CloudRain, CloudLightning, CloudFog, Snowflake, Wind, Thermometer, RefreshCw, CloudSun, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWeatherCycle } from '@/hooks/useWeatherCycle'
import { gvWeatherTowns } from '@/data/weatherLocations'
import { formatCoverageShort } from '@/lib/coverageCopy'
import {
  WEATHER_SOURCE_LABEL,
  getWeatherDescription,
  getWeatherIconKey,
  formatTempC,
  type WeatherIconKey,
} from '@/lib/weather'

const iconMap: Record<WeatherIconKey, React.ReactNode> = {
  sun: <Sun className="h-5 w-5 text-one-gold" />,
  'cloud-sun': <CloudSun className="h-5 w-5 text-one-gold" />,
  cloud: <Cloud className="h-5 w-5 text-one-muted" />,
  'cloud-rain': <CloudRain className="h-5 w-5 text-one-electric" />,
  'cloud-lightning': <CloudLightning className="h-5 w-5 text-one-red" />,
  'cloud-fog': <CloudFog className="h-5 w-5 text-one-muted" />,
  snowflake: <Snowflake className="h-5 w-5 text-one-electric" />,
}

const iconMapSmall: Record<WeatherIconKey, React.ReactNode> = {
  sun: <Sun className="h-3.5 w-3.5 text-one-gold" />,
  'cloud-sun': <CloudSun className="h-3.5 w-3.5 text-one-gold" />,
  cloud: <Cloud className="h-3.5 w-3.5 text-one-muted" />,
  'cloud-rain': <CloudRain className="h-3.5 w-3.5 text-one-electric" />,
  'cloud-lightning': <CloudLightning className="h-3.5 w-3.5 text-one-red" />,
  'cloud-fog': <CloudFog className="h-3.5 w-3.5 text-one-muted" />,
  snowflake: <Snowflake className="h-3.5 w-3.5 text-one-electric" />,
}

const coverageCaption = `${WEATHER_SOURCE_LABEL} · hub & major towns · ${formatCoverageShort()}`

/** Compact player-bar stamp — licensed coverage even before Open-Meteo resolves. */
function WeatherMiniCoverage({ announce = true }: { announce?: boolean }) {
  return (
    <span
      className="font-label text-[9px] tracking-[0.12em] uppercase text-one-muted/75"
      title={announce ? coverageCaption : undefined}
      aria-label={announce ? coverageCaption : undefined}
      aria-hidden={announce ? undefined : true}
    >
      {formatCoverageShort()}
    </span>
  )
}

// Full version — cycles hub/major towns from townData (Open-Meteo, Melbourne TZ)
export function WeatherWidget() {
  const { location, weather, loading } = useWeatherCycle(gvWeatherTowns)

  if (loading && !weather) {
    return (
      <div className="flex items-center gap-2 text-one-muted text-xs">
        <RefreshCw className="h-3 w-3 animate-spin" />
        Loading weather...
      </div>
    )
  }

  if (!weather) return null

  const iconKey = getWeatherIconKey(weather.weatherCode)
  const label = `${location.name} ${formatTempC(weather.tempC)} · ${coverageCaption}`

  return (
    <div className="flex flex-col gap-1 min-w-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.name}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3"
          aria-label={label}
        >
          {/* Always name the town — parent strips may still say Shepparton */}
          <div className="flex items-center gap-1 text-xs text-one-gold font-label tracking-wide">
            <MapPin className="h-3 w-3" />
            <span>{location.name}</span>
          </div>

          <div className="h-4 w-px bg-one-border" />

          {/* Current temp */}
          <div className="flex items-center gap-1.5">
            {iconMap[iconKey]}
            <span className="text-one-white font-h4 text-sm">{formatTempC(weather.tempC)}</span>
          </div>

          <div className="h-4 w-px bg-one-border" />

          {/* High/Low */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-one-muted">
            <Thermometer className="h-3 w-3" />
            <span>H:{formatTempC(weather.tempMaxC)}</span>
            <span>L:{formatTempC(weather.tempMinC)}</span>
          </div>

          {/* Wind */}
          <div className="hidden md:flex items-center gap-1 text-xs text-one-muted">
            <Wind className="h-3 w-3" />
            <span>{Math.round(weather.windKmh)} km/h</span>
          </div>

          {/* Conditions */}
          <div className="hidden lg:block text-xs text-one-muted">
            {getWeatherDescription(weather.weatherCode)}
          </div>
        </motion.div>
      </AnimatePresence>
      <p className="font-label text-[9px] tracking-[0.14em] uppercase text-one-muted/75">
        {coverageCaption}
      </p>
    </div>
  )
}

// Compact version for the live player bar — same townData cycle + Open-Meteo
export function WeatherMini() {
  const { location, weather, loading } = useWeatherCycle(gvWeatherTowns)

  if (loading && !weather) return <WeatherMiniCoverage />
  if (!weather) return <WeatherMiniCoverage />

  const iconKey = getWeatherIconKey(weather.weatherCode)
  const label = `${location.name} ${formatTempC(weather.tempC)} · ${coverageCaption}`

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.name}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-1.5 text-xs text-one-muted"
        title={label}
        aria-label={label}
      >
        {iconMapSmall[iconKey]}
        <span className="text-one-white font-medium">{formatTempC(weather.tempC)}</span>
        <span className="hidden sm:inline">{location.name}</span>
        <span className="hidden xl:inline">
          <WeatherMiniCoverage announce={false} />
        </span>
      </motion.div>
    </AnimatePresence>
  )
}
