'use client'

import { useEffect, useState } from 'react'

export interface AmbientClock {
  /** Ex.: "Qua, 22 abr" */
  date: string
  /** Ex.: "17:43" */
  time: string
  /** Date nativo sempre em tempo real */
  now: Date
}

const DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTH = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function format(now: Date, locale: string): AmbientClock {
  if (locale.startsWith('pt')) {
    const dateStr = `${DOW[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')} ${MONTH[now.getMonth()]}`
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    return { date: dateStr, time, now }
  }
  // fallback i18n nativo (en, es, …)
  const date = new Intl.DateTimeFormat(locale, { weekday: 'short', day: '2-digit', month: 'short' })
    .format(now)
    .replace('.', '')
  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now)
  return { date, time, now }
}

/**
 * Relógio ambiente do Omnibar — atualiza a cada minuto.
 * Safe para SSR: retorna hora atual no primeiro render client-side.
 */
export function useAmbientClock(locale: string = 'pt-BR'): AmbientClock {
  const [clock, setClock] = useState<AmbientClock>(() => format(new Date(), locale))

  useEffect(() => {
    setClock(format(new Date(), locale))
    const tick = () => setClock(format(new Date(), locale))
    // Alinha o próximo tick ao início do próximo minuto
    const msToNextMinute = 60_000 - (Date.now() % 60_000)
    const firstTimeout = window.setTimeout(() => {
      tick()
      const interval = window.setInterval(tick, 60_000)
      ;(firstTimeout as unknown as { _interval?: number })._interval = interval
    }, msToNextMinute)

    return () => {
      const ref = firstTimeout as unknown as { _interval?: number }
      window.clearTimeout(firstTimeout)
      if (ref._interval) window.clearInterval(ref._interval)
    }
  }, [locale])

  return clock
}
