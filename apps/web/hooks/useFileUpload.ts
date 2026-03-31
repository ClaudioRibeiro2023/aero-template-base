/**
 * useFileUpload — TanStack Query hook for file upload operations.
 * Uses Supabase Storage for file management.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import {
  fileUploadService,
  type FileMetadata,
  type UploadOptions,
  type ListFilesParams,
} from '../services/fileUpload'

const FILE_QUERY_KEY = ['files'] as const

// ============================================================================
// List files
// ============================================================================

export function useFileList(params: ListFilesParams = {}) {
  return useQuery<FileMetadata[]>({
    queryKey: [...FILE_QUERY_KEY, params],
    queryFn: () => fileUploadService.list(params),
  })
}

// ============================================================================
// Upload mutation
// ============================================================================

export function useFileUpload(options?: {
  onSuccess?: (file: FileMetadata) => void
  onError?: (err: Error) => void
}) {
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState(0)

  const mutation = useMutation<FileMetadata, Error, { file: File; options?: UploadOptions }>({
    mutationFn: async ({ file, options: uploadOpts }) => {
      setProgress(10)
      const result = await fileUploadService.upload(file, uploadOpts)
      setProgress(100)
      return result
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: FILE_QUERY_KEY })
      setProgress(0)
      options?.onSuccess?.(data)
    },
    onError: err => {
      setProgress(0)
      options?.onError?.(err)
    },
  })

  const upload = useCallback(
    (file: File, uploadOpts?: UploadOptions) => {
      mutation.mutate({ file, options: uploadOpts })
    },
    [mutation]
  )

  return {
    upload,
    progress,
    isUploading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  }
}

// ============================================================================
// Delete mutation
// ============================================================================

export function useFileDelete(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: path => fileUploadService.delete(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILE_QUERY_KEY })
      options?.onSuccess?.()
    },
  })
}
