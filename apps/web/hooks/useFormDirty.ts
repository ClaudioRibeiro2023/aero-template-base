'use client'

import { useEffect, useCallback, useState } from 'react'

/**
 * Hook to track unsaved changes and warn before leaving.
 * Usage: const { isDirty, markDirty, markClean } = useFormDirty()
 */
export function useFormDirty() {
  const [isDirty, setIsDirty] = useState(false)

  const markDirty = useCallback(() => setIsDirty(true), [])
  const markClean = useCallback(() => setIsDirty(false), [])

  useEffect(() => {
    if (!isDirty) return

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  return { isDirty, markDirty, markClean }
}
