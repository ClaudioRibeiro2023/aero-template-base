import { useState } from 'react'
import { Shield, CheckCircle, AlertTriangle, XCircle, RefreshCw, Play } from 'lucide-react'
import { Button, PageHeader } from '@template/design-system'
import { QualityBadge } from './components'
import type { DataQualityReport, DataQualityMetric, DataQualityIssue } from './types'

// Mock data
const MOCK_REPORTS: DataQualityReport[] = [
  {
    id: '1',
    targetId: '1',
    targetName: 'vendas',
    executedAt: '2024-03-12T10:00:00',
    status: 'passed',
    metrics: [
      {
        name: 'Completude',
        description: 'Campos preenchidos',
        value: 98.5,
        threshold: 95,
        status: 'passed',
      },
      {
        name: 'Unicidade',
        description: 'Registros únicos',
        value: 99.9,
        threshold: 99,
        status: 'passed',
      },
      {
        name: 'Validade',
        description: 'Formatos válidos',
        value: 97.2,
        threshold: 95,
        status: 'passed',
      },
      {
        name: 'Atualidade',
        description: 'Dados recentes',
        value: 100,
        threshold: 90,
        status: 'passed',
      },
    ],
    issues: [],
  },
  {
    id: '2',
    targetId: '2',
    targetName: 'clientes',
    executedAt: '2024-03-12T09:30:00',
    status: 'warning',
    metrics: [
      {
        name: 'Completude',
        description: 'Campos preenchidos',
        value: 92.1,
        threshold: 95,
        status: 'warning',
      },
      {
        name: 'Unicidade',
        description: 'Registros únicos',
        value: 99.5,
        threshold: 99,
        status: 'passed',
      },
      {
        name: 'Validade',
        description: 'Formatos válidos',
        value: 88.3,
        threshold: 95,
        status: 'warning',
      },
      {
        name: 'Atualidade',
        description: 'Dados recentes',
        value: 95,
        threshold: 90,
        status: 'passed',
      },
    ],
    issues: [
      {
        id: '1',
        severity: 'medium',
        field: 'email',
        description: 'Emails inválidos detectados',
        affectedRecords: 350,
        suggestedFix: 'Validar formato de email',
      },
      {
        id: '2',
        severity: 'low',
        field: 'telefone',
        description: 'Campos de telefone vazios',
        affectedRecords: 1200,
        suggestedFix: 'Solicitar atualização cadastral',
      },
    ],
  },
  {
    id: '3',
    targetId: '3',
    targetName: 'produtos',
    executedAt: '2024-03-11T15:00:00',
    status: 'failed',
    metrics: [
      {
        name: 'Completude',
        description: 'Campos preenchidos',
        value: 75.0,
        threshold: 95,
        status: 'failed',
      },
      {
        name: 'Unicidade',
        description: 'Registros únicos',
        value: 85.2,
        threshold: 99,
        status: 'failed',
      },
      {
        name: 'Validade',
        description: 'Formatos válidos',
        value: 60.5,
        threshold: 95,
        status: 'failed',
      },
      {
        name: 'Atualidade',
        description: 'Dados recentes',
        value: 50,
        threshold: 90,
        status: 'failed',
      },
    ],
    issues: [
      {
        id: '3',
        severity: 'critical',
        field: 'codigo',
        description: 'Códigos duplicados',
        affectedRecords: 2500,
        suggestedFix: 'Deduplicar registros',
      },
      {
        id: '4',
        severity: 'high',
        field: 'preco',
        description: 'Preços zerados ou negativos',
        affectedRecords: 800,
        suggestedFix: 'Corrigir valores de preço',
      },
      {
        id: '5',
        severity: 'high',
        description: 'Dados desatualizados (>90 dias)',
        affectedRecords: 5000,
        suggestedFix: 'Reprocessar fonte de dados',
      },
    ],
  },
]

