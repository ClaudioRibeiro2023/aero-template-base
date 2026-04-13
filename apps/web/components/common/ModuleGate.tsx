'use client'

/**
 * ModuleGate — renderiza children apenas se o módulo estiver habilitado.
 *
 * Uso:
 * ```tsx
 * <ModuleGate moduleId="notifications">
 *   <NotificationCenter />
 * </ModuleGate>
 *
 * <ModuleGate moduleId="tasks" fallback={<p>Módulo desabilitado</p>}>
 *   <TaskList />
 * </ModuleGate>
 * ```
 */

import type { ReactNode } from 'react'
import { useModuleEnabled } from '@/lib/module-context'

interface ModuleGateProps {
  /** ID do módulo que deve estar habilitado */
  moduleId: string
  /** Conteúdo a renderizar quando o módulo está ativo */
  children: ReactNode
  /** Conteúdo alternativo quando o módulo está inativo (default: null) */
  fallback?: ReactNode
}

export function ModuleGate({ moduleId, children, fallback = null }: ModuleGateProps) {
  const enabled = useModuleEnabled(moduleId)
  return <>{enabled ? children : fallback}</>
}
