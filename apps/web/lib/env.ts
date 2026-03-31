/**
 * Environment variable accessor — Next.js compatible.
 *
 * Reads from process.env.NEXT_PUBLIC_* for client-side
 * and process.env.* for server-side variables.
 */

function getEnv(key: string): string {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) return process.env[key] as string
  }
  return ''
}

export const env = {
  SUPABASE_URL: getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  API_URL: getEnv('NEXT_PUBLIC_API_URL') || '/api',
  APP_NAME: getEnv('NEXT_PUBLIC_APP_NAME') || 'Template Platform',
  APP_VERSION: getEnv('NEXT_PUBLIC_APP_VERSION') || '1.0.0',
  AUTH_PROVIDER: getEnv('NEXT_PUBLIC_AUTH_PROVIDER') || 'supabase',
  CDN_ENABLED: getEnv('NEXT_PUBLIC_CDN_ENABLED') === 'true',
  CDN_URL: getEnv('NEXT_PUBLIC_CDN_URL') || '',
  DEMO_MODE: getEnv('NEXT_PUBLIC_DEMO_MODE') === 'true',
  SENTRY_DSN: getEnv('NEXT_PUBLIC_SENTRY_DSN') || '',
  WS_URL: getEnv('NEXT_PUBLIC_WS_URL') || '',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
}