const SEVERITY_CONFIG = {
  low: { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', label: 'Baixa' },
  medium: { color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20', label: 'Média' },
  high: { color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20', label: 'Alta' },
  critical: { color: 'text-red-600 bg-red-50 dark:bg-red-900/20', label: 'Crítica' },
}

export default function ETLQualityPage() {
  const [selectedReport, setSelectedReport] = useState<DataQualityReport | null>(MOCK_REPORTS[0])

  const getMetricIcon = (status: DataQualityMetric['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle size={16} className="text-green-500" />
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-500" />
      case 'failed':
        return <XCircle size={16} className="text-red-500" />
    }
  }

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PageHeader
            title="Qualidade de Dados"
            description="Validações, consistência e monitoramento"
            icon={<Shield size={28} />}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="ghost" leftIcon={<RefreshCw size={18} />}>
                  Atualizar
                </Button>
                <Button variant="primary" leftIcon={<Play size={18} />}>
                  Executar Checks
                </Button>
              </div>
            }
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="status-card status-card--success p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Aprovados</span>
              <CheckCircle size={20} className="text-color-success" />
            </div>
            <div className="text-2xl font-bold text-color-success mt-1">
              {MOCK_REPORTS.filter(r => r.status === 'passed').length}
            </div>
          </div>
          <div className="status-card status-card--warning p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Com Alertas</span>
              <AlertTriangle size={20} className="text-color-warning" />
            </div>
            <div className="text-2xl font-bold text-color-warning mt-1">
              {MOCK_REPORTS.filter(r => r.status === 'warning').length}
            </div>
          </div>
          <div className="status-card status-card--error p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Reprovados</span>
              <XCircle size={20} className="text-color-error" />
            </div>
            <div className="text-2xl font-bold text-color-error mt-1">
              {MOCK_REPORTS.filter(r => r.status === 'failed').length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-text-primary">Relatórios</h2>
            {MOCK_REPORTS.map(report => (
              <button
                key={report.id}
                type="button"
                onClick={() => setSelectedReport(report)}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  selectedReport?.id === report.id
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-border-default bg-surface-elevated hover:border-brand-primary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-text-primary">{report.targetName}</span>
                  <QualityBadge status={report.status} size="sm" />
                </div>
                <div className="text-xs text-text-muted">
                  {new Date(report.executedAt).toLocaleString('pt-BR')}
                </div>
                {report.issues.length > 0 && (
                  <div className="mt-2 text-xs text-orange-600">
                    {report.issues.length} issue(s) encontrada(s)
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Report Detail */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <div className="bg-surface-elevated rounded-lg border border-border-default p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">
                      {selectedReport.targetName}
                    </h2>
                    <p className="text-sm text-text-muted">
                      Executado em {new Date(selectedReport.executedAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <QualityBadge status={selectedReport.status} size="lg" />
                </div>

                {/* Metrics */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-text-secondary mb-3">Métricas</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedReport.metrics.map(metric => (
                      <div key={metric.name} className="p-3 bg-surface-muted rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-text-primary">
                            {metric.name}
                          </span>
                          {getMetricIcon(metric.status)}
                        </div>
                        <div className="text-xs text-text-muted mb-2">{metric.description}</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-surface-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                metric.status === 'passed'
                                  ? 'bg-color-success'
                                  : metric.status === 'warning'
                                    ? 'bg-color-warning'
                                    : 'bg-color-error'
                              }`}
                              style={{ width: `${metric.value}%` }}
                              role="progressbar"
                              aria-valuenow={metric.value}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`${metric.name}: ${metric.value}%`}
                            />
                          </div>
                          <span className="text-sm font-medium">{metric.value}%</span>
                        </div>
                        <div className="text-xs text-text-muted mt-1">
                          Mínimo: {metric.threshold}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Issues */}
                {selectedReport.issues.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-3">
                      Issues ({selectedReport.issues.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedReport.issues.map((issue: DataQualityIssue) => (
                        <div
                          key={issue.id}
                          className={`p-3 rounded-lg ${SEVERITY_CONFIG[issue.severity].color}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{issue.description}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-white/50">
                              {SEVERITY_CONFIG[issue.severity].label}
                            </span>
                          </div>
                          {issue.field && (
                            <div className="text-xs opacity-75 mb-1">Campo: {issue.field}</div>
                          )}
                          <div className="text-sm">
                            {issue.affectedRecords.toLocaleString()} registros afetados
                          </div>
                          {issue.suggestedFix && (
                            <div className="mt-2 text-xs opacity-75">
                              💡 Sugestão: {issue.suggestedFix}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-surface-elevated rounded-lg border border-border-default p-12 text-center">
                <Shield size={48} className="mx-auto mb-4 text-text-muted" />
                <p className="text-text-muted">Selecione um relatório</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
