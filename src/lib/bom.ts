// BOM (Bureau of Meteorology) Weather API Integration
// FREE - No API key required - Public data
// Documentation: http://www.bom.gov.au/catalogue/data-feeds.shtml

export interface BOMObservation {
  wmo_id: number;
  name: string;
  history_product: string;
  local_date_time: string;
  local_date_time_full: string;
  aifstime_utc: string;
  lat: number;
  lon: number;
  apparent_t: number;
  cloud: string;
  cloud_oktas: number;
  cloud_type: string;
  cloud_type_id: string;
  delta_t: number;
  gust_kmh: number;
  gust_kt: number;
  air_temp: number;
  dewpt: number;
  press: number;
  press_msl: number;
  press_qnh: number;
  press_tend: string;
  rain_trace: string;
  rel_hum: number;
  sea_state: string;
  swell_dir_worded: string;
  swell_height: number;
  swell_period: number;
  vis_km: string;
  weather: string;
  wind_dir: string;
  wind_spd_kmh: number;
  wind_spd_kt: number;
}

export interface BOMForecast {
  date: string;
  day: string;
  temp_max: number | null;
  temp_min: number | null;
  extended_text: string;
  icon_descriptor: string;
  short_text: string;
  fire_danger: string | null;
  uv_index: number | null;
  uv_alert: string | null;
  rainfall: {
    min: number | null;
    max: number | null;
    chance: number | null;
    units: string;
  };
}

export interface BOMWarning {
  title: string;
  type: string;
  severity: string;
  area: string;
  issue_time: string;
  expiry_time: string;
  description: string;
  instruction: string;
}

// Shepparton weather station identifier
const SHEPPARTON_WMO_ID = 94872;

// BOM JSON endpoints (CORS-friendly via backend proxy, or use RSS in browser)
export const BOM_ENDPOINTS = {
  // Victoria observations - all stations
  vicObservations: 'http://www.bom.gov.au/fwo/IDV60910/IDV60910.vic.json',
  // Victoria forecasts
  vicForecasts: 'http://www.bom.gov.au/fwo/IDV60901/IDV60901.vic.json',
  // Victoria warnings
  vicWarnings: 'http://www.bom.gov.au/fwo/IDZ00087.json',
  // Shepparton specific page (HTML)
  sheppartonPage: 'http://www.bom.gov.au/places/vic/shepparton/',
  // RSS feeds
  rssWarnings: 'http://www.bom.gov.au/rss/state/vic/warnings.shtml',
  rssForecasts: 'http://www.bom.gov.au/rss/state/vic/forecasts.shtml',
  rssObservations: 'http://www.bom.gov.au/rss/state/vic/observations.shtml',
};

// Mock Shepparton weather data (based on typical Goulburn Valley climate)
export const MOCK_SHEPPARTON_WEATHER = {
  current: {
    wmo_id: SHEPPARTON_WMO_ID,
    name: 'Shepparton',
    local_date_time_full: '20260501T140000+1000',
    air_temp: 22.5,
    apparent_t: 21.8,
    rel_hum: 45,
    wind_dir: 'NNE',
    wind_spd_kmh: 18,
    gust_kmh: 28,
    press: 1018.2,
    rain_trace: '0.0',
    weather: 'Partly cloudy',
    lat: -36.38,
    lon: 145.40,
  } as BOMObservation,
  forecast: [
    {
      date: '2026-05-01',
      day: 'Friday',
      temp_max: 24,
      temp_min: 10,
      short_text: 'Partly cloudy.',
      extended_text: 'Partly cloudy. The chance of morning fog. Light winds becoming northerly 15 to 20 km/h in the morning.',
      icon_descriptor: 'partly-cloudy',
      fire_danger: 'Low-Moderate',
      uv_index: 4,
      rainfall: { min: 0, max: 0.2, chance: 20, units: 'mm' },
    },
    {
      date: '2026-05-02',
      day: 'Saturday',
      temp_max: 26,
      temp_min: 11,
      short_text: 'Sunny.',
      extended_text: 'Sunny. Light winds becoming northerly 15 to 25 km/h during the day.',
      icon_descriptor: 'sunny',
      fire_danger: 'High',
      uv_index: 5,
      rainfall: { min: 0, max: 0, chance: 5, units: 'mm' },
    },
    {
      date: '2026-05-03',
      day: 'Sunday',
      temp_max: 23,
      temp_min: 12,
      short_text: 'Showers.',
      extended_text: 'Cloudy. High chance of showers, most likely in the afternoon and evening. Winds northerly 20 to 30 km/h.',
      icon_descriptor: 'shower',
      fire_danger: 'Low-Moderate',
      uv_index: 3,
      rainfall: { min: 2, max: 8, chance: 70, units: 'mm' },
    },
    {
      date: '2026-05-04',
      day: 'Monday',
      temp_max: 19,
      temp_min: 9,
      short_text: 'Showers easing.',
      extended_text: 'Partly cloudy. Medium chance of showers in the morning. Winds southwesterly 15 to 25 km/h.',
      icon_descriptor: 'partly-cloudy',
      fire_danger: 'Low',
      uv_index: 3,
      rainfall: { min: 0.2, max: 2, chance: 40, units: 'mm' },
    },
    {
      date: '2026-05-05',
      day: 'Tuesday',
      temp_max: 21,
      temp_min: 7,
      short_text: 'Sunny.',
      extended_text: 'Sunny. The chance of morning frost. Light winds.',
      icon_descriptor: 'sunny',
      fire_danger: 'Low',
      uv_index: 4,
      rainfall: { min: 0, max: 0, chance: 5, units: 'mm' },
    },
    {
      date: '2026-05-06',
      day: 'Wednesday',
      temp_max: 22,
      temp_min: 8,
      short_text: 'Mostly sunny.',
      extended_text: 'Mostly sunny. Light winds becoming northerly 15 to 20 km/h.',
      icon_descriptor: 'mostly-sunny',
      fire_danger: 'Low-Moderate',
      uv_index: 4,
      rainfall: { min: 0, max: 0, chance: 10, units: 'mm' },
    },
    {
      date: '2026-05-07',
      day: 'Thursday',
      temp_max: 25,
      temp_min: 10,
      short_text: 'Sunny.',
      extended_text: 'Sunny. Winds northerly 15 to 25 km/h.',
      icon_descriptor: 'sunny',
      fire_danger: 'High',
      uv_index: 5,
      rainfall: { min: 0, max: 0, chance: 5, units: 'mm' },
    },
  ] as BOMForecast[],
  warnings: [
    {
      title: 'Fire Weather Warning',
      type: 'fire',
      severity: 'Watch and Act',
      area: 'Northern Country',
      issue_time: '2026-05-01T05:00:00+1000',
      expiry_time: '2026-05-02T18:00:00+1000',
      description: 'Fire Weather Warning for the Mallee, Wimmera, Northern Country and North East districts.',
      instruction: 'If you are in an area of severe fire danger, activate your bushfire survival plan.',
    },
  ] as BOMWarning[],
};

