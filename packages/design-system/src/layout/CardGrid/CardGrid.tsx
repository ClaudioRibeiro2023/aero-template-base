/**
 * CardGrid — grade de cards canonica (Regra 28 - R4).
 *
 * Cards irmaos ficam com ALTURA IGUAL (align-items: stretch) e espacamento vem
 * SEMPRE da escala de tokens — nunca margens ad-hoc, nunca buraco vertical
 * abaixo de um card mais baixo. Combine com componentes que ocupam 100% da
 * altura (ex.: <StatCard>) para preencher a linha.
 */
import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react'
import clsx from 'clsx'
import './CardGrid.css'

export type CardGridGap = 'sm' | 'md' | 'lg'

export interface CardGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Numero fixo de colunas, ou 'auto' para auto-fit responsivo. @default 'auto' */
  columns?: number | 'auto'
  /** Largura minima de cada item quando columns='auto'. @default '240px' */
  minItemWidth?: string
  /** Espacamento (escala de tokens). @default 'md' */
  gap?: CardGridGap
}

/**
 * @example
 * ```tsx
 * <CardGrid minItemWidth="220px">
 *   <StatCard ... />
 *   <StatCard ... />
 *   <StatCard ... />
 * </CardGrid>
 * ```
 */
export const CardGrid = forwardRef<HTMLDivElement, CardGridProps>(
  ({ columns = 'auto', minItemWidth = '240px', gap = 'md', className, style, ...props }, ref) => {
    const gridStyle: CSSProperties = {
      gridTemplateColumns:
        columns === 'auto'
          ? `repeat(auto-fit, minmax(min(${minItemWidth}, 100%), 1fr))`
          : `repeat(${columns}, minmax(0, 1fr))`,
      ...style,
    }

    return (
      <div
        ref={ref}
        className={clsx('ds-card-grid', `ds-card-grid--gap-${gap}`, className)}
        style={gridStyle}
        {...props}
      />
    )
  }
)

CardGrid.displayName = 'CardGrid'

export default CardGrid
