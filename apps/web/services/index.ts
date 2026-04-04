// --- Admin Config ---
export {
  adminConfigService,
  mergeConfig,
  validateBranding,
  validateTheme,
  validateNavigationItem,
  reorderNavigation,
  toggleNavigationItem,
  addNavigationItem,
  removeNavigationItem,
  DEFAULT_BRANDING,
  DEFAULT_THEME,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_CONFIG,
} from './adminConfig'
export type {
  BrandingConfig,
  ThemeConfig,
  NavigationItem,
  NotificationConfig,
  PlatformConfig,
  WebhookConfig,
  ApiKeyConfig,
  PartialPlatformConfig,
} from './adminConfig'

// --- Audit Logs ---
export { auditLogsService } from './auditLogs'

// --- Feature Flags ---
export { featureFlagsService } from './featureFlags'

// --- File Upload ---
export { fileUploadService } from './fileUpload'
export type { FileMetadata, UploadOptions, ListFilesParams } from './fileUpload'

// --- Roles ---
export { rolesService } from './roles'

// --- Tasks ---
export { tasksService } from './tasks'

// --- Users ---
export { usersService } from './users'
