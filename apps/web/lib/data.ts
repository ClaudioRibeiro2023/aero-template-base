/**
 * Data Layer Factory — Ponto único de acesso a repositórios e auth gateway.
 *
 * Este é o ÚNICO arquivo em apps/web que conhece o provider de dados ativo.
 * Para trocar de Supabase para Prisma/Drizzle, basta alterar este arquivo.
 *
 * Uso em API routes:
 *   import { getRepository, getAuthGateway } from '@/lib/data'
 *   const tasks = getRepository('tasks')
 *   const auth = getAuthGateway()
 */
import { SupabaseDbClient, SupabaseAuthGateway } from '@template/data/supabase'
import {
  TaskRepository,
  UserRepository,
  RoleRepository,
  FeatureFlagRepository,
  SupportTicketRepository,
  QualityReportRepository,
  NotificationRepository,
  AuditLogRepository,
  OrganizationRepository,
} from '@template/data'
import type { IAuthGateway } from '@template/data'

// ── Singleton do DbClient ──
const dbClient = new SupabaseDbClient()

// ── Mapa de repositórios ──
const repositories = {
  tasks: () => new TaskRepository(dbClient),
  users: () => new UserRepository(dbClient),
  roles: () => new RoleRepository(dbClient),
  featureFlags: () => new FeatureFlagRepository(dbClient),
  tickets: () => new SupportTicketRepository(dbClient),
  qualityReports: () => new QualityReportRepository(dbClient),
  notifications: () => new NotificationRepository(dbClient),
  auditLogs: () => new AuditLogRepository(dbClient),
  organizations: () => new OrganizationRepository(dbClient),
} as const

type RepositoryName = keyof typeof repositories

// ── Overloads tipados ──
export function getRepository(name: 'tasks'): TaskRepository
export function getRepository(name: 'users'): UserRepository
export function getRepository(name: 'roles'): RoleRepository
export function getRepository(name: 'featureFlags'): FeatureFlagRepository
export function getRepository(name: 'tickets'): SupportTicketRepository
export function getRepository(name: 'qualityReports'): QualityReportRepository
export function getRepository(name: 'notifications'): NotificationRepository
export function getRepository(name: 'auditLogs'): AuditLogRepository
export function getRepository(name: 'organizations'): OrganizationRepository
export function getRepository(name: RepositoryName) {
  const factory = repositories[name]
  if (!factory) throw new Error(`Repositório desconhecido: ${name}`)
  return factory()
}

// ── Auth Gateway ──
export function getAuthGateway(): IAuthGateway {
  return new SupabaseAuthGateway()
}
