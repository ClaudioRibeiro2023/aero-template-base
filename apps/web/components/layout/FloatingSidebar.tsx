'use client'

import type { ReactNode } from 'react'

export interface FloatingSidebarProps {
  collapsed?: boolean
  children: ReactNode
  className?: string
}

/**
 * FloatingSidebar — container de ilhas flutuantes (280/64px).
 * Design validado 2026-04-22 (Proposta C — Floating Islands).
 *
 * Envolve qualquer conteúdo de navegação (AppSidebar existente, ou módulos
 * customizados). O conteúdo interno deve usar a classe `fs-isle` para formar
 * ilhas individuais com fundo glass e bordas arredondadas.
 */
export function FloatingSidebar({ collapsed = false, children, className }: FloatingSidebarProps) {
  return (
    <aside
      className={`floating-sidebar${className ? ` ${className}` : ''}`}
      data-collapsed={collapsed ? 'true' : 'false'}
      aria-label="Navegação principal"
    >
      {children}
    </aside>
  )
}

/** Ilha individual — usar como wrapper para agrupar sections */
export function SidebarIsle({
  children,
  className,
  variant = 'main',
}: {
  children: ReactNode
  className?: string
  variant?: 'main' | 'footer'
}) {
  return (
    <div
      className={`fs-isle ${variant === 'main' ? 'fs-isle-main' : 'fs-isle-footer'}${
        className ? ` ${className}` : ''
      }`}
    >
      {children}
    </div>
  )
}
