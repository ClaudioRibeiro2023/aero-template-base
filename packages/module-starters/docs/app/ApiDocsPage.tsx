import { useState } from 'react'
import { Code, ChevronRight, Copy, Check, ExternalLink } from 'lucide-react'
import { Button, PageHeader } from '@template/design-system'

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  summary: string
  description?: string
  auth: boolean
  tags: string[]
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/health/live',
    summary: 'Liveness check',
    auth: false,
    tags: ['health'],
  },
  {
    method: 'GET',
    path: '/api/health/ready',
    summary: 'Readiness check',
    auth: false,
    tags: ['health'],
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    summary: 'Autenticação de usuário',
    auth: false,
    tags: ['auth'],
  },
  {
    method: 'POST',
    path: '/api/auth/refresh',
    summary: 'Renovar token',
    auth: true,
    tags: ['auth'],
  },
  { method: 'GET', path: '/api/users', summary: 'Listar usuários', auth: true, tags: ['users'] },
  {
    method: 'GET',
    path: '/api/users/:id',
    summary: 'Obter usuário por ID',
    auth: true,
    tags: ['users'],
  },
  { method: 'POST', path: '/api/users', summary: 'Criar usuário', auth: true, tags: ['users'] },
  {
    method: 'PUT',
    path: '/api/users/:id',
    summary: 'Atualizar usuário',
    auth: true,
    tags: ['users'],
  },
  {
    method: 'DELETE',
    path: '/api/users/:id',
    summary: 'Remover usuário',
    auth: true,
    tags: ['users'],
  },
  {
    method: 'GET',
    path: '/api/etl/sources',
    summary: 'Listar fontes de dados',
    auth: true,
    tags: ['etl'],
  },
  {
    method: 'POST',
    path: '/api/etl/import',
    summary: 'Iniciar importação',
    auth: true,
    tags: ['etl'],
  },
  { method: 'GET', path: '/api/etl/jobs/:id', summary: 'Status do job', auth: true, tags: ['etl'] },
]

const METHOD_COLORS = {
  GET: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PUT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PATCH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function ApiDocsPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [copiedPath, setCopiedPath] = useState<string | null>(null)

  const allTags = [...new Set(ENDPOINTS.flatMap(e => e.tags))]
  const filteredEndpoints = selectedTag
    ? ENDPOINTS.filter(e => e.tags.includes(selectedTag))
    : ENDPOINTS

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path)
    setCopiedPath(path)
    setTimeout(() => setCopiedPath(null), 2000)
  }

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PageHeader
            title="API Reference"
            description="Documentação da API REST"
            icon={<Code size={28} />}
            actions={
              <Button
                variant="primary"
                leftIcon={<ExternalLink size={18} />}
                onClick={() => window.open('/api/docs', '_blank')}
              >
                Swagger UI
              </Button>
            }
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tags Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedTag === null
                ? 'bg-primary text-white'
                : 'bg-surface-muted text-text-secondary hover:bg-surface-elevated'
            }`}
          >
            Todos
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                selectedTag === tag
                  ? 'bg-primary text-white'
                  : 'bg-surface-muted text-text-secondary hover:bg-surface-elevated'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Endpoints List */}
        <div className="space-y-3">
          {filteredEndpoints.map((endpoint, idx) => (
            <div
              key={idx}
              className="bg-surface-elevated rounded-lg border border-border-default p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${METHOD_COLORS[endpoint.method]}`}
                >
                  {endpoint.method}
                </span>
                <code className="flex-1 text-sm font-mono text-text-secondary">
                  {endpoint.path}
                </code>
                <button
                  type="button"
                  onClick={() => copyPath(endpoint.path)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Copiar path"
                >
                  {copiedPath === endpoint.path ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} className="text-gray-400" />
                  )}
                </button>
                {endpoint.auth && (
                  <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs">
                    🔒 Auth
                  </span>
                )}
                <ChevronRight size={18} className="text-gray-400" />
              </div>
              <p className="mt-2 text-sm text-text-secondary">{endpoint.summary}</p>
            </div>
          ))}
        </div>

        {/* Base URL */}
        <div className="mt-8 p-4 bg-surface-muted rounded-lg">
          <h3 className="text-sm font-medium text-text-secondary mb-2">Base URL</h3>
          <code className="text-sm font-mono text-primary">{window.location.origin}/api</code>
        </div>

        {/* Authentication */}
        <div className="mt-6 p-4 bg-surface-elevated rounded-lg border border-border-default">
          <h3 className="text-lg font-medium text-text-primary mb-3">Autenticação</h3>
          <p className="text-sm text-text-secondary mb-3">
            Endpoints marcados com 🔒 requerem autenticação via Bearer token no header
            Authorization:
          </p>
          <pre className="p-3 bg-surface-muted rounded text-sm font-mono overflow-x-auto">
            {`Authorization: Bearer <access_token>`}
          </pre>
        </div>
      </div>
    </div>
  )
}
