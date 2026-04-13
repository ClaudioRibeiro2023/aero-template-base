/**
 * Module Context Tests
 *
 * Testa ModuleProvider, useModuleEnabled e useEnabledModules.
 * Verifica integração build-time + runtime feature flags.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ModuleProvider, useModuleEnabled, useEnabledModules } from '../module-context'

// ── Helper: componente que expõe o resultado do hook ──
function TestModuleEnabled({ moduleId }: { moduleId: string }) {
  const enabled = useModuleEnabled(moduleId)
  return <div data-testid="result">{String(enabled)}</div>
}

function TestEnabledModules() {
  const modules = useEnabledModules()
  return <div data-testid="modules">{Array.from(modules).join(',')}</div>
}

describe('ModuleProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renderiza children', () => {
    render(
      <ModuleProvider enabledModules={['auth']}>
        <span data-testid="child">Hello</span>
      </ModuleProvider>
    )
    expect(screen.getByTestId('child')).toHaveTextContent('Hello')
  })

  it('useModuleEnabled retorna true para modulo habilitado', () => {
    render(
      <ModuleProvider enabledModules={['auth', 'dashboard', 'tasks']}>
        <TestModuleEnabled moduleId="tasks" />
      </ModuleProvider>
    )
    expect(screen.getByTestId('result')).toHaveTextContent('true')
  })

  it('useModuleEnabled retorna false para modulo ausente', () => {
    render(
      <ModuleProvider enabledModules={['auth', 'dashboard']}>
        <TestModuleEnabled moduleId="support" />
      </ModuleProvider>
    )
    expect(screen.getByTestId('result')).toHaveTextContent('false')
  })

  it('useEnabledModules retorna Set correto', () => {
    render(
      <ModuleProvider enabledModules={['auth', 'tasks']}>
        <TestEnabledModules />
      </ModuleProvider>
    )
    expect(screen.getByTestId('modules')).toHaveTextContent('auth,tasks')
  })

  it('useModuleEnabled com lista vazia retorna false', () => {
    render(
      <ModuleProvider enabledModules={[]}>
        <TestModuleEnabled moduleId="auth" />
      </ModuleProvider>
    )
    expect(screen.getByTestId('result')).toHaveTextContent('false')
  })
})

describe('useModuleEnabled — fallback sem provider', () => {
  it('retorna true quando fora do ModuleProvider', () => {
    // Sem ModuleProvider, o fallback isEnabled retorna true
    render(<TestModuleEnabled moduleId="anything" />)
    expect(screen.getByTestId('result')).toHaveTextContent('true')
  })
})
