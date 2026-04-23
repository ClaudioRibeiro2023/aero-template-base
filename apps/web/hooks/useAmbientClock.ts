'use client'

import { useEffect, useState } from 'react'

export interface AmbientClock {
  /** Ex.: "Qua, 22 abr" — placeholder "—" no primeiro render SSR */
  date: string
  /** Ex.: "17:43" — placeholder "—:—" no primeiro render SSR */
  time: string
  /** Date nativo, null antes do mount (evita hydration mismatch) */
  now: Date | null
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

const PLACEHOLDER: AmbientClock = { date: '—', time: '—:—', now: null }

/**
 * Relógio ambiente do Omnibar — atualiza a cada minuto.
 *
 * HYDRATION SAFETY: primeiro render (SSR + hidratação) retorna PLACEHOLDER
 * fixo. Só após `useEffect` (pós-mount) o relógio real entra — isso evita
 * hydration mismatch React #418 (server time ≠ client time).
 *
 * BUG FIX 2026-04-22: versão anterior tentava `(setTimeout as any)._interval = id`,
 * mas `window.setTimeout` retorna `number` primitivo no browser — não aceita
 * propriedades → `TypeError: Cannot create property '_interval' on number '72'`.
 * Agora usamos duas refs locais (timeoutId + intervalId) separadas.
 */
export function useAmbientClock(locale: string = 'pt-BR'): AmbientClock {
  const [clock, setClock] = useState<AmbientClock>(PLACEHOLDER)

  useEffect(() => {
    setClock(format(new Date(), locale))
    const tick = () => setClock(format(new Date(), locale))

    // Alinha o próximo tick ao início do próximo minuto
    const msToNextMinute = 60_000 - (Date.now() % 60_000)
    let intervalId: number | undefined
    const timeoutId = window.setTimeout(() => {
      tick()
      intervalId = window.setInterval(tick, 60_000)
    }, msToNextMinute)

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId !== undefined) window.clearInterval(intervalId)
    }
  }, [locale])

  return clock
}
