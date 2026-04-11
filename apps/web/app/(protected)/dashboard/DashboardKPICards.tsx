'use client'

/**
 * DashboardKPICards — Seção de KPI cards com drag-and-drop reordering.
 * Extraído de DashboardClient.tsx (Sprint 5 refactor).
 */
import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useReducedMotion } from '@/hooks/useA11y'
import { ArrowUpRight, ArrowDownRight, GripVertical } from 'lucide-react'

// ── Animated count-up hook ──
function useCountUp(target: number, duration = 800, skipAnimation = false) {
  const [count, setCount] = useState(skipAnimation ? target : 0)

  useEffect(() => {
    if (skipAnimation) {
      setCount(target)
      return
    }

    const startTime = performance.now()

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [target, duration, skipAnimation])

  return count
}

function AnimatedValue({ value, suffix = '' }: { value: number; suffix?: string }) {
  const prefersReduced = useReducedMotion()
  const count = useCountUp(value, 800, prefersReduced)
  return (
    <>
      {count}
      {suffix}
    </>
  )
}

function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`shimmer rounded-lg ${className}`} style={style} aria-hidden="true" />
}

export function KpiCard({
  label,
  icon: Icon,
  value,
  change,
  up,
  path,
  loading,
}: {
  label: string
  icon: React.ElementType
  value: string
  change: string
  up: boolean
  path: string
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="glass-panel p-5 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    )
  }

  return (
    <Link
      href={path}
      className="group relative block glass-panel p-5 transition-all duration-300 hover:-translate-y-[2px] hover:border-[var(--glass-border-hover)] hover:shadow-lg"
    >
      <div
        className="absolute inset-0 rounded-[var(--radius-lg)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: '0 0 24px var(--glow-brand)' }}
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between">
        <div className="p-2.5 rounded-xl bg-[var(--brand-primary)]/10 backdrop-blur-sm">
          <Icon size={20} className="text-[var(--brand-primary)]" aria-hidden="true" />
        </div>
        <span
          className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${
            up ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
          }`}
        >
          {up ? (
            <ArrowUpRight size={12} aria-hidden="true" />
          ) : (
            <ArrowDownRight size={12} aria-hidden="true" />
          )}
          {change}
        </span>
      </div>
      <p className="relative mt-4 text-2xl font-bold font-mono tracking-tight text-[var(--text-primary)]">
        {(() => {
          const hasSuffix = value.endsWith('%')
          const num = parseInt(value.replace('%', ''), 10)
          return isNaN(num) ? value : <AnimatedValue value={num} suffix={hasSuffix ? '%' : ''} />
        })()}
      </p>
      <p className="relative mt-1 text-sm text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
        {label}
      </p>
    </Link>
  )
}

// ── Hook for widget ordering with localStorage persistence ──
const STORAGE_KEY = 'dashboard-widget-order'

function useWidgetOrder(defaultKeys: string[], storageKey = STORAGE_KEY) {
  const [order, setOrder] = useState<string[]>(defaultKeys)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed: string[] = JSON.parse(saved)
        if (parsed.length === defaultKeys.length && parsed.every(k => defaultKeys.includes(k))) {
          setOrder(parsed)
        }
      }
    } catch {
      // ignore
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const saveOrder = useCallback(
    (newOrder: string[]) => {
      setOrder(newOrder)
      try {
        localStorage.setItem(storageKey, JSON.stringify(newOrder))
      } catch {
        // ignore
      }
    },
    [storageKey]
  )

  return { order, saveOrder }
}

// ── Sparkline mini chart ──
function Sparkline({
  values,
  color = 'var(--brand-primary)',
}: {
  values: number[]
  color?: string
}) {
  if (values.length < 2) return null
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const w = 64,
    h = 24,
    pad = 2
  const points = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2)
      const y = h - pad - ((v - min) / range) * (h - pad * 2)
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg width={w} height={h} aria-hidden="true" className="opacity-70">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export { useWidgetOrder, AnimatedValue, Sparkline }

// ── KPI Card data type ──
interface KpiCardData {
  key: string
  label: string
  icon: React.ElementType
  value: string
  change: string
  up: boolean
  path: string
}

interface DashboardKPICardsProps {
  cards: KpiCardData[]
  loading: boolean
}

export function DashboardKPICards({ cards, loading }: DashboardKPICardsProps) {
  const { order, saveOrder } = useWidgetOrder(cards.map(c => c.key))
  const orderedCards = order.map(key => cards.find(c => c.key === key)!).filter(Boolean)
  const dragIndexRef = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  function handleDragStart(index: number) {
    dragIndexRef.current = index
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    setDragOver(index)
  }

  function handleDrop(index: number) {
    const from = dragIndexRef.current
    if (from === null || from === index) {
      dragIndexRef.current = null
      setDragOver(null)
      return
    }
    const newOrder = [...order]
    const [moved] = newOrder.splice(from, 1)
    newOrder.splice(index, 0, moved)
    saveOrder(newOrder)
    dragIndexRef.current = null
    setDragOver(null)
  }

  function handleDragEnd() {
    dragIndexRef.current = null
    setDragOver(null)
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    const len = orderedCards.length
    if (e.key === 'Escape') {
      e.preventDefault()
      ;(e.currentTarget as HTMLElement).blur()
      return
    }
    if (!['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const newOrder = [...order]
    let targetIndex = index
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      targetIndex = Math.max(0, index - 1)
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      targetIndex = Math.min(len - 1, index + 1)
    } else if (e.key === 'Home') {
      targetIndex = 0
    } else if (e.key === 'End') {
      targetIndex = len - 1
    }
    if (targetIndex === index) return
    const [moved] = newOrder.splice(index, 1)
    newOrder.splice(targetIndex, 0, moved)
    saveOrder(newOrder)
    setFocusedIndex(targetIndex)
  }

  return (
    <section aria-label="Indicadores principais" className="relative z-10">
      <div
        role="list"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-children"
      >
        {orderedCards.map(({ key, ...card }, index) => (
          <div
            key={key}
            role="listitem"
            tabIndex={0}
            draggable
            aria-label={`${card.label}, posição ${index + 1} de ${orderedCards.length}. Use as teclas de seta para mover.`}
            onDragStart={() => handleDragStart(index)}
            onDragOver={e => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            onKeyDown={e => handleKeyDown(e, index)}
            className="group/drag relative"
            style={{
              opacity: dragIndexRef.current === index ? 0.5 : 1,
              outline:
                focusedIndex === index
                  ? '2px solid var(--brand-primary)'
                  : dragOver === index
                    ? '2px dashed var(--brand-primary)'
                    : undefined,
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div
              className="absolute top-2 right-2 z-10 opacity-0 group-hover/drag:opacity-60 transition-opacity cursor-grab active:cursor-grabbing"
              aria-hidden="true"
            >
              <GripVertical size={14} className="text-[var(--text-muted)]" />
            </div>
            <KpiCard {...card} loading={loading} />
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-[var(--text-muted)] text-right">
        Arraste para reordenar
      </p>
    </section>
  )
}
