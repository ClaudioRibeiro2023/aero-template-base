'use client'

import { memo } from 'react'
import { useAmbientClock } from '@/hooks/useAmbientClock'
import { useWeather } from '@/hooks/useWeather'

export interface AmbientClusterProps {
  /** Locale do relógio (ex.: 'pt-BR') */
  locale?: string
  /** Label curto da cidade */
  city?: string
  /** Coordenadas opcionais (default: São Paulo) */
  lat?: number
  lon?: number
  /** Oculta a pill de clima (ex.: tela muito estreita) */
  hideWeather?: boolean
  className?: string
}

/**
 * Cluster Ambiente do Omnibar — data · hora · pill de clima.
 * Design validado 2026-04-22 (Proposta C · Opção A).
 */
export const AmbientCluster = memo(function AmbientCluster({
  locale = 'pt-BR',
  city = 'SP',
  lat,
  lon,
  hideWeather = false,
  className,
}: AmbientClusterProps) {
  const clock = useAmbientClock(locale)
  const weather = useWeather({ city, lat, lon })

  return (
    <div
      className={`ambient-cluster${className ? ` ${className}` : ''}`}
      aria-label={`Data e hora: ${clock.date}, ${clock.time}`}
    >
      <span className="ac-date" suppressHydrationWarning>
        {clock.date}
      </span>
      <span className="ac-dot" aria-hidden="true" />
      <span className="ac-time" suppressHydrationWarning>
        {clock.time}
      </span>
      {!hideWeather && (
        <>
          <span className="ac-dot" aria-hidden="true" />
          <span
            className="ac-weather"
            aria-label={
              weather.temp !== null
                ? `Clima em ${weather.city}: ${weather.temp} graus`
                : `Carregando clima de ${weather.city}`
            }
          >
            <span aria-hidden="true">{weather.icon}</span>
            <span>{weather.temp !== null ? `${weather.temp}°` : '—'}</span>
            <span className="text-[10px] opacity-60">{weather.city}</span>
          </span>
        </>
      )}
    </div>
  )
})
