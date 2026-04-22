import { useState, useMemo } from 'react'
import { FileText, Search, Filter, Download, RefreshCw, Copy, Check } from 'lucide-react'
import { Button, PageHeader } from '@template/design-system'

type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'

interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  service: string
  requestId: string
  message: string
  details?: Record<string, unknown>
}

// Mock logs
const MOCK_LOGS: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-03-12T14:30:15.123Z',
    level: 'INFO',
    service: 'api-gateway',
    requestId: 'req-abc123',
    message: 'Request received: GET /api/users',
  },
  {
    id: '2',
    timestamp: '2024-03-12T14:30:15.145Z',
    level: 'DEBUG',
    service: 'auth-service',
    requestId: 'req-abc123',
    message: 'Token validated successfully',
    details: { userId: 'usr-456' },
  },
  {
    id: '3',
    timestamp: '2024-03-12T14:30:15.200Z',
    level: 'INFO',
    service: 'data-service',
    requestId: 'req-abc123',
    message: 'Query executed: SELECT * FROM users LIMIT 50',
  },
  {
    id: '4',
    timestamp: '2024-03-12T14:30:16.000Z',
    level: 'WARNING',
    service: 'cache',
    requestId: 'req-def456',
    message: 'Cache miss for key: user_preferences_789',
  },
  {
    id: '5',
    timestamp: '2024-03-12T14:30:17.500Z',
    level: 'ERROR',
    service: 'data-service',
    requestId: 'req-ghi789',
    message: 'Database connection timeout after 30000ms',
    details: { host: 'db-primary', port: 5432 },
  },
  {
    id: '6',
    timestamp: '2024-03-12T14:30:18.000Z',
    level: 'INFO',
    service: 'api-gateway',
    requestId: 'req-jkl012',
    message: 'Request completed: 200 OK (45ms)',
  },
  {
    id: '7',
    timestamp: '2024-03-12T14:30:19.000Z',
    level: 'CRITICAL',
    service: 'auth-service',
    requestId: 'req-mno345',
    message: 'Failed to connect to Keycloak: ECONNREFUSED',
  },
]

const LEVEL_COLORS: Record<LogLevel, string> = {
  DEBUG: 'text-gray-500 bg-gray-50 dark:bg-gray-700/50',
  INFO: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  WARNING: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  ERROR: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  CRITICAL: 'text-red-700 bg-red-100 dark:bg-red-900/40',
}

export default function LogsPage() {
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredLogs = useMemo(() => {
    return MOCK_LOGS.filter(log => {
      if (levelFilter !== 'all' && log.level !== levelFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !log.message.toLowerCase().includes(q) &&
          !log.service.toLowerCase().includes(q) &&
          !log.requestId.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [search, levelFilter])

  const copyRequestId = (id: string, requestId: string) => {
    navigator.clipboard.writeText(requestId)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PageHeader
            title="Logs"
            description="Estruturados e correlação por request-id"
            icon={<FileText size={28} />}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="ghost" leftIcon={<Download size={18} />}>
                  Exportar
                </Button>
                <Button variant="ghost" leftIcon={<RefreshCw size={18} />}>
                  Live
                </Button>
              </div>
            }
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-surface-elevated rounded-lg border border-border-default">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por mensagem, serviço, request-id..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value as LogLevel | 'all')}
              aria-label="Filtrar por nível"
              className="form-input form-select"
            >
              <option value="all">Todos os níveis</option>
              <option value="DEBUG">DEBUG</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
        </div>

        {/* Logs */}
        <div className="space-y-2">
          {filteredLogs.map(log => (
            <div
              key={log.id}
              className={`p-3 rounded-lg border border-border-default ${LEVEL_COLORS[log.level]}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xs font-mono whitespace-nowrap opacity-75">
                  {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour12: false })}
                </span>
                <span className="text-xs font-bold uppercase w-16">{log.level}</span>
                <span className="text-xs font-medium text-text-muted w-24 truncate">
                  {log.service}
                </span>
                <button
                  type="button"
                  onClick={() => copyRequestId(log.id, log.requestId)}
                  className="flex items-center gap-1 text-xs font-mono text-primary hover:underline"
                  title="Copiar request-id"
                >
                  {copiedId === log.id ? <Check size={12} /> : <Copy size={12} />}
                  {log.requestId}
                </button>
                <span className="flex-1 text-sm">{log.message}</span>
              </div>
              {log.details && (
                <pre className="mt-2 p-2 bg-black/5 dark:bg-black/20 rounded text-xs font-mono overflow-x-auto">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-3 opacity-50" />
              <p>Nenhum log encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
