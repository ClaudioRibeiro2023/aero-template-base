// --- Design Tokens ---
export { tokens } from './design-tokens'
export type { DesignTokens } from './design-tokens'

// --- API ---
export { validateApiRequest } from './api-guard'
export {
  ok,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  tooManyRequests,
  serverError,
} from './api-response'
export { fetchJson, fetchJsonRaw } from './fetch-json'

// --- Auth ---
export { getAuthUser, requireAuth, requireRole } from './auth-guard'

// --- Audit ---
export { auditLog } from './audit-log'
export type { AuditEntry } from './audit-log'

// --- Permissions ---
export {
  hasPermission,
  hasPermissionMultiRole,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionsForRole,
  getPermissionsForRoles,
} from './permissions'
export type { Permission, Resource, Action } from './permissions'

// --- CDN ---
export {
  getCDNUrl,
  getCDNImageUrl,
  generateCacheControl,
  preloadAsset,
  prefetchAsset,
  preconnectToCDN,
  getCacheStrategy,
  CACHE_PRESETS,
  CACHE_STRATEGIES,
  cdn,
} from './cdn'
export type { CDNAsset, CacheConfig } from './cdn'

// --- Environment ---
export { env } from './env'

// --- Rate Limiting ---
export { rateLimit, getClientIp } from './rate-limit'

// --- Validation ---
export * from './validate'

// --- Supabase ---
export { createSupabaseBrowserClient } from './supabase-browser'
// @deprecated: createSupabaseCookieClient removido no Sprint 7.
// Use: new SupabaseDbClient().asUser() de @template/data/supabase

// --- PWA ---
export {
  pwaManifest,
  vitePwaConfig,
  isPWA,
  canInstallPWA,
  registerServiceWorker,
  checkForUpdates,
  forceUpdate,
} from './pwa'
export type { PWAInstallState } from './pwa'
