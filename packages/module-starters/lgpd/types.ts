// LGPD Module Types — placeholder mínimo.

export type ConsentStatus = 'granted' | 'revoked' | 'pending'

export type DataSubjectRequestType =
  | 'access'
  | 'correction'
  | 'deletion'
  | 'portability'
  | 'revocation'

export interface ConsentRecord {
  id: string
  userId: string
  purpose: string
  status: ConsentStatus
  grantedAt?: string
  revokedAt?: string
}

export interface DataSubjectRequest {
  id: string
  userId: string
  type: DataSubjectRequestType
  status: 'open' | 'in_progress' | 'completed' | 'rejected'
  requestedAt: string
  resolvedAt?: string
  notes?: string
}
