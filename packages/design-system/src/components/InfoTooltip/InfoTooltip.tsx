/**
 * InfoTooltip / InfoPopover — divulgacao de informacao canonica (Regra 28 - R3).
 *
 * Primitivas com PORTAL + deteccao de colisao (Radix Tooltip/Popover com
 * collisionPadding): nunca estouram nem sobrepoem cards vizinhos, ao contrario
 * de um posicionamento absoluto na mao. Use SEMPRE estes componentes para o
 * icone "i" de KPI/cards, em TODAS as paginas (uma fonte por padrao de UI).
 *
 * - InfoTooltip: dica curta, abre no hover/foco (texto auxiliar).
 * - InfoPopover: conteudo rico, abre no clique (definicoes, metodologia, ajuda).
 */
import { type ReactNode } from 'react'
import { Tooltip, Popover } from 'radix-ui'
import { Info, X } from 'lucide-react'
import clsx from 'clsx'
import './InfoTooltip.css'

/** Lado preferido; a primitiva reposiciona automaticamente se colidir. */
export type InfoSide = 'top' | 'right' | 'bottom' | 'left'
/** Alinhamento ao longo do lado escolhido. */
export type InfoAlign = 'start' | 'center' | 'end'

export interface InfoTooltipProps {
  /** Conteudo curto exibido na dica. */
  content: ReactNode
  /** Lado preferido. @default 'top' */
  side?: InfoSide
  /** Rotulo acessivel do gatilho "i". @default 'Mais informacoes' */
  label?: string
  /** Tamanho do icone "i" em px. @default 14 */
  iconSize?: number
  /** Atraso (ms) antes de abrir. @default 200 */
  delay?: number
  /** Gatilho customizado; substitui o icone "i" padrao. */
  children?: ReactNode
  /** Classe extra aplicada ao gatilho padrao. */
  className?: string
}

/**
 * Dica de informacao acessivel para o "i" de cards/KPIs. Renderiza em portal e
 * evita colisao com a viewport (R3) — nunca posicione um tooltip na mao.
 *
 * @example
 * ```tsx
 * <InfoTooltip content="Soma do periodo selecionado" />
 * ```
 */
export function InfoTooltip({
  content,
  side = 'top',
  label = 'Mais informacoes',
  iconSize = 14,
  delay = 200,
  children,
  className,
}: InfoTooltipProps) {
  return (
    <Tooltip.Provider delayDuration={delay}>
      <Tooltip.Root>
        {children ? (
          <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        ) : (
          <Tooltip.Trigger className={clsx('ds-info-trigger', className)} aria-label={label}>
            <Info size={iconSize} aria-hidden="true" />
          </Tooltip.Trigger>
        )}
        <Tooltip.Portal>
          <Tooltip.Content
            className="ds-info-tooltip"
            side={side}
            sideOffset={6}
            collisionPadding={8}
          >
            {content}
            <Tooltip.Arrow className="ds-info-tooltip__arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

export interface InfoPopoverProps {
  /** Conteudo rico do popover. */
  content: ReactNode
  /** Titulo opcional no topo. */
  title?: string
  /** Lado preferido. @default 'top' */
  side?: InfoSide
  /** Alinhamento. @default 'center' */
  align?: InfoAlign
  /** Rotulo acessivel do gatilho "i". @default 'Mais informacoes' */
  label?: string
  /** Tamanho do icone "i" em px. @default 14 */
  iconSize?: number
  /** Exibe botao de fechar no canto. @default false */
  showClose?: boolean
  /** Gatilho customizado; substitui o icone "i" padrao. */
  children?: ReactNode
  /** Classe extra aplicada ao gatilho padrao. */
  className?: string
}

/**
 * Popover de informacao (clique) para conteudo mais longo: definicoes,
 * metodologia, ajuda contextual. Portal + collisionPadding (R3).
 *
 * @example
 * ```tsx
 * <InfoPopover title="Como calculamos" content={<p>Detalhes...</p>} showClose />
 * ```
 */
export function InfoPopover({
  content,
  title,
  side = 'top',
  align = 'center',
  label = 'Mais informacoes',
  iconSize = 14,
  showClose = false,
  children,
  className,
}: InfoPopoverProps) {
  return (
    <Popover.Root>
      {children ? (
        <Popover.Trigger asChild>{children}</Popover.Trigger>
      ) : (
        <Popover.Trigger className={clsx('ds-info-trigger', className)} aria-label={label}>
          <Info size={iconSize} aria-hidden="true" />
        </Popover.Trigger>
      )}
      <Popover.Portal>
        <Popover.Content
          className="ds-info-popover"
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={8}
        >
          {title && <p className="ds-info-popover__title">{title}</p>}
          <div className="ds-info-popover__body">{content}</div>
          {showClose && (
            <Popover.Close className="ds-info-popover__close" aria-label="Fechar">
              <X size={14} aria-hidden="true" />
            </Popover.Close>
          )}
          <Popover.Arrow className="ds-info-popover__arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default InfoTooltip
