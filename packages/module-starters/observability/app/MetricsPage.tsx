import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Server,
  Database,
  Zap,
  RefreshCw,
} from 'lucide-react'
import {
  Button,
  PageHeader,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Card,
  StatusBadge,
} from '@template/design-system'

// Mock metrics data
const MOCK_METRICS = {
  requests: { value: 15420, change: 12.5, unit: 'req/min' },
  latency: { value: 45, change: -8.2, unit: 'ms' },
  errors: { value: 0.12, change: -25, unit: '%' },
  uptime: { value: 99.99, change: 0, unit: '%' },
}

const SERVICES = [
  { name: 'API Gateway', status: 'healthy', requests: 5200, latency: 12, errors: 0.01 },
  { name: 'Auth Service', status: 'healthy', requests: 3100, latency: 25, errors: 0 },
  { name: 'Data Service', status: 'warning', requests: 4500, latency: 85, errors: 0.5 },
  { name: 'Cache (Redis)', status: 'healthy', requests: 12000, latency: 2, errors: 0 },
  { name: 'Database (PostgreSQL)', status: 'healthy', requests: 2800, latency: 35, errors: 0.02 },
]

const STATUS_VARIANT = {
  healthy: 'success' as const,
  warning: 'warning' as const,
  critical: 'error' as const,
}

export default function MetricsPage() {
  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PageHeader
            title="Métricas"
            description="Prometheus/metrics de API e jobs"
            icon={<Activity size={28} />}
            actions={
              <Button variant="ghost" leftIcon={<RefreshCw size={18} />}>
                Atualizar
              </Button>
            }
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Requisições"
            value={MOCK_METRICS.requests.value.toLocaleString()}
            unit={MOCK_METRICS.requests.unit}
            change={MOCK_METRICS.requests.change}
            icon={<Zap size={20} />}
          />
          <MetricCard
            title="Latência Média"
            value={MOCK_METRICS.latency.value.toString()}
            unit={MOCK_METRICS.latency.unit}
            change={MOCK_METRICS.latency.change}
            icon={<Clock size={20} />}
          />
          <MetricCard
            title="Taxa de Erros"
            value={MOCK_METRICS.errors.value.toString()}
            unit={MOCK_METRICS.errors.unit}
            change={MOCK_METRICS.errors.change}
            icon={<Activity size={20} />}
          />
          <MetricCard
            title="Uptime"
            value={MOCK_METRICS.uptime.value.toString()}
            unit={MOCK_METRICS.uptime.unit}
            change={MOCK_METRICS.uptime.change}
            icon={<Server size={20} />}
          />
        </div>

        {/* Services Table */}
        <Card variant="outlined" padding="none">
          <div className="p-4 border-b border-border-default">
            <h2 className="text-lg font-medium text-text-primary">Serviços</h2>
          </div>
          <Table size="md" hoverable>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Serviço</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Requisições/min</TableHeaderCell>
                <TableHeaderCell>Latência</TableHeaderCell>
                <TableHeaderCell>Erros</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {SERVICES.map(service => (
                <TableRow key={service.name}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {service.name.includes('Redis') || service.name.includes('PostgreSQL') ? (
                        <Database size={16} className="text-text-muted" />
                      ) : (
                        <Server size={16} className="text-text-muted" />
                      )}
                      <span className="font-medium text-text-primary">{service.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      variant={
                        STATUS_VARIANT[service.status as keyof typeof STATUS_VARIANT] || 'pending'
                      }
                      size="sm"
                    >
                      {service.status === 'healthy'
                        ? 'Saudável'
                        : service.status === 'warning'
                          ? 'Alerta'
                          : 'Crítico'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {service.requests.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-text-secondary">{service.latency}ms</TableCell>
                  <TableCell className="text-text-secondary">{service.errors}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Charts Placeholder */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="outlined">
            <h3 className="text-sm font-medium text-text-secondary mb-4">Requisições por Tempo</h3>
            <div className="h-48 flex items-center justify-center text-text-muted">
              <div className="text-center">
                <Activity size={40} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Gráfico de requisições</p>
                <p className="text-xs mt-1">Integrar com Grafana/Prometheus</p>
              </div>
            </div>
          </Card>
          <Card variant="outlined">
            <h3 className="text-sm font-medium text-text-secondary mb-4">Latência p95/p99</h3>
            <div className="h-48 flex items-center justify-center text-text-muted">
              <div className="text-center">
                <Clock size={40} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Gráfico de latência</p>
                <p className="text-xs mt-1">Integrar com Grafana/Prometheus</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  unit: string
  change: number
  icon: React.ReactNode
}

function MetricCard({ title, value, unit, change, icon }: MetricCardProps) {
  const isPositive = change > 0
  const isNeutral = change === 0

  return (
    <Card variant="outlined" padding="none">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">{title}</span>
          <span className="text-text-muted">{icon}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-text-primary">{value}</span>
          <span className="text-sm text-text-secondary">{unit}</span>
        </div>
        {!isNeutral && (
          <div
            className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}
          >
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </Card>
  )
}
