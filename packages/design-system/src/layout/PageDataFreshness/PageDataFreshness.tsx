/**
 * PageDataFreshness — carimbo de atualizacao UNICO por pagina (Regra 28 - R6/R1).
 *
 * Existe UMA vez por pagina (no rodape), nunca repetido por card. E
 * "audience-aware": em pagina de cliente externo, NAO mostra proveniencia
 * tecnica (nome de tabela/fonte) como texto visivel — ela vai para o atributo
 * `title` (nao-visivel), conforme R1. Em pagina interna, a fonte pode aparecer.
 */
import { type HTMLAttributes } from 'react'
import clsx from 'clsx'
import { Clock } from 'lucide-react'
import './PageDataFreshness.css'

export type Audience = 'external' | 'internal' | 'mixed'

export interface PageDataFreshnessProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Data/hora da ultima atualizacao. `Date` e formatado; string e usada como veio. */
  updatedAt: Date | string
  /** Publico-alvo da pagina. 'external' esconde a proveniencia tecnica. @default 'external' */
  audience?: Audience
  /** Proveniencia tecnica (nome de tabela/fonte). Visivel so se audience != external; sempre no `title`. */
  source?: string
  /** Prefixo antes do carimbo. @default 'Dados oficiais' (external) / sem prefixo (internal). */
  label?: string
  /** Locale para formatar um `Date`. @default 'pt-BR' */
  locale?: string
  /** Exibe o icone de relogio. @default true */
  showIcon?: boolean
}

function formatStamp(updatedAt: Date | string, locale: string): { text: string; iso?: string } {
  if (typeof updatedAt === 'string') return { text: updatedAt }
  const iso = updatedAt.toISOString()
  const text = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(updatedAt)
  return { text, iso }
}

/**
 * @example
 * ```tsx
 * // pagina de cliente: so a data, fonte vai para o title (nao-visivel)
 * <PageDataFreshness updatedAt={new Date()} audience="external" source="painel_oficial" />
 *
 * // ferramenta interna: pode mostrar a fonte
 * <PageDataFreshness updatedAt={new Date()} audience="internal" source="painel_interno" />
 * ```
 */
export function PageDataFreshness({
  updatedAt,
  audience = 'external',
  source,
  label,
  locale = 'pt-BR',
  showIcon = true,
  className,
  ...props
}: PageDataFreshnessProps) {
  const { text, iso } = formatStamp(updatedAt, locale)
  const prefix = label ?? (audience === 'external' ? 'Dados oficiais' : undefined)
  const showSource = audience !== 'external' && !!source

  return (
    <p className={clsx('ds-data-freshness', className)} title={source || undefined} {...props}>
      {showIcon && <Clock className="ds-data-freshness__icon" size={13} aria-hidden="true" />}
      {prefix && (
        <>
          <span className="ds-data-freshness__prefix">{prefix}</span>
          <span className="ds-data-freshness__sep" aria-hidden="true">
            ·
          </span>
        </>
      )}
      <span className="ds-data-freshness__stamp">
        atualizado em <time dateTime={iso}>{text}</time>
      </span>
      {showSource && (
        <>
          <span className="ds-data-freshness__sep" aria-hidden="true">
            ·
          </span>
          <span className="ds-data-freshness__source">fonte: {source}</span>
        </>
      )}
    </p>
  )
}

export default PageDataFreshness
