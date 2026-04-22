'use client'

import { useEffect, useState } from 'react'

export interface WeatherState {
  /** temperatura inteira em °C */
  temp: number | null
  /** código WMO (Open-Meteo) */
  code: number | null
  /** ícone Unicode simples */
  icon: string
  /** label da cidade (fallback) */
  city: string
  loading: boolean
  error: string | null
}

interface UseWeatherOptions {
  /** nome para exibição (ex.: "SP", "São Paulo") */
  city?: string
  /** latitude/longitude opcional — se ausente, usa coords default */
  lat?: number
  lon?: number
  /** TTL do cache em ms (default: 10 min) */
  ttlMs?: number
}

const CACHE_KEY = 'ambient-weather-v1'
const DEFAULT_TTL = 10 * 60 * 1000 // 10 min
// Default: São Paulo, Brasil
const DEFAULT_LAT = -23.5475
const DEFAULT_LON = -46.6361
const DEFAULT_CITY = 'SP'

/** Mapa WMO → ícone Unicode compacto */
function iconFor(code: number | null): string {
  if (code === null) return '○'
  if (code === 0) return '☀'
  if (code <= 2) return '⛅'
  if (code === 3) return '☁'
  if (code >= 45 && code <= 48) return '🌫'
  if (code >= 51 && code <= 67) return '🌦'
  if (code >= 71 && code <= 77) return '🌨'
  if (code >= 80 && code <= 82) return '🌧'
  if (code >= 95) return '⛈'
  return '○'
}

interface CacheEntry {
  temp: number
  code: number
  ts: number
  key: string
}

/**
 * Retorna temperatura e código do tempo a partir da Open-Meteo (sem API key).
 * Cache em localStorage 10 min para evitar re-fetches.
 */
export function useWeather(opts: UseWeatherOptions = {}): WeatherState {
  const { city = DEFAULT_CITY, lat = DEFAULT_LAT, lon = DEFAULT_LON, ttlMs = DEFAULT_TTL } = opts

  const [state, setState] = useState<WeatherState>({
    temp: null,
    code: null,
    icon: '○',
    city,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`

    // 1. tenta cache
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const entry: CacheEntry = JSON.parse(raw)
        if (entry.key === cacheKey && Date.now() - entry.ts < ttlMs) {
          setState({
            temp: entry.temp,
            code: entry.code,
            icon: iconFor(entry.code),
            city,
            loading: false,
            error: null,
          })
          return
        }
      }
    } catch {
      /* cache corrompido — ignora */
    }

    // 2. fetch Open-Meteo
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: { current?: { temperature_2m?: number; weather_code?: number } }) => {
        if (cancelled) return
        const temp = Math.round(data.current?.temperature_2m ?? 0)
        const code = data.current?.weather_code ?? null
        setState({ temp, code, icon: iconFor(code), city, loading: false, error: null })
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ temp, code, ts: Date.now(), key: cacheKey })
          )
        } catch {
          /* quota excedida — ignora */
        }
      })
      .catch((err: Error) => {
        if (cancelled) return
        setState(prev => ({ ...prev, loading: false, error: err.message }))
      })

    return () => {
      cancelled = true
    }
  }, [lat, lon, city, ttlMs])

  return state
}
