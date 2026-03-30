/**
 * useNavigationExport Hook
 *
 * Provides utilities to export the current navigation config as JSON
 * and import a config from a JSON file, with validation.
 *
 * Sprint S5: Multi-Platform Config
 */

import { useCallback } from 'react'
import { useNavigationConfig } from '@/hooks/useNavigationConfig'
import {
  serializeConfig,
  deserializeConfig,
  validateNavigationConfig,
  type NavigationConfig,
} from '@/config/navigation-schema'

interface UseNavigationExportReturn {
  /** Download current config as .json file */
  exportConfig: () => void

  /** Import config from a JSON string. Returns validation errors if any. */
  importConfig: (json: string) => { success: boolean; errors: string[]; config?: NavigationConfig }

  /** Import config from a File object (e.g. from <input type="file">) */
  importFromFile: (
    file: File
  ) => Promise<{ success: boolean; errors: string[]; config?: NavigationConfig }>
}

export function useNavigationExport(): UseNavigationExportReturn {
  const { config } = useNavigationConfig()

  const exportConfig = useCallback(() => {
    const json = serializeConfig(config)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `navigation-config-${config.appName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [config])

  const importConfig = useCallback(
    (json: string): { success: boolean; errors: string[]; config?: NavigationConfig } => {
      try {
        const parsed = deserializeConfig(json)
        const validation = validateNavigationConfig(parsed)
        if (!validation.valid) {
          return { success: false, errors: validation.errors }
        }
        return { success: true, errors: [], config: parsed }
      } catch (err) {
        return {
          success: false,
          errors: [`JSON inválido: ${err instanceof Error ? err.message : String(err)}`],
        }
      }
    },
    []
  )

  const importFromFile = useCallback(
    async (
      file: File
    ): Promise<{ success: boolean; errors: string[]; config?: NavigationConfig }> => {
      if (!file.name.endsWith('.json')) {
        return { success: false, errors: ['Arquivo deve ser .json'] }
      }

      try {
        const text = await file.text()
        return importConfig(text)
      } catch (err) {
        return {
          success: false,
          errors: [`Erro ao ler arquivo: ${err instanceof Error ? err.message : String(err)}`],
        }
      }
    },
    [importConfig]
  )

  return { exportConfig, importConfig, importFromFile }
}

export default useNavigationExport
