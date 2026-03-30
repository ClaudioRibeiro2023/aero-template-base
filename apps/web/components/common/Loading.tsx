'use client'

interface LoadingProps {
  /** Size of the spinner: sm (16px), md (32px), lg (48px) */
  size?: 'sm' | 'md' | 'lg'
  /** Text to display below spinner */
  text?: string
  /** Whether to center in full screen */
  fullScreen?: boolean
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-12 h-12 border-4',
}

export function Loading({ size = 'md', text, fullScreen = false }: LoadingProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeMap[size]} border-brand-primary border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="text-text-secondary text-sm">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface-base/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    )
  }

  return <div className="flex items-center justify-center py-8">{spinner}</div>
}

/**
 * Page-level loading component for Suspense fallback
 */
export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-text-secondary">Carregando...</p>
      </div>
    </div>
  )
}
