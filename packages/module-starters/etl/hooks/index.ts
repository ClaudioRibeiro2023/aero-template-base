'use client'
/**
 * Hooks do módulo ETL.
 * TODO: implementar chamadas reais à /api/etl
 */
import { useState, useEffect } from 'react'
import type { ImportJob, DataSource, DataQualityReport } from '../types'

export function useETLJobs() {
  const [jobs, setJobs] = useState<ImportJob[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/etl')
      .then(r => r.json())
      .then(d => setJobs(d.data ?? []))
      .finally(() => setIsLoading(false))
  }, [])

  return { jobs, isLoading }
}

export function useDataSources() {
  const [sources, setSources] = useState<DataSource[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/etl?view=sources')
      .then(r => r.json())
      .then(d => setSources(d.data ?? []))
      .finally(() => setIsLoading(false))
  }, [])

  return { sources, isLoading }
}

export function useDataQuality() {
  const [reports, setReports] = useState<DataQualityReport[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/etl?view=quality')
      .then(r => r.json())
      .then(d => setReports(d.data ?? []))
      .finally(() => setIsLoading(false))
  }, [])

  return { reports, isLoading }
}
