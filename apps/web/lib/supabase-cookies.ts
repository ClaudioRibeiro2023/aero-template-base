import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a cookie-based Supabase client for API routes.
 * Uses the anon key + cookie auth (respects RLS per-user).
 *
 * Centralizes the `as never` cast required by Next.js cookie typing
 * so no route needs to repeat it.
 */
export function createSupabaseCookieClient() {
  const cookieStore = cookies() as unknown as Awaited<ReturnType<typeof cookies>>
  return createServerClient(
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
}
