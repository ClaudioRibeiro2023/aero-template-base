import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Play,
} from 'lucide-react'
import {
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  StatusBadge,
  PageHeader,
} from '@template/design-system'

type CheckStatus = 'passed' | 'warning' | 'failed' | 'pending'

interface QualityCheck {
  id: string
  name: string
  description: string
  schedule: string
  lastRun?: string
  status: CheckStatus
  affectedRecords?: number
  duration?: string
}

// Mock quality checks
const MOCK_CHECKS: QualityCheck[] = [
  {
    id: '1',
    name: 'Duplicatas de Email',
    description: 'Verifica emails duplicados na tabela de usuários',
    schedule: 'Diário 00:00',
    lastRun: '2024-03-12T00:00:00',
    status: 'passed',
    affectedRecords: 0,
    duration: '2.3s',
  },
  {
    id: '2',
    name: 'Integridade Referencial',
    description: 'Valida FKs entre tabelas principais',
    schedule: 'Diário 01:00',
    lastRun: '2024-03-12T01:00:00',
    status: 'passed',
    affectedRecords: 0,
    duration: '15.8s',
  },
  {
    id: '3',
    name: 'Campos Obrigatórios',
    description: 'Verifica preenchimento de campos NOT NULL',
    schedule: 'A cada 6h',
    lastRun: '2024-03-12T12:00:00',
    status: 'warning',
    affectedRecords: 45,
    duration: '5.1s',
  },
  {
    id: '4',
    name: 'Formato de CPF/CNPJ',
    description: 'Valida formato de documentos',
    schedule: 'Semanal',
    lastRun: '2024-03-10T00:00:00',
    status: 'failed',
    affectedRecords: 230,
    duration: '8.2s',
  },
  {
    id: '5',
    name: 'Dados Desatualizados',
    description: 'Identifica registros sem atualização há 90+ dias',
    schedule: 'Semanal',
    lastRun: '2024-03-10T00:00:00',
    status: 'warning',
    affectedRecords: 1500,
    duration: '12.0s',
  },
  {
    id: '6',
    name: 'Consistência de Datas',
    description: 'Verifica datas futuras indevidas',
    schedule: 'Diário 02:00',
    status: 'pending',
  },
]

const STATUS_CONFIG: Record<
  CheckStatus,
  { icon: typeof CheckCircle; color: string; bg: string; label: string }
> = {
  passed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
    label: 'Aprovado',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    label: 'Atenção',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
    label: 'Falhou',
  },
  pending: {
    icon: Clock,
    color: 'text-gray-500',
    bg: 'bg-surface-muted',
    label: 'Pendente',
  },
}

export default function DataQualityPage() {
  const passed = MOCK_CHECKS.filter(c => c.status === 'passed').length
  const warnings = MOCK_CHECKS.filter(c => c.status === 'warning').length
  const failed = MOCK_CHECKS.filter(c => c.status === 'failed').length

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PageHeader
            title="Qualidade de Dados"
            description="Checks recorrentes e painéis de qualidade"
            icon={<ShieldCheck size={28} />}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="ghost" leftIcon={<RefreshCw size={18} />}>
                  Atualizar
                </Button>
                <Button variant="primary" leftIcon={<Play size={18} />}>
                  Executar Todos
                </Button>
              </div>
            }
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-surface-elevated rounded-lg border border-border-default p-4 text-center">
            <div className="text-2xl font-bold text-text-primary">{MOCK_CHECKS.length}</div>
            <div className="text-sm text-text-secondary">Total de Checks</div>
          </div>
          <div className="status-card status-card--success p-4 text-center">
            <div className="text-2xl font-bold text-color-success">{passed}</div>
            <div className="text-sm text-color-success">Aprovados</div>
          </div>
          <div className="status-card status-card--warning p-4 text-center">
            <div className="text-2xl font-bold text-color-warning">{warnings}</div>
            <div className="text-sm text-color-warning">Alertas</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{failed}</div>
            <div className="text-sm text-red-600">Falhas</div>
          </div>
        </div>

        {/* Checks List */}
        <div className="bg-surface-elevated rounded-lg border border-border-default overflow-hidden">
          <Table size="md" hoverable>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Check</TableHeaderCell>
                <TableHeaderCell>Agendamento</TableHeaderCell>
                <TableHeaderCell>Última Execução</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Afetados</TableHeaderCell>
                <TableHeaderCell>Ações</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_CHECKS.map(check => {
                const config = STATUS_CONFIG[check.status]
                const StatusIcon = config.icon
                return (
                  <TableRow key={check.id}>
                    <TableCell>
                      <div className="font-medium text-text-primary">{check.name}</div>
                      <div className="text-sm text-text-secondary">{check.description}</div>
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary">{check.schedule}</TableCell>
                    <TableCell className="text-sm text-text-secondary">
                      {check.lastRun ? (
                        <div>
                          <div>{new Date(check.lastRun).toLocaleDateString('pt-BR')}</div>
                          <div className="text-xs text-text-muted">{check.duration}</div>
                        </div>
                      ) : (
                        <span className="text-text-muted">Nunca</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        variant={
                          check.status === 'passed'
                            ? 'success'
                            : check.status === 'warning'
                              ? 'warning'
                              : check.status === 'failed'
                                ? 'error'
                                : 'pending'
                        }
                        size="sm"
                        icon={<StatusIcon size={12} />}
                      >
                        {config.label}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      {check.affectedRecords !== undefined ? (
                        <span
                          className={
                            check.affectedRecords > 0
                              ? 'text-orange-600 font-medium'
                              : 'text-text-secondary'
                          }
                        >
                          {check.affectedRecords.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Play size={14} />
                        Executar
                      </button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
