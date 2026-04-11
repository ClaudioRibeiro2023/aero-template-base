// Repositórios por entidade
export { TaskRepository, type TaskCreate, type TaskUpdate } from './TaskRepository'
export { UserRepository } from './UserRepository'
export { RoleRepository } from './RoleRepository'
export { FeatureFlagRepository } from './FeatureFlagRepository'
export {
  SupportTicketRepository,
  type SupportTicket,
  type SupportTicketCreate,
  type SupportTicketUpdate,
} from './SupportTicketRepository'
export {
  QualityReportRepository,
  type QualityReport,
  type QualityReportCreate,
} from './QualityReportRepository'
export {
  NotificationRepository,
  type Notification,
  type NotificationCreate,
  type NotificationUpdate,
} from './NotificationRepository'
export { AuditLogRepository, type AuditLogCreate } from './AuditLogRepository'
export {
  OrganizationRepository,
  type Organization,
  type OrganizationCreate,
  type OrganizationUpdate,
} from './OrganizationRepository'
