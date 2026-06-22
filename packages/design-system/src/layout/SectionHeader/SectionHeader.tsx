/**
 * SectionHeader — cabecalho de secao canonico (Regra 28 - R5).
 *
 * Composicao fixa: sobrescrita (eyebrow, em maiusculas) + titulo grande (heading
 * REAL) + subtitulo curto descrevendo o que a secao entrega. O eyebrow NAO e um
 * heading; o titulo SIM. O nivel do titulo e configuravel para preservar a
 * hierarquia da pagina (uma <h1> via PageHeader; secoes em <h2> por padrao).
 */
import { type HTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'
import './SectionHeader.css'

export type SectionHeaderLevel = 1 | 2 | 3 | 4
export type SectionHeaderSize = 'md' | 'lg' | 'xl'

export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Sobrescrita pequena em maiusculas (rotulo, NAO e heading). */
  eyebrow?: ReactNode
  /** Titulo principal (renderizado como heading real). */
  title: ReactNode
  /** Subtitulo curto: o que esta secao entrega. */
  subtitle?: ReactNode
  /** Nivel do heading do titulo. @default 2 */
  as?: SectionHeaderLevel
  /** Tamanho visual do titulo. @default 'lg' */
  size?: SectionHeaderSize
  /** Slot de acoes a direita (filtros, botoes). */
  actions?: ReactNode
}

/**
 * @example
 * ```tsx
 * <SectionHeader
 *   eyebrow="Diagnostico operacional"
 *   title="Saude do programa no recorte"
 *   subtitle="Indicadores do ciclo corrente, atualizados a cada fechamento."
 * />
 * ```
 */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  as = 2,
  size = 'lg',
  actions,
  className,
  ...props
}: SectionHeaderProps) {
  const Heading = `h${as}` as 'h1' | 'h2' | 'h3' | 'h4'

  return (
    <header
      className={clsx('ds-section-header', `ds-section-header--${size}`, className)}
      {...props}
    >
      <div className="ds-section-header__text">
        {eyebrow && <p className="ds-section-header__eyebrow">{eyebrow}</p>}
        <Heading className="ds-section-header__title">{title}</Heading>
        {subtitle && <p className="ds-section-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="ds-section-header__actions">{actions}</div>}
    </header>
  )
}

export default SectionHeader
