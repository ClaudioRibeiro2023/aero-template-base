/**
 * TopbarStatusBand — banda de status compacta do topo (Regra 28 - R6).
 *
 * Consolida ciclo, contagem e indicador LIVE numa unica banda enxuta, em vez de
 * espalhar esses dados pelo topbar inteiro. Uma fonte por padrao de UI.
 */
import { type HTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'
import './TopbarStatusBand.css'

export interface StatusBandItem {
  /** Rotulo curto (ex.: 'Ciclo'). */
  label?: string
  /** Valor (ex.: '2026 - Junho', '628 municipios'). */
  value: ReactNode
  /** Icone opcional. */
  icon?: ReactNode
}

export interface TopbarStatusBandProps extends HTMLAttributes<HTMLDivElement> {
  /** Itens compactos (ciclo, nº de municipios, etc.). */
  items: StatusBandItem[]
  /** Mostra o indicador de tempo-real. @default false */
  live?: boolean
  /** Rotulo do indicador de tempo-real. @default 'LIVE' */
  liveLabel?: string
}

/**
 * @example
 * ```tsx
 * <TopbarStatusBand
 *   items={[
 *     { label: 'Ciclo', value: '2026 - Junho' },
 *     { label: 'Municipios', value: '628' },
 *   ]}
 *   live
 * />
 * ```
 */
export function TopbarStatusBand({
  items,
  live = false,
  liveLabel = 'LIVE',
  className,
  ...props
}: TopbarStatusBandProps) {
  return (
    <div className={clsx('ds-status-band', className)} role="status" {...props}>
      {items.map((item, index) => (
        <span className="ds-status-band__item" key={index}>
          {item.icon && (
            <span className="ds-status-band__icon" aria-hidden="true">
              {item.icon}
            </span>
          )}
          {item.label && <span className="ds-status-band__label">{item.label}</span>}
          <span className="ds-status-band__value">{item.value}</span>
        </span>
      ))}
      {live && (
        <span className="ds-status-band__live">
          <span className="ds-status-band__live-dot" aria-hidden="true" />
          {liveLabel}
        </span>
      )}
    </div>
  )
}

export default TopbarStatusBand
