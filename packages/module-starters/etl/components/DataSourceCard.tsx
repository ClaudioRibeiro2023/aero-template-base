import {
  Database,
  FileSpreadsheet,
  FileJson,
  Map,
  Plug,
  MoreVertical,
  Settings,
  Trash2,
  Play,
} from 'lucide-react'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@template/design-system'
import type { DataSource, DataSourceType } from '../types'

interface DataSourceCardProps {
  source: DataSource
  onRun?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

const TYPE_ICONS: Record<DataSourceType, typeof Database> = {
  csv: FileSpreadsheet,
  json: FileJson,
  shapefile: Map,
  api: Plug,
  database: Database,
}

const TYPE_LABELS: Record<DataSourceType, string> = {
  csv: 'CSV / Planilha',
  json: 'JSON / API',
  shapefile: 'Shapefile',
  api: 'Conector API',
  database: 'Banco de Dados',
}

export default function DataSourceCard({ source, onRun, onEdit, onDelete }: DataSourceCardProps) {
  const Icon = TYPE_ICONS[source.type]

  return (
    <div className="bg-surface-elevated rounded-lg border border-border-default p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          <Icon size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-text-primary truncate">{source.name}</h3>
          <p className="text-sm text-text-secondary">{TYPE_LABELS[source.type]}</p>
          {source.description && (
            <p className="text-sm text-text-muted mt-1 line-clamp-2">{source.description}</p>
          )}
        </div>
        <Dropdown align="end">
          <DropdownTrigger
            showArrow={false}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Mais opções"
          >
            <MoreVertical size={16} className="text-text-muted" />
          </DropdownTrigger>
          <DropdownMenu>
            {onRun && (
              <DropdownItem icon={<Play size={14} />} onClick={onRun}>
                Executar
              </DropdownItem>
            )}
            {onEdit && (
              <DropdownItem icon={<Settings size={14} />} onClick={onEdit}>
                Configurar
              </DropdownItem>
            )}
            {onDelete && (
              <DropdownItem icon={<Trash2 size={14} />} destructive onClick={onDelete}>
                Excluir
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="mt-3 pt-3 border-t border-border-default flex items-center justify-between text-xs text-text-muted">
        <span>Atualizado: {new Date(source.updatedAt).toLocaleDateString('pt-BR')}</span>
      </div>
    </div>
  )
}
