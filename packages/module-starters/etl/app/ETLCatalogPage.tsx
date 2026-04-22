import { useState, useMemo } from 'react'
import {
  BookMarked,
  Search,
  Table as TableIcon,
  Eye,
  FileJson,
  Plug,
  Database,
  Tag,
  User,
  Calendar,
} from 'lucide-react'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  PageHeader,
} from '@template/design-system'
import type { DataCatalogItem } from './types'

// Mock data
const MOCK_CATALOG: DataCatalogItem[] = [
  {
    id: '1',
    name: 'vendas',
    description: 'Tabela de vendas com transações diárias',
    type: 'table',
    schema: [
      { name: 'id', type: 'integer', nullable: false, description: 'Identificador único' },
      { name: 'data', type: 'date', nullable: false, description: 'Data da venda' },
      { name: 'valor', type: 'decimal', nullable: false, description: 'Valor total' },
      { name: 'cliente_id', type: 'integer', nullable: true, description: 'FK para clientes' },
    ],
    tags: ['vendas', 'financeiro', 'diário'],
    owner: 'equipe-dados',
    lastUpdated: '2024-03-12T10:00:00',
    recordCount: 150000,
    size: '25 MB',
  },
  {
    id: '2',
    name: 'clientes',
    description: 'Cadastro de clientes ativos e inativos',
    type: 'table',
    schema: [
      { name: 'id', type: 'integer', nullable: false },
      { name: 'nome', type: 'varchar(255)', nullable: false },
      { name: 'email', type: 'varchar(255)', nullable: true },
      { name: 'ativo', type: 'boolean', nullable: false },
    ],
    tags: ['clientes', 'cadastro'],
    owner: 'equipe-crm',
    lastUpdated: '2024-03-11T14:30:00',
    recordCount: 45000,
    size: '8 MB',
  },
  {
    id: '3',
    name: 'api_eventos',
    description: 'Endpoint de eventos do sistema',
    type: 'api',
    schema: [
      { name: 'event_id', type: 'string', nullable: false },
      { name: 'type', type: 'string', nullable: false },
      { name: 'payload', type: 'json', nullable: true },
      { name: 'timestamp', type: 'datetime', nullable: false },
    ],
    tags: ['eventos', 'api', 'logs'],
    owner: 'equipe-eng',
    lastUpdated: '2024-03-12T12:00:00',
  },
]

const TYPE_ICONS = {
  table: TableIcon,
  view: Eye,
  file: FileJson,
  api: Plug,
}

export default function ETLCatalogPage() {
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<DataCatalogItem | null>(null)

  const filteredItems = useMemo(() => {
    if (!search) return MOCK_CATALOG
    const q = search.toLowerCase()
    return MOCK_CATALOG.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q))
    )
  }, [search])

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PageHeader
            title="Catálogo de Dados"
            description="Metadados, esquemas e dicionário de dados"
            icon={<BookMarked size={28} />}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar tabelas, campos, tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Catalog List */}
          <div className="lg:col-span-1 space-y-3">
            {filteredItems.map(item => {
              const Icon = TYPE_ICONS[item.type]
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    selectedItem?.id === item.id
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-border-default bg-surface-elevated hover:border-brand-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-surface-muted">
                      <Icon size={18} className="text-text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text-primary truncate">{item.name}</h3>
                      <p className="text-sm text-text-secondary truncate">{item.description}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-surface-muted rounded text-text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-text-muted">
                <Database size={40} className="mx-auto mb-2 opacity-50" />
                <p>Nenhum item encontrado</p>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-2">
            {selectedItem ? (
              <div className="bg-surface-elevated rounded-lg border border-border-default p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">{selectedItem.name}</h2>
                    <p className="text-text-secondary">{selectedItem.description}</p>
                  </div>
                  <span className="px-3 py-1 bg-surface-muted rounded-full text-sm font-medium">
                    {selectedItem.type}
                  </span>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-surface-muted rounded-lg">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-text-muted mb-1">
                      <User size={12} /> Owner
                    </div>
                    <div className="font-medium text-text-primary">{selectedItem.owner}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs text-text-muted mb-1">
                      <Calendar size={12} /> Atualizado
                    </div>
                    <div className="font-medium text-text-primary">
                      {new Date(selectedItem.lastUpdated).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  {selectedItem.recordCount && (
                    <div>
                      <div className="flex items-center gap-1 text-xs text-text-muted mb-1">
                        <TableIcon size={12} /> Registros
                      </div>
                      <div className="font-medium text-text-primary">
                        {selectedItem.recordCount.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {selectedItem.size && (
                    <div>
                      <div className="flex items-center gap-1 text-xs text-text-muted mb-1">
                        <Database size={12} /> Tamanho
                      </div>
                      <div className="font-medium text-text-primary">{selectedItem.size}</div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                    <Tag size={14} /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-primary/10 text-primary rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Schema */}
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-3">Schema</h3>
                  <Table size="sm" hoverable>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Campo</TableHeaderCell>
                        <TableHeaderCell>Tipo</TableHeaderCell>
                        <TableHeaderCell>Nullable</TableHeaderCell>
                        <TableHeaderCell>Descrição</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedItem.schema.map(field => (
                        <TableRow key={field.name}>
                          <TableCell className="font-mono text-primary">{field.name}</TableCell>
                          <TableCell className="text-text-secondary">{field.type}</TableCell>
                          <TableCell>
                            <span className={field.nullable ? 'text-yellow-600' : 'text-green-600'}>
                              {field.nullable ? 'Sim' : 'Não'}
                            </span>
                          </TableCell>
                          <TableCell className="text-text-secondary">
                            {field.description || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="bg-surface-elevated rounded-lg border border-border-default p-12 text-center">
                <BookMarked size={48} className="mx-auto mb-4 text-text-muted" />
                <p className="text-text-muted">Selecione um item para ver detalhes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
