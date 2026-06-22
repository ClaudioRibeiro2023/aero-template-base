/**
 * StatCard — card de KPI canonico (Regra 28 - R2).
 *
 * Anatomia FIXA, identica em todas as paginas: titulo - valor - delta -
 * icone-grafico (sparkline) + icone de info no canto inferior direito.
 * NAO inclui linha de fonte tecnica por card: a proveniencia/atualizacao vive
 * em UM unico ponto da pagina (use <PageDataFreshness> no rodape). Importe este
 * componente; nao recrie "mais um card parecido" por pagina.
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { InfoTooltip, InfoPopover } from '../InfoTooltip/InfoTooltip'
import './StatCard.css'

export type StatDeltaDirection = 'up' | 'down' | 'neutral'
export type StatCardTone = 'default' | 'positive' | 'negative' | 'warning'

export interface StatDelta {
  /** Texto/numero da variacao, ja formatado (ex.: '+12,5%'). */
  value: ReactNode
  /** Sentido da variacao: define seta e cor. @default 'neutral' */
  direction?: StatDeltaDirection
  /** Rotulo curto de contexto (ex.: 'vs ciclo anterior'). */
  label?: string
}

export interface StatCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Rotulo da metrica. */
  title: ReactNode
  /** Valor em destaque. */
  value: ReactNode
  /** Linha de variacao (delta) opcional. */
  delta?: StatDelta
  /** Icone-grafico customizado; tem prioridade sobre `sparkline`. */
  chart?: ReactNode
  /** Atalho: serie numerica renderizada como mini sparkline. */
  sparkline?: number[]
  /** Conteudo do "i" (canto inferior direito). Texto curto = tooltip. */
  info?: ReactNode
  /** Modo do "i": dica no hover ou popover no clique. @default 'tooltip' */
  infoMode?: 'tooltip' | 'popover'
  /** Titulo do popover quando infoMode='popover'. */
  infoTitle?: string
  /** Icone opcional a esquerda do titulo. */
  icon?: ReactNode
  /** Acento de cor do card. @default 'default' */
  tone?: StatCardTone
}

const DELTA_ICON: Record<StatDeltaDirection, ReactNode> = {
  up: <TrendingUp size={14} aria-hidden="true" />,
  down: <TrendingDown size={14} aria-hidden="true" />,
  neutral: <Minus size={14} aria-hidden="true" />,
}

/** Mini sparkline decorativo (aria-hidden) desenhado a partir de uma serie. */
function Sparkline({ values }: { values: number[] }) {
  if (!values || values.length < 2) return null
  const w = 96
  const h = 28
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w
      const y = h - ((v - min) / range) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg
      className="ds-stat-card__sparkline"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Card de indicador com anatomia canonica. Use dentro de <CardGrid> para que
 * cards irmaos fiquem com altura igual (R4).
 *
 * @example
 * ```tsx
 * <StatCard
 *   title="Municipios atendidos"
 *   value="628"
 *   delta={{ value: '+18', direction: 'up', label: 'vs ciclo anterior' }}
 *   sparkline={[12, 18, 15, 22, 28, 31]}
 *   info="Municipios com pelo menos um atendimento no ciclo."
 * />
 * ```
 */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      title,
      value,
      delta,
      chart,
      sparkline,
      info,
      infoMode = 'tooltip',
      infoTitle,
      icon,
      tone = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const direction = delta?.direction ?? 'neutral'
    const chartNode = chart ?? (sparkline ? <Sparkline values={sparkline} /> : null)

    return (
      <div
        ref={ref}
        className={clsx('ds-stat-card', `ds-stat-card--${tone}`, className)}
        {...props}
      >
        <div className="ds-stat-card__head">
          {icon && (
            <span className="ds-stat-card__icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="ds-stat-card__title">{title}</span>
        </div>

        <div className="ds-stat-card__value">{value}</div>

        {delta && (
          <div className={clsx('ds-stat-card__delta', `ds-stat-card__delta--${direction}`)}>
            <span className="ds-stat-card__delta-icon">{DELTA_ICON[direction]}</span>
            <span className="ds-stat-card__delta-value">{delta.value}</span>
            {delta.label && <span className="ds-stat-card__delta-label">{delta.label}</span>}
          </div>
        )}

        {chartNode && <div className="ds-stat-card__chart">{chartNode}</div>}

        {info != null && (
          <div className="ds-stat-card__info">
            {infoMode === 'popover' ? (
              <InfoPopover content={info} title={infoTitle} side="top" align="end" />
            ) : (
              <InfoTooltip content={info} side="top" />
            )}
          </div>
        )}
      </div>
    )
  }
)

StatCard.displayName = 'StatCard'

export default StatCard
