/**
 * Zod Validation Schemas — @template/shared/schemas
 * Schemas compartilhados entre apps e packages.
 */

// Auth schemas
export {
  SignupSchema,
  LoginSchema,
  ResetPasswordSchema,
  UpdatePasswordSchema,
  type SignupInput,
  type LoginInput,
  type ResetPasswordInput,
  type UpdatePasswordInput,
} from './auth'

// Admin schemas
export {
  UpdateBrandingSchema,
  UpdateThemeSchema,
  UpdateConfigSchema,
  type UpdateConfigInput,
} from './admin'

// Task schemas
export {
  TaskStatusEnum,
  TaskPriorityEnum,
  taskCreateSchema,
  taskUpdateSchema,
  type TaskCreateFormValues,
  type TaskUpdateFormValues,
} from './task'

// User schemas
export {
  UserRoleEnum,
  userCreateSchema,
  userUpdateSchema,
  type UserCreateFormValues,
  type UserUpdateFormValues,
} from './user'

// Role schemas
export {
  roleCreateSchema,
  roleUpdateSchema,
  type RoleCreateFormValues,
  type RoleUpdateFormValues,
} from './role'

// Feature flag schemas
export {
  featureFlagCreateSchema,
  featureFlagUpdateSchema,
  type FeatureFlagCreateFormValues,
  type FeatureFlagUpdateFormValues,
} from './feature-flag'
