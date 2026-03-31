import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { UserRole } from '@template/types'

interface GuardResult {
  user: { id: string; email: string; role: UserRole } | null
  error: string | null
}

export async function getAuthUser(): Promise<GuardResult> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c: { name: string; value: string; options?: Record<string, unknown> }[]) =>
          c.forEach(({ name, value, options }) => cookieStore.set(name, value, options as never)),
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return { user: null, error: 'Unauthorized' }

  // Get role from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return {
    user: {
      id: user.id,
      email: user.email ?? '',
      role: (profile?.role ?? 'VIEWER') as UserRole,
    },
    error: null,
  }
}

export async function requireAuth(): Promise<{ id: string; email: string; role: UserRole } | null> {
  const { user } = await getAuthUser()
  return user
}

export async function requireRole(
  roles: UserRole | UserRole[]
): Promise<{ id: string; email: string; role: UserRole } | null> {
  const { user } = await getAuthUser()
  if (!user) return null
  const allowed = Array.isArray(roles) ? roles : [roles]
  if (!allowed.includes(user.role)) return null
  return user
}
