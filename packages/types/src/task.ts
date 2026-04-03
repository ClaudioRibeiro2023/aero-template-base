// ============================================================================
// Task Domain Types
// ============================================================================

/**
 * Task status values
 */
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'

/**
 * Task priority values
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

/**
 * Task entity
 */
export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignee_id: string | null
  created_by: string
  tenant_id: string | null
  created_at: string
  updated_at: string
}

/**
 * Filters for task listing
 */
export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  page?: number
  page_size?: number
}

/**
 * Paginated tasks response from API
 */
export interface TasksResponse {
  data: Task[]
  error: null
  meta: { page: number; page_size: number; total: number; pages: number }
}
