export interface CheckResult {
  name: string
  status: 'pass' | 'warn' | 'fail'
  score: number
  details?: string
  recommendation?: string
}

export interface CategoryResult {
  category: string
  score: number
  checks: CheckResult[]
}

export interface DiagnosticReport {
  overall_score: number
  results: Record<string, CategoryResult>
  timestamp: string
}
