// --- Error & Health ---
export { useErrorHandler } from './useErrorHandler'
export type { ErrorState, UseErrorHandlerOptions } from './useErrorHandler'
export { useHealthCheck } from './useHealthCheck'
export type { HealthStatus, UseHealthCheckOptions } from './useHealthCheck'

// --- Navigation ---
export { useNavigationConfig } from './useNavigationConfig'
export { useNavigationExport } from './useNavigationExport'

// --- Filters & Forms ---
export { useFilters } from './useFilters'
export type { FilterValue, ActiveFilter, UseFiltersReturn } from './useFilters'
export { useFormDirty } from './useFormDirty'

// --- Auth & Permissions ---
export { usePermissions } from './usePermissions'

// --- A11y ---
export {
  useAnnouncer,
  useFocusTrap,
  useKeyboardNavigation,
  useId,
  useAriaDescribedBy,
  useReducedMotion,
  useHighContrast,
  relativeLuminance,
  contrastRatio,
  meetsContrastRequirement,
  hexToRgb,
} from './useA11y'
export type {
  AriaLive,
  AriaRole,
  UseAnnouncerOptions,
  UseKeyboardNavigationOptions,
  FocusTrapOptions,
} from './useA11y'

// --- Data hooks ---
export { useAuditLogs, auditLogKeys } from './useAuditLogs'
export {
  useFeatureFlags,
  useCreateFeatureFlag,
  useUpdateFeatureFlag,
  useDeleteFeatureFlag,
} from './useFeatureFlagsAdmin'
export { useFileList, useFileUpload, useFileDelete } from './useFileUpload'
export {
  useOptimizedImage,
  useWebPSupport,
  useLazyLoad,
  checkWebPSupport,
  generateSrcSet,
  generateSizes,
  generatePlaceholder,
} from './useImageOptimization'
export type {
  ImageSource,
  OptimizedImageProps,
  UseImageOptimizationOptions,
  ResponsiveBreakpoint,
  UseOptimizedImageResult,
} from './useImageOptimization'
export { useNotifications } from './useNotifications'

// --- Performance ---
export {
  useWebVitals,
  usePrefetchQuery,
  useIntersectionPrefetch,
  useDebounce,
  useThrottle,
  useMeasureRender,
} from './usePerformance'
export type { WebVitalsMetric, PrefetchOptions } from './usePerformance'

// --- Platform ---
export { usePlatformBranding } from './usePlatformBranding'
export {
  usePlatformConfig,
  useAdminPlatformConfig,
  useIsSetupComplete,
  savePlatformConfigCache,
  loadPlatformConfigCache,
  clearPlatformConfigCache,
  applyBrandingToCss,
  applyDocumentMeta,
  PLATFORM_CONFIG_KEYS,
} from './usePlatformConfig'

// --- CRUD hooks ---
export { useRoles, useRole, useCreateRole, useUpdateRole, useDeleteRole } from './useRoles'
export {
  useTasks,
  useTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  taskKeys,
} from './useTasks'
export {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  userKeys,
} from './useUsers'

// --- WebSocket ---
export { useWebSocket } from './useWebSocket'
export type {
  WSMessageType,
  WSMessage,
  WSStatus,
  UseWebSocketOptions,
  UseWebSocketReturn,
} from './useWebSocket'
