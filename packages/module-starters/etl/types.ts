// ETL Module Types

export type DataSourceType = 'csv' | 'json' | 'shapefile' | 'api' | 'database'

export type ImportStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface DataSource {
  id: string
  name: string
  type: DataSourceType
  description?: string
  config: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface ImportJob {
  id: string
  sourceId: string
  sourceName: string
  type: DataSourceType
  status: ImportStatus
  progress: number
  recordsTotal?: number
  recordsProcessed?: number
  recordsSuccess?: number
  recordsError?: number
  startedAt?: string
  completedAt?: string
  errorMessage?: string
  logs: ImportLogEntry[]
}

export interface ImportLogEntry {
  timestamp: string
  level: 'info' | 'warning' | 'error'
  message: string
  details?: Record<string, unknown>
}

export interface DataCatalogItem {
  id: string
  name: string
  description: string
  type: 'table' | 'view' | 'file' | 'api'
  schema: DataSchemaField[]
  tags: string[]
  owner: string
  lastUpdated: string
  recordCount?: number
  size?: string
}

export interface DataSchemaField {
  name: string
  type: string
  nullable: boolean
  description?: string
  example?: string
}

export interface DataQualityReport {
  id: string
  targetId: string
  targetName: string
  executedAt: string
  status: 'passed' | 'warning' | 'failed'
  metrics: DataQualityMetric[]
  issues: DataQualityIssue[]
}

export interface DataQualityMetric {
  name: string
  description: string
  value: number
  threshold: number
  status: 'passed' | 'warning' | 'failed'
}

export interface DataQualityIssue {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  field?: string
  description: string
  affectedRecords: number
  suggestedFix?: string
}

export interface ETLFilter {
  search?: string
  type?: DataSourceType | 'all'
  status?: ImportStatus | 'all'
  dateFrom?: string
  dateTo?: string
}
