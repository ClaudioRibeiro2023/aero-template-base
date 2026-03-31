import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'

export interface FileUploadProps {
  label: string
  accept?: string
  maxSizeMB?: number
  multiple?: boolean
  onFiles: (files: File[]) => void
  error?: string
  hint?: string
  disabled?: boolean
  className?: string
}

export default function FileUpload({
  label,
  accept,
  maxSizeMB = 10,
  multiple = false,
  onFiles,
  error,
  hint,
  disabled = false,
  className = '',
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [sizeError, setSizeError] = useState<string | null>(null)

  const maxBytes = maxSizeMB * 1024 * 1024

  function validateAndEmit(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const files = Array.from(fileList)
    const oversized = files.find(f => f.size > maxBytes)
    if (oversized) {
      setSizeError(`File "${oversized.name}" exceeds ${maxSizeMB}MB limit`)
      return
    }
    setSizeError(null)
    onFiles(files)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    validateAndEmit(e.target.files)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setDragActive(true)
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (!disabled) validateAndEmit(e.dataTransfer.files)
  }

  const displayError = error || sizeError

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-sm font-medium text-text-primary">{label}</span>
      <div
        role="button"
        tabIndex={0}
        aria-label={`${label} drop zone`}
        className={`flex flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed p-6 transition-colors cursor-pointer backdrop-blur-xl
          ${dragActive ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5' : 'border-white/[0.06] bg-[var(--glass-bg)]'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/[0.1]'}
          ${displayError ? 'border-[var(--accent-rose)]/40' : ''}`}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) inputRef.current?.click()
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="file-drop-zone"
      >
        <p className="text-sm text-text-secondary">
          Drag & drop or{' '}
          <span className="text-[var(--brand-primary)] font-medium underline">browse</span>
        </p>
        <p className="text-xs text-text-secondary mt-1">
          Max {maxSizeMB}MB{accept ? ` · ${accept}` : ''}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
        data-testid="file-input"
      />
      {hint && !displayError && <p className="text-xs text-text-secondary">{hint}</p>}
      {displayError && (
        <p className="text-xs text-[var(--accent-rose)]" role="alert">
          {displayError}
        </p>
      )}
    </div>
  )
}