// BOM API client
export class BOMClient {
  // Fetch current observations for Victoria, filter for Shepparton
  async getSheppartonObservation(): Promise<BOMObservation> {
    try {
      // In production, fetch from BOM endpoint via backend proxy
      // For now, return mock data with slight randomization for realism
      const mock = { ...MOCK_SHEPPARTON_WEATHER.current };
      mock.air_temp += (Math.random() - 0.5) * 2; // +/- 1 degree variation
      mock.wind_spd_kmh += Math.floor((Math.random() - 0.5) * 4);
      mock.local_date_time_full = new Date().toISOString();
      return mock;
    } catch (error) {
      console.error('BOM fetch error:', error);
      return MOCK_SHEPPARTON_WEATHER.current;
    }
  }

  // Get 7-day forecast
  async getSheppartonForecast(): Promise<BOMForecast[]> {
    return MOCK_SHEPPARTON_WEATHER.forecast;
  }

  // Get active warnings
  async getVictoriaWarnings(): Promise<BOMWarning[]> {
    return MOCK_SHEPPARTON_WEATHER.warnings;
  }
}

// Weather icon mapping
export function getWeatherIcon(iconDescriptor: string): string {
  const iconMap: Record<string, string> = {
    'sunny': 'sun',
    'mostly-sunny': 'cloud-sun',
    'partly-cloudy': 'cloud-sun',
    'cloudy': 'cloud',
    'overcast': 'cloud',
    'shower': 'cloud-rain',
    'rain': 'cloud-rain',
    'storm': 'cloud-lightning',
    'snow': 'snowflake',
    'frost': 'thermometer-cold',
    'fog': 'foggy',
    'windy': 'wind',
    'dust': 'wind',
  };
  return iconMap[iconDescriptor] || 'cloud';
}

// Format temperature with units
export function formatTemp(temp: number | null): string {
  if (temp === null) return '--';
  return `${Math.round(temp)}°C`;
}

// Format wind
export function formatWind(dir: string, spd: number): string {
  return `${dir} ${spd} km/h`;
}

// Fire danger color
export function getFireDangerColor(danger: string | null): string {
  if (!danger) return 'text-one-muted';
  const colors: Record<string, string> = {
    'Low': 'text-emerald-400',
    'Low-Moderate': 'text-emerald-400',
    'Moderate': 'text-yellow-400',
    'High': 'text-orange-400',
    'Very High': 'text-orange-500',
    'Severe': 'text-red-500',
    'Extreme': 'text-red-600',
    'Catastrophic': 'text-purple-500',
  };
  return colors[danger] || 'text-one-muted';
}

// UV index guidance
export function getUVGuidance(uv: number | null): { level: string; color: string } {
  if (uv === null) return { level: 'Unknown', color: 'text-one-muted' };
  if (uv <= 2) return { level: 'Low', color: 'text-emerald-400' };
  if (uv <= 5) return { level: 'Moderate', color: 'text-yellow-400' };
  if (uv <= 7) return { level: 'High', color: 'text-orange-400' };
  if (uv <= 10) return { level: 'Very High', color: 'text-red-500' };
  return { level: 'Extreme', color: 'text-purple-500' };
}
