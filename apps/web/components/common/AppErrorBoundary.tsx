'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AppErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
          <div className="glass-panel p-8 max-w-md text-center space-y-4">
            <div className="p-3 rounded-2xl bg-rose-500/10 inline-flex">
              <AlertTriangle size={28} className="text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Algo deu errado</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {this.state.error?.message || 'Ocorreu um erro inesperado.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={14} />
              Tentar novamente
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
