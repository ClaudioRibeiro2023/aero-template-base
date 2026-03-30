/**
 * Environment variable accessor — compatible with both Next.js and Vite.
 *
 * In Next.js: reads from process.env.NEXT_PUBLIC_*
 * In Vite: reads from import.meta.env.VITE_*
 * Provides unified access regardless of bundler.
 */

function getEnv(key: string): string {
  // Next.js (server + client with NEXT_PUBLIC_ prefix)
  if (typeof process !== 'undefined' && process.env) {
    const nextKey = key.replace('VITE_', 'NEXT_PUBLIC_')
    if (process.env[nextKey]) return process.env[nextKey] as string
    if (process.env[key]) return process.env[key] as string
  }
  return ''
}

export const env = {
  SUPABASE_URL: getEnv('VITE_SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  API_URL: getEnv('VITE_API_URL') || getEnv('NEXT_PUBLIC_API_URL') || '',
  APP_NAME: getEnv('VITE_APP_NAME') || getEnv('NEXT_PUBLIC_APP_NAME') || 'Template Platform',
  APP_VERSION: getEnv('VITE_APP_VERSION') || getEnv('NEXT_PUBLIC_APP_VERSION') || '1.0.0',
  AUTH_PROVIDER: getEnv('VITE_AUTH_PROVIDER') || getEnv('NEXT_PUBLIC_AUTH_PROVIDER') || 'supabase',
  CDN_ENABLED: getEnv('VITE_CDN_ENABLED') === 'true',
  CDN_URL: getEnv('VITE_CDN_URL') || '',
  DEMO_MODE: getEnv('VITE_DEMO_MODE') === 'true' || getEnv('NEXT_PUBLIC_DEMO_MODE') === 'true',
  SENTRY_DSN: getEnv('VITE_SENTRY_DSN') || getEnv('NEXT_PUBLIC_SENTRY_DSN') || '',
  WS_URL: getEnv('VITE_WS_URL') || getEnv('NEXT_PUBLIC_WS_URL') || 'ws://localhost:8000',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
}
