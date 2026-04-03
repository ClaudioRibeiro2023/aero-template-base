'use client'

import { Search } from 'lucide-react'

export interface UserFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  roleFilter: string
  onRoleFilterChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
}

export function UserFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full h-10 pl-9 pr-3 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all duration-150"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = '#00b4d8'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,180,216,0.15)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
      </div>
      <select
        value={roleFilter}
        onChange={e => onRoleFilterChange(e.target.value)}
        className="h-10 px-3 rounded-lg text-sm text-zinc-300 outline-none transition-all duration-150 appearance-none cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = '#00b4d8'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,180,216,0.15)'
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <option value="all">Todas as roles</option>
        <option value="ADMIN">Admin</option>
        <option value="GESTOR">Gestor</option>
        <option value="OPERADOR">Operador</option>
        <option value="VIEWER">Viewer</option>
      </select>
      <select
        value={statusFilter}
        onChange={e => onStatusFilterChange(e.target.value)}
        className="h-10 px-3 rounded-lg text-sm text-zinc-300 outline-none transition-all duration-150 appearance-none cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = '#00b4d8'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,180,216,0.15)'
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <option value="all">Todos os status</option>
        <option value="active">Ativos</option>
        <option value="inactive">Inativos</option>
      </select>
    </div>
  )
}
