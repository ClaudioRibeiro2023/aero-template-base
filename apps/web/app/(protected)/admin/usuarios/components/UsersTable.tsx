'use client'

import { ChevronLeft, ChevronRight, Pencil, Users, ShieldAlert, Loader2 } from 'lucide-react'
import type { Profile } from '@/hooks/useUsers'

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: 'rgba(167,139,250,0.10)', text: '#a78bfa' },
  GESTOR: { bg: 'rgba(96,165,250,0.10)', text: '#60a5fa' },
  OPERADOR: { bg: 'rgba(52,211,153,0.10)', text: '#34d399' },
  VIEWER: { bg: 'rgba(161,161,170,0.10)', text: '#a1a1aa' },
}

export interface UsersTableProps {
  users: Profile[]
  total: number
  page: number
  totalPages: number
  isLoading: boolean
  isError: boolean
  onPageChange: (page: number) => void
  onEdit: (user: Profile) => void
  onClearFilters: () => void
}

export function UsersTable({
  users,
  total,
  page,
  totalPages,
  isLoading,
  isError,
  onPageChange,
  onEdit,
  onClearFilters,
}: UsersTableProps) {
  return (
    <div
      className="overflow-hidden"
      style={{
        background: 'rgba(24, 24, 27, 0.72)',
        backdropFilter: 'blur(12px) saturate(1.2)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <caption className="sr-only">Lista de usuários do sistema</caption>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">
                Email
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Role
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-16">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-zinc-600 animate-spin" />
                    <p className="text-sm text-zinc-500">Carregando usuarios...</p>
                  </div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={5} className="py-16">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <ShieldAlert size={48} className="text-zinc-700" />
                    <p className="text-sm font-medium text-zinc-400">Erro ao carregar usuarios</p>
                    <p className="text-[13px] text-zinc-600">
                      Verifique sua conexao e tente novamente
                    </p>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Users size={48} className="text-zinc-700" />
                    <p className="text-sm font-medium text-zinc-400">Nenhum usuário encontrado</p>
                    <p className="text-[13px] text-zinc-600">Tente ajustar os filtros de busca</p>
                    <button
                      onClick={onClearFilters}
                      className="mt-1 px-4 py-1.5 rounded-lg text-[13px] text-zinc-400 transition-colors duration-150 hover:bg-white/[0.04]"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      Limpar filtros
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              users.map(u => {
                const roleStyle = ROLE_COLORS[u.role] || ROLE_COLORS.VIEWER
                return (
                  <tr
                    key={u.id}
                    className="transition-colors duration-100 hover:bg-white/[0.02]"
                    style={{
                      height: 48,
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      opacity: u.is_active ? 1 : 0.6,
                    }}
                  >
                    {/* Nome + Avatar */}
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex items-center justify-center shrink-0 rounded-full font-mono text-[11px] font-semibold"
                          style={{
                            width: 28,
                            height: 28,
                            background: 'rgba(0,180,216,0.10)',
                            color: '#00b4d8',
                          }}
                        >
                          {u.display_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-zinc-200">{u.display_name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-2 text-sm text-zinc-500 hidden sm:table-cell">
                      {u.email}
                    </td>

                    {/* Role Badge */}
                    <td className="px-4 py-2">
                      <span
                        className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium"
                        style={{
                          background: roleStyle.bg,
                          color: roleStyle.text,
                        }}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Status Dot */}
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="rounded-full"
                          style={{
                            width: 8,
                            height: 8,
                            background: u.is_active ? '#34d399' : '#52525b',
                            boxShadow: u.is_active ? '0 0 6px rgba(52,211,153,0.4)' : 'none',
                          }}
                        />
                        <span className="text-[13px] text-zinc-400">
                          {u.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => onEdit(u)}
                        className="inline-flex items-center justify-center rounded-md text-zinc-500 transition-colors duration-150 hover:bg-white/[0.06]"
                        style={{ width: 28, height: 28 }}
                        aria-label={`Editar ${u.display_name}`}
                      >
                        <Pencil size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(255,255,255,0.01)',
        }}
      >
        <p className="text-[13px] text-zinc-600">
          Mostrando {users.length} de {total} usuários
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center justify-center rounded-md transition-colors duration-150 enabled:hover:bg-white/[0.04]"
            style={{
              width: 28,
              height: 28,
              border: '1px solid rgba(255,255,255,0.08)',
              opacity: page === 1 ? 0.3 : 1,
            }}
            aria-label="Página anterior"
          >
            <ChevronLeft size={14} className="text-zinc-400" />
          </button>
          <span className="text-[13px] text-zinc-500 px-2 select-none">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="flex items-center justify-center rounded-md transition-colors duration-150 enabled:hover:bg-white/[0.04]"
            style={{
              width: 28,
              height: 28,
              border: '1px solid rgba(255,255,255,0.08)',
              opacity: page === totalPages ? 0.3 : 1,
            }}
            aria-label="Próxima página"
          >
            <ChevronRight size={14} className="text-zinc-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
