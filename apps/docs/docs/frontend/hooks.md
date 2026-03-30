---
sidebar_position: 3
title: Hooks
---

# Custom Hooks

## Catálogo

| Hook                | Descrição                                                 | Testes |
| ------------------- | --------------------------------------------------------- | ------ |
| `useFileUpload`     | Upload, list, metadata, delete via TanStack Query         | 13     |
| `useFileList`       | Lista arquivos com paginação                              | ✅     |
| `useFileMetadata`   | Metadata de arquivo individual                            | ✅     |
| `useFileDelete`     | Deleção de arquivo com invalidação                        | ✅     |
| `useWebSocket`      | Conexão WebSocket com reconnect                           | ✅     |
| `useToast`          | Notificações toast (success/error/info)                   | ✅     |
| `useA11y`           | Pack: announcer, focus trap, keyboard nav, reduced motion | 53     |
| `useFocusTrap`      | Trap de foco para modais                                  | ✅     |
| `usePerformance`    | Prefetch, debounce, throttle, web vitals                  | 17     |
| `usePlatformConfig` | Config white-label com fallback offline                   | ✅     |
| `useDashboard`      | Dados de dashboard agregados                              | ✅     |
| `useFilters`        | Estado de filtros com URL sync                            | ✅     |

## Exemplo — useFileUpload

```tsx
import { useFileUpload, useFileList } from '@/hooks/useFileUpload'

function UploadPage() {
  const {
    mutate: upload,
    isPending,
    progress,
  } = useFileUpload({
    onSuccess: () => console.log('Upload concluído!'),
    onProgress: pct => console.log(`${pct}%`),
  })

  const { data: files } = useFileList({ page: 1, limit: 10, tag: 'documents' })

  return (
    <div>
      <input
        type="file"
        onChange={e => {
          if (e.target.files?.[0]) upload({ file: e.target.files[0], tags: ['documents'] })
        }}
      />
      {isPending && <p>Uploading... {progress}%</p>}
      {files?.items.map(f => (
        <p key={f.id}>{f.filename}</p>
      ))}
    </div>
  )
}
```

## Exemplo — useA11y

```tsx
import { useAnnouncer, useFocusTrap, useReducedMotion } from '@/hooks/useA11y'

function Modal({ isOpen, onClose }) {
  const trapRef = useFocusTrap(isOpen)
  const announce = useAnnouncer()
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (isOpen) announce('Modal aberto')
  }, [isOpen])

  return (
    <div ref={trapRef} className={reducedMotion ? '' : 'animate-fadeIn'}>
      <h2>Meu Modal</h2>
      <button onClick={onClose}>Fechar</button>
    </div>
  )
}
```
