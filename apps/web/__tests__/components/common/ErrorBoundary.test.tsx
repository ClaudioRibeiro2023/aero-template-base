/**
 * Testes para o componente ErrorBoundary
 *
 * Cobre: renderização normal dos filhos, captura de erros com UI de fallback,
 * uso de fallback customizado, botões de recarregar/início e integração com
 * o design-system (Alert no modo dev).
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('@template/design-system', () => ({
  Alert: ({
    children,
    title,
  }: {
    children?: React.ReactNode
    title?: string
    variant?: string
    className?: string
  }) => (
    <div data-testid="ds-alert" data-title={title}>
      {children}
    </div>
  ),
}))

// Mock da lib/env para controlar o modo dev
vi.mock('@/lib/env', () => ({
  env: {
    isDev: false,
    API_URL: '',
  },
}))

// Suprimir console.error do React durante testes de ErrorBoundary
const originalError = console.error
beforeEach(() => {
  console.error = vi.fn()
})
afterEach(() => {
  console.error = originalError
})

// ── Componente auxiliar que lança erro ────────────────────────────────────────

function BomponentQueExplode({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Erro de teste para o ErrorBoundary')
  }
  return <div data-testid="children-ok">Conteúdo normal</div>
}

// ── Testes ────────────────────────────────────────────────────────────────────

describe('ErrorBoundary', () => {
  describe('renderização sem erro', () => {
    it('renderiza os children quando não há erro', () => {
      render(
        <ErrorBoundary>
          <BomponentQueExplode shouldThrow={false} />
        </ErrorBoundary>
      )
      expect(screen.getByTestId('children-ok')).toBeInTheDocument()
      expect(screen.getByText('Conteúdo normal')).toBeInTheDocument()
    })

    it('NÃO exibe a UI de erro quando não há exceção', () => {
      render(
        <ErrorBoundary>
          <BomponentQueExplode shouldThrow={false} />
        </ErrorBoundary>
      )
      expect(screen.queryByText('Ops! Algo deu errado')).not.toBeInTheDocument()
    })

    it('renderiza múltiplos filhos corretamente', () => {
      render(
        <ErrorBoundary>
          <span data-testid="filho-1">Filho 1</span>
          <span data-testid="filho-2">Filho 2</span>
        </ErrorBoundary>
      )
      expect(screen.getByTestId('filho-1')).toBeInTheDocument()
      expect(screen.getByTestId('filho-2')).toBeInTheDocument()
    })
  })

  describe('captura de erros — UI padrão', () => {
    it('exibe título de erro quando filho lança exceção', () => {
      render(
        <ErrorBoundary>
          <BomponentQueExplode shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(screen.getByText('Ops! Algo deu errado')).toBeInTheDocument()
    })

    it('exibe mensagem de instrução ao usuário', () => {
      render(
        <ErrorBoundary>
          <BomponentQueExplode shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(
        screen.getByText(/Ocorreu um erro inesperado. Por favor, tente recarregar a página./i)
      ).toBeInTheDocument()
    })

    it('exibe o botão de recarregar página', () => {
      render(
        <ErrorBoundary>
          <BomponentQueExplode shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(screen.getByText('Recarregar')).toBeInTheDocument()
    })

    it('exibe o botão de ir para o início', () => {
      render(
        <ErrorBoundary>
          <BomponentQueExplode shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(screen.getByText('Início')).toBeInTheDocument()
    })

    it('NÃO renderiza os children após capturar o erro', () => {
      render(
        <ErrorBoundary>
          <BomponentQueExplode shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(screen.queryByTestId('children-ok')).not.toBeInTheDocument()
    })
  })

  describe('fallback customizado', () => {
    it('usa o fallback prop quando fornecido e há erro', () => {
      render(
        <ErrorBoundary fallback={<div data-testid="fallback-custom">Fallback personalizado</div>}>
          <BomponentQueExplode shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(screen.getByTestId('fallback-custom')).toBeInTheDocument()
      expect(screen.getByText('Fallback personalizado')).toBeInTheDocument()
    })

    it('NÃO usa o fallback prop quando não há erro', () => {
      render(
        <ErrorBoundary fallback={<div data-testid="fallback-custom">Fallback personalizado</div>}>
          <BomponentQueExplode shouldThrow={false} />
        </ErrorBoundary>
      )
      expect(screen.queryByTestId('fallback-custom')).not.toBeInTheDocument()
    })

    it('NÃO exibe a UI padrão quando fallback customizado é usado', () => {
      render(
        <ErrorBoundary fallback={<div>Meu fallback</div>}>
          <BomponentQueExplode shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(screen.queryByText('Ops! Algo deu errado')).not.toBeInTheDocument()
    })
  })
})
