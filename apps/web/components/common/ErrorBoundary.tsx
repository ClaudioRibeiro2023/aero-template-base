import { env } from '@/lib/env'
import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Alert } from '@template/design-system'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-root)] p-4">
          <div className="max-w-md w-full bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl shadow-[var(--shadow-lg)] p-8 border border-white/[0.06]">
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-[var(--accent-rose)]/10 flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-[var(--accent-rose)]" />
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-text-primary mb-2">Ops! Algo deu errado</h1>

              {/* Description */}
              <p className="text-text-secondary mb-6">
                Ocorreu um erro inesperado. Por favor, tente recarregar a página.
              </p>

              {/* Error details (dev only) */}
              {env.isDev && this.state.error && (
                <Alert
                  variant="error"
                  title={this.state.error.message}
                  className="w-full mb-6 text-left"
                >
                  {this.state.errorInfo?.componentStack && (
                    <pre className="mt-2 text-xs font-mono overflow-auto max-h-32 p-3 rounded-[var(--radius-md)] bg-[var(--glass-bg)] border border-white/[0.06]">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </Alert>
              )}

              {/* Actions */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--glass-bg)] border border-white/[0.06] text-[var(--text-primary)] rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  <Home size={18} />
                  Início
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
                >
                  <RefreshCw size={18} />
                  Recarregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
