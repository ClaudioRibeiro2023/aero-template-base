import { History, Tag, ArrowUp, Bug, Sparkles, Wrench } from 'lucide-react'
import { PageHeader } from '@template/design-system'

interface Release {
  version: string
  date: string
  type: 'major' | 'minor' | 'patch'
  changes: Array<{
    type: 'feature' | 'fix' | 'improvement' | 'breaking'
    description: string
  }>
}

const RELEASES: Release[] = [
  {
    version: '1.2.0',
    date: '2024-03-12',
    type: 'minor',
    changes: [
      { type: 'feature', description: 'Módulo ETL com importadores CSV, JSON e Shapefile' },
      { type: 'feature', description: 'Dashboard de Observabilidade com métricas e logs' },
      { type: 'feature', description: 'Páginas de LGPD e Documentação' },
      { type: 'improvement', description: 'Novo painel de funções com filtros e favoritos' },
      { type: 'improvement', description: 'Sistema de permissões granulares' },
    ],
  },
  {
    version: '1.1.0',
    date: '2024-02-28',
    type: 'minor',
    changes: [
      { type: 'feature', description: 'Health checks expandidos (liveness/readiness)' },
      { type: 'feature', description: 'Retry com backoff exponencial no API client' },
      { type: 'feature', description: 'Circuit breaker pattern implementado' },
      { type: 'improvement', description: 'Logging estruturado com request-id' },
      { type: 'fix', description: 'Correção de vazamento de memória no AuthContext' },
    ],
  },
  {
    version: '1.0.0',
    date: '2024-02-15',
    type: 'major',
    changes: [
      { type: 'feature', description: 'Release inicial do Template Platform' },
      { type: 'feature', description: 'Autenticação com Keycloak OIDC' },
      { type: 'feature', description: 'Sistema de roles (ADMIN, GESTOR, OPERADOR, VIEWER)' },
      { type: 'feature', description: 'Módulo de exemplo com estrutura padrão' },
      { type: 'feature', description: 'CI/CD com GitHub Actions' },
    ],
  },
  {
    version: '0.9.0',
    date: '2024-02-01',
    type: 'minor',
    changes: [
      { type: 'feature', description: 'Configuração inicial do monorepo' },
      { type: 'feature', description: 'Setup de Vitest para testes unitários' },
      { type: 'feature', description: 'ESLint e Prettier configurados' },
      { type: 'improvement', description: 'Docker multi-stage build otimizado' },
    ],
  },
]

const CHANGE_ICONS = {
  feature: { icon: Sparkles, color: 'text-green-500' },
  fix: { icon: Bug, color: 'text-red-500' },
  improvement: { icon: ArrowUp, color: 'text-blue-500' },
  breaking: { icon: Wrench, color: 'text-orange-500' },
}

const VERSION_COLORS = {
  major: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  minor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  patch: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PageHeader
            title="Changelog"
            description="Histórico de versões e atualizações"
            icon={<History size={28} />}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border-default" />

          {RELEASES.map(release => (
            <div key={release.version} className="relative mb-8 last:mb-0">
              {/* Version Badge */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative z-10 w-12 h-12 rounded-full bg-surface-elevated border-2 border-border-default flex items-center justify-center">
                  <Tag size={20} className="text-brand-primary" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-text-primary">v{release.version}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${VERSION_COLORS[release.type]}`}
                  >
                    {release.type}
                  </span>
                  <span className="text-sm text-text-muted">
                    {new Date(release.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Changes */}
              <div className="ml-16 bg-surface-elevated rounded-lg border border-border-default p-4">
                <ul className="space-y-2">
                  {release.changes.map((change, changeIdx) => {
                    const config = CHANGE_ICONS[change.type]
                    const Icon = config.icon
                    return (
                      <li key={changeIdx} className="flex items-start gap-2">
                        <Icon size={16} className={`mt-0.5 ${config.color}`} />
                        <span className="text-text-secondary">{change.description}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-12 p-4 bg-surface-elevated rounded-lg border border-border-default">
          <h3 className="text-sm font-medium text-text-secondary mb-3">Legenda</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(CHANGE_ICONS).map(([type, config]) => {
              const Icon = config.icon
              return (
                <div key={type} className="flex items-center gap-2">
                  <Icon size={16} className={config.color} />
                  <span className="text-sm text-text-muted capitalize">{type}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
