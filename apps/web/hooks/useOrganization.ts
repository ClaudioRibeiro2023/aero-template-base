'use client'

/**
 * useOrganization — Hook para multi-tenancy por organização
 *
 * Gerencia a organização ativa do usuário e permite trocar entre orgs.
 */

import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@template/shared'

interface Organization {
  id: string
  name: string
  slug: string
  plan: string
  settings: Record<string, unknown>
  logo_url: string | null
}

async function fetchUserOrgs(): Promise<Organization[]> {
  const res = await fetch('/api/organizations')
  if (!res.ok) return []
  const json = await res.json()
  return json.data ?? []
}

async function switchOrg(orgId: string): Promise<void> {
  const res = await fetch('/api/auth/switch-org', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Erro ao trocar organização')
  }
}

export function useOrganization() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const currentOrgId = (user as unknown as Record<string, unknown> | null)?.org_id as
    | string
    | undefined

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ['organizations', user?.id],
    queryFn: fetchUserOrgs,
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 min
  })

  const currentOrg = orgs.find(o => o.id === currentOrgId) ?? orgs[0]

  const switchMutation = useMutation({
    mutationFn: switchOrg,
    onSuccess: () => {
      // Invalidar tudo — dados mudam com a org
      queryClient.invalidateQueries()
    },
  })

  const handleSwitchOrg = useCallback(
    (orgId: string) => switchMutation.mutateAsync(orgId),
    [switchMutation]
  )

  return {
    org: currentOrg,
    orgs,
    isLoading,
    isSwitching: switchMutation.isPending,
    switchOrg: handleSwitchOrg,
  }
}
