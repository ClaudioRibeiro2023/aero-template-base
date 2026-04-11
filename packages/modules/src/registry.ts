/**
 * @template/modules — Registro agnóstico de módulos de navegação.
 *
 * ModuleRegistry<T> é genérico: qualquer forma de definição de módulo pode
 * ser registrada. A app derivada especializa T para ModuleConfig da sua
 * própria navegação sem criar dependência circular com o package.
 */

export interface ModuleDefinition {
  /** Identificador único do módulo */
  id: string
  /** Módulo ativo/visível */
  enabled: boolean
  /** Ordem de exibição (menor = primeiro) */
  order: number
}

export interface ModuleRegistryOptions {
  /** Se true, lança erro ao registrar id duplicado. Default: false (sobrescreve) */
  strictMode?: boolean
}

/**
 * Registro de módulos server-side. Singleton por instância.
 * T deve estender ModuleDefinition (id + enabled + order).
 */
export class ModuleRegistry<T extends ModuleDefinition> {
  private readonly modules = new Map<string, T>()
  private readonly options: ModuleRegistryOptions

  constructor(options: ModuleRegistryOptions = {}) {
    this.options = options
  }

  /** Registra ou substitui um módulo */
  register(module: T): this {
    if (this.options.strictMode && this.modules.has(module.id)) {
      throw new Error(`[ModuleRegistry] Módulo '${module.id}' já está registrado.`)
    }
    this.modules.set(module.id, module)
    return this
  }

  /** Remove um módulo pelo id */
  unregister(id: string): this {
    this.modules.delete(id)
    return this
  }

  /** Retorna todos os módulos habilitados, ordenados por .order */
  getEnabled(): T[] {
    return Array.from(this.modules.values())
      .filter(m => m.enabled)
      .sort((a, b) => a.order - b.order)
  }

  /** Retorna todos os módulos (habilitados + desabilitados), ordenados por .order */
  getAll(): T[] {
    return Array.from(this.modules.values()).sort((a, b) => a.order - b.order)
  }

  /** Retorna um módulo pelo id, ou undefined */
  getById(id: string): T | undefined {
    return this.modules.get(id)
  }

  /** Verifica se um módulo está registrado */
  has(id: string): boolean {
    return this.modules.has(id)
  }

  /** Número total de módulos registrados */
  get size(): number {
    return this.modules.size
  }

  /** Limpa todos os módulos (útil em testes) */
  clear(): this {
    this.modules.clear()
    return this
  }
}

/**
 * Cria e retorna um novo ModuleRegistry tipado.
 * Uso: `const registry = createRegistry<ModuleConfig>()`
 */
export function createRegistry<T extends ModuleDefinition>(
  options?: ModuleRegistryOptions
): ModuleRegistry<T> {
  return new ModuleRegistry<T>(options)
}
