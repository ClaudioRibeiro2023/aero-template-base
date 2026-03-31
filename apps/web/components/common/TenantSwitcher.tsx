/**
 * TenantSwitcher — Sprint 27
 * Allows the current user to switch between accessible tenants.
 * Persists the selected tenant_id to localStorage and updates context.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

export interface Tenant {
  id: string
  name: string
  slug: string
  logoUrl?: string | null
}

// ============================================================================
// Persistence helpers
// ============================================================================

const STORAGE_KEY = 'selected_tenant_id'

export function getStoredTenantId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredTenantId(tenantId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, tenantId)
  } catch {
    // ignore quota / private browsing
  }
}

export function clearStoredTenantId(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

// ============================================================================
// useTenantSwitcher hook
// ============================================================================

export interface UseTenantSwitcherOptions {
  tenants: Tenant[]
  initialTenantId?: string | null
  onSwitch?: (tenant: Tenant) => void
}

export interface UseTenantSwitcherReturn {
  current: Tenant | null
  switchTo: (tenantId: string) => void
}

export function useTenantSwitcher({
  tenants,
  initialTenantId,
  onSwitch,
}: UseTenantSwitcherOptions): UseTenantSwitcherReturn {
  const resolveInitial = (): Tenant | null => {
    const stored = initialTenantId ?? getStoredTenantId()
    return tenants.find(t => t.id === stored) ?? tenants[0] ?? null
  }

  const [current, setCurrent] = useState<Tenant | null>(resolveInitial)

  // Persist on mount
  useEffect(() => {
    if (current) setStoredTenantId(current.id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const switchTo = useCallback(
    (tenantId: string) => {
      const tenant = tenants.find(t => t.id === tenantId)
      if (!tenant || tenant.id === current?.id) return
      setCurrent(tenant)
      setStoredTenantId(tenantId)
      onSwitch?.(tenant)
    },
    [tenants, current, onSwitch]
  )

  return { current, switchTo }
}

// ============================================================================
// TenantSwitcher component
// ============================================================================

export interface TenantSwitcherProps {
  tenants: Tenant[]
  currentTenantId?: string | null
  onSwitch: (tenant: Tenant) => void
  className?: string
}

export function TenantSwitcher({
  tenants,
  currentTenantId,
  onSwitch,
  className = '',
}: TenantSwitcherProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = tenants.find(t => t.id === currentTenantId) ?? tenants[0] ?? null

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (tenants.length === 0) return null
  if (tenants.length === 1) {
    return (
      <div
        className={`flex items-center gap-2 text-sm font-medium ${className}`}
        data-testid="tenant-switcher-single"
      >
        {current?.logoUrl && (
          <img src={current.logoUrl} alt="" className="h-5 w-5 rounded-sm object-contain" />
        )}
        <span>{current?.name}</span>
      </div>
    )
  }

  return (
    <div ref={ref} className={`relative ${className}`} data-testid="tenant-switcher">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Selecionar tenant"
        className="flex items-center gap-2 rounded-[var(--radius-md)] border border-white/[0.06] bg-[var(--glass-bg)] px-3 py-1.5 text-sm font-medium shadow-[var(--shadow-sm)] hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] backdrop-blur-xl"
      >
        {current?.logoUrl && (
          <img src={current.logoUrl} alt="" className="h-4 w-4 rounded-sm object-contain" />
        )}
        <span className="max-w-[140px] truncate">{current?.name ?? 'Selecionar...'}</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Tenants disponíveis"
          className="absolute left-0 top-full z-50 mt-1 min-w-full overflow-hidden rounded-[var(--radius-md)] border border-white/[0.06] bg-[var(--glass-bg)] backdrop-blur-xl shadow-[var(--shadow-lg)]"
        >
          {tenants.map(tenant => {
            const isSelected = tenant.id === current?.id
            return (
              <li key={tenant.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onSwitch(tenant)
                    setOpen(false)
                  }}
                  className={[
                    'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-white/[0.04]',
                    isSelected ? 'font-semibold text-brand-primary' : 'text-text-secondary',
                  ].join(' ')}
                >
                  {tenant.logoUrl && (
                    <img
                      src={tenant.logoUrl}
                      alt=""
                      className="h-4 w-4 rounded-sm object-contain"
                    />
                  )}
                  <span className="flex-1 truncate text-left">{tenant.name}</span>
                  {isSelected && (
                    <svg
                      className="h-4 w-4 shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
