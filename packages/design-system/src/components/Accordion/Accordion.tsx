import { useState, useId, type ReactNode, type HTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import './Accordion.css'

export interface AccordionItemData {
  /** Valor único */
  value: string
  /** Título */
  title: ReactNode
  /** Conteúdo */
  content: ReactNode
  /** Desabilitado */
  disabled?: boolean
}

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Itens do accordion */
  items: AccordionItemData[]
  /** Permitir múltiplos abertos */
  multiple?: boolean
  /** Valores abertos (controlado) */
  value?: string[]
  /** Valor padrão aberto (não-controlado) */
  defaultValue?: string[]
  /** Callback ao mudar */
  onChange?: (value: string[]) => void
}

export function Accordion({
  items,
  multiple = false,
  value: controlledValue,
  defaultValue = [],
  onChange,
  className,
  ...props
}: AccordionProps) {
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue)
  const isControlled = controlledValue !== undefined
  const openItems = isControlled ? controlledValue : internalValue

  const toggle = (itemValue: string) => {
    let next: string[]
    if (openItems.includes(itemValue)) {
      next = openItems.filter(v => v !== itemValue)
    } else {
      next = multiple ? [...openItems, itemValue] : [itemValue]
    }
    if (!isControlled) setInternalValue(next)
    onChange?.(next)
  }

  return (
    <div className={clsx('ds-accordion', className)} {...props}>
      {items.map(item => (
        <AccordionItem
          key={item.value}
          item={item}
          isOpen={openItems.includes(item.value)}
          onToggle={() => !item.disabled && toggle(item.value)}
        />
      ))}
    </div>
  )
}

interface AccordionItemComponentProps {
  item: AccordionItemData
  isOpen: boolean
  onToggle: () => void
}

function AccordionItem({ item, isOpen, onToggle }: AccordionItemComponentProps) {
  const id = useId()
  const triggerId = `accordion-trigger-${id}`
  const panelId = `accordion-panel-${id}`

  return (
    <div className="ds-accordion__item">
      <button
        type="button"
        id={triggerId}
        className="ds-accordion__trigger"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        disabled={item.disabled}
      >
        <span>{item.title}</span>
        <ChevronDown
          size={16}
          className={clsx('ds-accordion__icon', isOpen && 'ds-accordion__icon--open')}
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className={clsx(
          'ds-accordion__content',
          isOpen ? 'ds-accordion__content--open' : 'ds-accordion__content--closed'
        )}
      >
        <div className="ds-accordion__body">{item.content}</div>
      </div>
    </div>
  )
}

export default Accordion
