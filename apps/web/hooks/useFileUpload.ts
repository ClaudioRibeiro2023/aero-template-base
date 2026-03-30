/**
 * useFileUpload — TanStack Query hook for file upload operations.
 * Sprint 36: Connects FE FileUpload component to BE /api/files router.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import {
  fileUploadService,
  type FileMetadata,
  type FileListResponse,
  type UploadOptions,
  type ListFilesParams,
} from '../services/fileUpload'

const FILE_QUERY_KEY = ['files'] as const

// ============================================================================
// List files
// ============================================================================

export function useFileList(params: ListFilesParams = {}) {
  return useQuery<FileListResponse>({
    queryKey: [...FILE_QUERY_KEY, params],
    queryFn: () => fileUploadService.list(params),
  })
}

// ============================================================================
// Get single file metadata
// ============================================================================

export function useFileMetadata(fileId: string | null) {
  return useQuery<FileMetadata>({
    queryKey: [...FILE_QUERY_KEY, fileId],
    queryFn: () => fileUploadService.getMetadata(fileId!),
    enabled: !!fileId,
  })
}

// ============================================================================
// Upload mutation with progress tracking
// ============================================================================

export function useFileUpload(options?: {
  onSuccess?: (file: FileMetadata) => void
  onError?: (err: Error) => void
}) {
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState(0)

  const mutation = useMutation<
    FileMetadata,
    Error,
    { file: File; options?: Omit<UploadOptions, 'onProgress'> }
  >({
    mutationFn: ({ file, options: uploadOpts }) =>
      fileUploadService.upload(file, {
        ...uploadOpts,
        onProgress: setProgress,
      }),
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
    (file: File, uploadOpts?: Omit<UploadOptions, 'onProgress'>) => {
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
    mutationFn: fileId => fileUploadService.delete(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILE_QUERY_KEY })
      options?.onSuccess?.()
    },
  })
}
