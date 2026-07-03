import { Sun, Cloud, CloudRain, CloudLightning, CloudFog, Snowflake, Wind, Thermometer, RefreshCw, CloudSun, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWeatherCycle } from '@/hooks/useWeatherCycle'
import { gvWeatherTowns } from '@/data/weatherLocations'
import { getWeatherDescription, getWeatherIconKey, formatTempC, type WeatherIconKey } from '@/lib/weather'

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

// Full version — cycles through Shepparton + GV major towns
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

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.name}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-3"
      >
        {/* Town */}
        <div className="hidden sm:flex items-center gap-1 text-xs text-one-gold font-label tracking-wide">
          <MapPin className="h-3 w-3" />
          <span>{location.name}</span>
        </div>

        <div className="hidden sm:block h-4 w-px bg-one-border" />

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
  )
}

// Compact version for the live player bar — cycles through the same towns
export function WeatherMini() {
  const { location, weather, loading } = useWeatherCycle(gvWeatherTowns)

  if (loading && !weather) return null
  if (!weather) return null

  const iconKey = getWeatherIconKey(weather.weatherCode)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.name}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-1.5 text-xs text-one-muted"
      >
        {iconMapSmall[iconKey]}
        <span className="text-one-white font-medium">{formatTempC(weather.tempC)}</span>
        <span className="hidden sm:inline">{location.name}</span>
      </motion.div>
    </AnimatePresence>
  )
}
