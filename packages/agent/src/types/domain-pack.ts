/**
 * Domain Pack — contrato de especialização por aplicação.
 *
 * O template é dono da INFRAESTRUTURA.
 * Cada aplicação é dona apenas do seu DOMAIN PACK.
 *
 * Um Domain Pack é configuração de domínio, não nova infraestrutura.
 */
import type { ToolDefinition } from './tool'

// ─── Identidade do domínio ────────────────────────────────────────────────────

export interface DomainIdentity {
  /** Identificador único do domínio (ex: 'financial', 'techdengue', 'rh') */
  id: string
  /** Versão do pack (semver) — permite rastreabilidade e rollback */
  version: string
  /** Nome legível do domínio */
  displayName: string
  /** Aplicação (ou aplicações) onde este pack é válido */
  appIds: string[]
}

// ─── Identidade do agente ─────────────────────────────────────────────────────

export interface AgentIdentity {
  /** Nome do agente nesta aplicação (ex: 'Aria', 'Consultor Financeiro') */
  name: string
  /** Descrição curta exibida na UI */
  description: string
  /** Avatar/ícone (URL ou string emoji) */
  avatar?: string
  /** Tom e estilo das respostas */
  tone: 'formal' | 'semiformal' | 'técnico' | 'amigável'
  /** Idioma principal */
  language: string
}

// ─── Prompt mestre ────────────────────────────────────────────────────────────

export interface SystemPromptConfig {
  /** Prompt mestre do sistema (instrução base do agente) */
  systemPrompt: string
  /** Glossário e ontologia do negócio (injetado no contexto) */
  glossary?: string
  /** Exemplos de perguntas e respostas esperadas (few-shot) */
  fewShotExamples?: Array<{ question: string; answer: string }>
  /** Regras de resposta específicas do domínio */
  responseRules?: string[]
  /** O que o agente deve recusar responder */
  outOfScope?: string[]
}

// ─── Entidades e dados ────────────────────────────────────────────────────────

export interface DomainEntity {
  /** Nome da entidade (ex: 'Medição', 'POI', 'Colaborador') */
  name: string
  /** Descrição funcional */
  description: string
  /** Campos relevantes para o agente */
  fields?: Array<{ name: string; description: string; type: string }>
  /** Métricas calculadas relacionadas */
  metrics?: string[]
}

// ─── Fontes autorizadas ───────────────────────────────────────────────────────

export interface AuthorizedSources {
  /** Tools internas autorizadas para este domínio */
  internalTools: string[]
  /** Fontes externas autorizadas (ex: 'fx_rate', 'public_health') */
  externalSources?: string[]
  /** Tipos de documento que podem ser indexados */
  documentTypes?: string[]
}

// ─── Regras de memória ────────────────────────────────────────────────────────

export interface MemoryRules {
  /** O que deve ser gravado na memória de sessão */
  sessionFacts?: string[]
  /** O que deve ser gravado na memória do usuário */
  userPreferences?: string[]
  /** O que pode ser gravado na memória do domínio (requer aprovação) */
  domainFacts?: string[]
  /** TTL padrão em segundos para entradas de sessão */
  sessionTtlSeconds?: number
}

// ─── Segurança ────────────────────────────────────────────────────────────────

export interface DomainSecurityConfig {
  /** Roles mínimas para usar o agente */
  minimumRole?: string
  /** Se dados sensíveis devem ser ofuscados nas respostas */
  maskSensitiveData?: boolean
  /** Campos que nunca devem aparecer em respostas */
  restrictedFields?: string[]
  /** Se o agente pode falar sobre dados de outros tenants */
  crossTenantAllowed?: boolean
}

// ─── Domain Pack completo ─────────────────────────────────────────────────────

export interface DomainPack {
  identity: DomainIdentity
  agent: AgentIdentity
  systemPrompt: SystemPromptConfig
  entities?: DomainEntity[]
  authorizedSources: AuthorizedSources
  memoryRules?: MemoryRules
  security?: DomainSecurityConfig
  /** Tools registradas por este pack (injetadas no ToolRegistry) */
  tools?: ToolDefinition[]
}

// ─── Registry de domain packs ────────────────────────────────────────────────

export interface IDomainPackRegistry {
  /** Registra um domain pack */
  register(pack: DomainPack): void
  /** Recupera o pack para um appId e tenantId específico */
  resolve(appId: string, tenantId?: string): DomainPack | null
  /** Lista todos os packs registrados */
  list(): DomainPack[]
}
