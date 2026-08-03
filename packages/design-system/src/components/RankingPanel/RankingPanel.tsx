/**
 * RankingPanel — painel de ranking canonico (Regra 28 - R2).
 *
 * UM unico layout de ranking em toda a plataforma: "5 melhores" x "5 que mais
 * precisam", com barras proporcionais e realce do topo. Importe este componente
 * em vez de recriar "mais um ranking parecido" por pagina.
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'
import './RankingPanel.css'

export interface RankingItem {
  /** Chave estavel (opcional; cai no indice). */
  id?: string | number
  /** Rotulo da entidade (municipio, consorcio, etc.). */
  label: string
  /** Valor numerico — define a largura da barra. */
  value: number
  /** Valor ja formatado para exibicao (ex.: '92,4%'); cai em `value`. */
  displayValue?: ReactNode
  /** Texto secundario curto (ex.: regiao). */
  meta?: ReactNode
}

export interface RankingPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Titulo do painel (opcional). */
  title?: ReactNode
  /** Melhores colocados, ja ordenados do melhor para o pior. */
  best: RankingItem[]
  /** Os que mais precisam de atencao, ja ordenados por prioridade. */
  needs: RankingItem[]
  /** Rotulo da coluna de melhores. @default 'Melhores' */
  bestLabel?: string
  /** Rotulo da coluna de prioridade. @default 'Mais precisam' */
  needsLabel?: string
  /** Maximo de itens por coluna. @default 5 */
  limit?: number
  /** Escala das barras: 'max' (relativa ao maior da coluna) ou 'percent' (valor 0-100). @default 'max' */
  scale?: 'max' | 'percent'
}

type RankTone = 'best' | 'needs'

function barWidth(value: number, columnMax: number, scale: 'max' | 'percent'): number {
  if (scale === 'percent') return Math.min(Math.max(value, 0), 100)
  if (columnMax <= 0) return 0
  return Math.min(Math.max((value / columnMax) * 100, 0), 100)
}

function RankColumn({
  label,
  items,
  tone,
  limit,
  scale,
}: {
  label: string
  items: RankingItem[]
  tone: RankTone
  limit: number
  scale: 'max' | 'percent'
}) {
  const shown = items.slice(0, limit)
  const columnMax = Math.max(0, ...shown.map(i => i.value))

  return (
    <div className={clsx('ds-ranking__col', `ds-ranking__col--${tone}`)}>
      <p className="ds-ranking__col-title">{label}</p>
      <ol className="ds-ranking__list">
        {shown.map((item, index) => (
          <li
            key={item.id ?? index}
            className={clsx('ds-ranking__item', index === 0 && 'ds-ranking__item--lead')}
          >
            <span className="ds-ranking__rank" aria-hidden="true">
              {index + 1}
            </span>
            <div className="ds-ranking__body">
              <div className="ds-ranking__row">
                <span className="ds-ranking__label" title={item.label}>
                  {item.label}
                </span>
                <span className="ds-ranking__value">{item.displayValue ?? item.value}</span>
              </div>
              <div className="ds-ranking__track">
                <div
                  className="ds-ranking__bar"
                  style={{ width: `${barWidth(item.value, columnMax, scale)}%` }}
                />
              </div>
              {item.meta && <span className="ds-ranking__meta">{item.meta}</span>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/**
 * Painel de ranking de dois lados (melhores x prioridade).
 *
 * @example
 * ```tsx
 * <RankingPanel
 *   title="Cobertura por municipio"
 *   best={[{ label: 'Cidade A', value: 98, displayValue: '98%' }]}
 *   needs={[{ label: 'Cidade Z', value: 21, displayValue: '21%' }]}
 * />
 * ```
 */
export const RankingPanel = forwardRef<HTMLDivElement, RankingPanelProps>(
  (
    {
      title,
      best,
      needs,
      bestLabel = 'Melhores',
      needsLabel = 'Mais precisam',
      limit = 5,
      scale = 'max',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={clsx('ds-ranking', className)} {...props}>
        {title && <p className="ds-ranking__title">{title}</p>}
        <div className="ds-ranking__cols">
          <RankColumn label={bestLabel} items={best} tone="best" limit={limit} scale={scale} />
          <RankColumn label={needsLabel} items={needs} tone="needs" limit={limit} scale={scale} />
        </div>
      </div>
    )
  }
)

RankingPanel.displayName = 'RankingPanel'

export default RankingPanel
