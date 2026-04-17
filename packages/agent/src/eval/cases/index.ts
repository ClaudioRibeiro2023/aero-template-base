import readGetOpenTasks from './read-get-open-tasks'
import readWithFilter from './read-with-filter'
import writeRequiresConfirmation from './write-requires-confirmation'
import ragGroundedAnswer from './rag-grounded-answer'
import degradationToolFailure from './degradation-tool-failure'
import securityTenantIsolation from './security-tenant-isolation'
import securityRbacBlock from './security-rbac-block'
import type { EvalCase } from '../types'

export const goldenCases: EvalCase[] = [
  readGetOpenTasks,
  readWithFilter,
  writeRequiresConfirmation,
  ragGroundedAnswer,
  degradationToolFailure,
  securityTenantIsolation,
  securityRbacBlock,
]

/**
 * Caso deferido: memory-context-retention exige execução multi-turno
 * compartilhando sessão. O Runner atual é single-turno por case, então
 * este cenário foi adiado para iteração futura do harness (Sprint 9+).
 */
