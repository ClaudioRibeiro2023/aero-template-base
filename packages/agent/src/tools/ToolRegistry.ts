/**
 * Tool Registry — registra, valida, autoriza e executa tools do agente.
 *
 * Responsabilidades:
 * - Registro tipado de tools por appId
 * - Verificação de autorização antes de qualquer execução
 * - Log auditável de cada execução
 * - Schema de entrada validado via Zod
 * - Retorno padronizado (ToolResult)
 */
import { z } from 'zod'
import { randomUUID } from 'crypto'
import type {
  ToolDefinition,
  ToolExecutionContext,
  ToolResult,
  ToolExecutionLog,
} from '../types/tool'
import type { GatewayToolDefinition } from '../types/gateway'

export class ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition>()
  private readonly logs: ToolExecutionLog[] = [] // in-memory; em prod → Supabase
  private _onLogWritten?: (log: ToolExecutionLog) => void

  /** Registra uma tool no registry */
  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      console.warn(`[ToolRegistry] Tool "${tool.name}" já registrada — sobrescrevendo`)
    }
    this.tools.set(tool.name, tool)
  }

  /** Registra múltiplas tools de uma vez */
  registerAll(tools: ToolDefinition[]): void {
    for (const tool of tools) this.register(tool)
  }

  /** Retorna a definição de uma tool pelo nome */
  getDefinition(toolName: string): ToolDefinition | undefined {
    return this.tools.get(toolName)
  }

  /** Configura callback invocado após cada writeLog (para persistência externa) */
  onLogWritten(callback: (log: ToolExecutionLog) => void): void {
    this._onLogWritten = callback
  }

  /** Retorna as definições de tools disponíveis para um contexto */
  getAvailableTools(context: ToolExecutionContext): GatewayToolDefinition[] {
    const available: GatewayToolDefinition[] = []

    for (const tool of this.tools.values()) {
      if (!this.isAuthorized(tool, context)) continue

      available.push({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: zodToJsonSchema(tool.inputSchema),
          strict: false,
        },
      })
    }

    return available
  }

  /** Executa uma tool por nome com validação e log */
  async execute(
    toolName: string,
    rawInput: unknown,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    const start = Date.now()
    const logId = randomUUID()

    const tool = this.tools.get(toolName)
    if (!tool) {
      return { success: false, error: `Tool "${toolName}" não encontrada`, code: 'NOT_FOUND' }
    }

    // Verifica autorização
    if (!this.isAuthorized(tool, context)) {
      this.writeLog({
        id: logId,
        sessionId: context.sessionId,
        traceId: context.traceId,
        toolName,
        userId: context.userId,
        tenantId: context.tenantId,
        appId: context.appId,
        input: rawInput,
        output: null,
        success: false,
        errorMessage: 'Não autorizado',
        durationMs: Date.now() - start,
        executedAt: new Date().toISOString(),
      })
      return { success: false, error: 'Não autorizado para esta tool', code: 'UNAUTHORIZED' }
    }

    // Valida input com Zod
    const parsed = tool.inputSchema.safeParse(rawInput)
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join('; ')
      return { success: false, error: `Input inválido: ${error}`, code: 'INVALID_INPUT' }
    }

    // Executa
    try {
      const result = await tool.execute(parsed.data, context)
      const durationMs = Date.now() - start

      this.writeLog({
        id: logId,
        sessionId: context.sessionId,
        traceId: context.traceId,
        toolName,
        userId: context.userId,
        tenantId: context.tenantId,
        appId: context.appId,
        input: parsed.data,
        output: result.success ? result.data : null,
        success: result.success,
        errorMessage: result.success ? undefined : result.error,
        durationMs,
        source: result.success ? result.source : undefined,
        executedAt: new Date().toISOString(),
      })

      return result
    } catch (err) {
      const durationMs = Date.now() - start
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido na tool'

      this.writeLog({
        id: logId,
        sessionId: context.sessionId,
        traceId: context.traceId,
        toolName,
        userId: context.userId,
        tenantId: context.tenantId,
        appId: context.appId,
        input: parsed.data,
        output: null,
        success: false,
        errorMessage,
        durationMs,
        executedAt: new Date().toISOString(),
      })

      return { success: false, error: errorMessage, code: 'EXECUTION_ERROR' }
    }
  }

  /** Retorna logs (para observabilidade) */
  getLogs(): ToolExecutionLog[] {
    return [...this.logs]
  }

  // ─── privados ─────────────────────────────────────────────────────────────

  private isAuthorized(tool: ToolDefinition, context: ToolExecutionContext): boolean {
    const auth = tool.authorization

    if (auth.allowedApps && auth.allowedApps.length > 0) {
      if (!auth.allowedApps.includes(context.appId)) return false
    }

    if (auth.requiredRoles && auth.requiredRoles.length > 0) {
      if (!auth.requiredRoles.includes(context.userRole)) return false
    }

    return true
  }

  private writeLog(log: ToolExecutionLog): void {
    this.logs.push(log)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[ToolRegistry]', log.toolName, log.success ? '✓' : '✗', `${log.durationMs}ms`)
    }
    // Callback para persistência externa (Sprint 5)
    this._onLogWritten?.(log)
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converte schema Zod para JSON Schema simples (usado nas tool definitions) */
function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  // Implementação simplificada para Sprint 1.
  // Sprint 5 usará zod-to-json-schema completo.
  try {
    const shape = (schema as unknown as { shape?: Record<string, z.ZodTypeAny> }).shape
    if (!shape) return { type: 'object', properties: {}, required: [] }

    const properties: Record<string, unknown> = {}
    const required: string[] = []

    for (const [key, field] of Object.entries(shape)) {
      properties[key] = zodFieldToJsonSchema(field as z.ZodTypeAny)
      const isOptional = field instanceof z.ZodOptional || field instanceof z.ZodDefault
      if (!isOptional) required.push(key)
    }

    return { type: 'object', properties, required }
  } catch {
    return { type: 'object', properties: {}, required: [] }
  }
}

function zodFieldToJsonSchema(field: z.ZodTypeAny): Record<string, unknown> {
  if (field instanceof z.ZodString) return { type: 'string' }
  if (field instanceof z.ZodNumber) return { type: 'number' }
  if (field instanceof z.ZodBoolean) return { type: 'boolean' }
  if (field instanceof z.ZodArray)
    return { type: 'array', items: zodFieldToJsonSchema(field.element) }
  if (field instanceof z.ZodEnum) return { type: 'string', enum: field.options }
  if (field instanceof z.ZodOptional) return zodFieldToJsonSchema(field.unwrap())
  if (field instanceof z.ZodDefault) return zodFieldToJsonSchema(field.removeDefault())
  if (field instanceof z.ZodNullable)
    return { ...zodFieldToJsonSchema(field.unwrap()), nullable: true }
  return { type: 'string' }
}

// ─── Singleton global ─────────────────────────────────────────────────────────

let _registry: ToolRegistry | null = null

export function getToolRegistry(): ToolRegistry {
  if (!_registry) _registry = new ToolRegistry()
  return _registry
}
