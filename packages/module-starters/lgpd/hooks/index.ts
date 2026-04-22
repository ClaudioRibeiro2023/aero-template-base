'use client'
import { useState, useEffect } from 'react'

export interface ConsentStatus {
  marketing: boolean
  analytics: boolean
  thirdParty: boolean
  updatedAt: string | null
}

export function useConsent() {
  const [consents, setConsents] = useState<ConsentStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/lgpd')
      .then(r => r.json())
      .then(d => setConsents(d.data?.consents ?? null))
      .finally(() => setIsLoading(false))
  }, [])

  const updateConsent = async (data: Partial<ConsentStatus>) => {
    const res = await fetch('/api/lgpd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'consent', consents: data }),
    })
    if (res.ok) {
      setConsents(prev => (prev ? { ...prev, ...data, updatedAt: new Date().toISOString() } : null))
    }
    return res.ok
  }

  return { consents, isLoading, updateConsent }
}

export function useMyData() {
  const [requests, setRequests] = useState<unknown[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/lgpd')
      .then(r => r.json())
      .then(d => setRequests(d.data?.exportRequests ?? []))
      .finally(() => setIsLoading(false))
  }, [])

  const requestExport = async () => {
    const res = await fetch('/api/lgpd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'export_request' }),
    })
    return res.ok
  }

  const requestDeletion = async (reason: string) => {
    const res = await fetch('/api/lgpd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'deletion_request', reason }),
    })
    return res.ok
  }

  return { requests, isLoading, requestExport, requestDeletion }
}
