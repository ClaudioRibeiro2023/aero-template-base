---
sidebar_position: 3
title: Files API
---

# Files API

Base path: `/api/files`

## Endpoints

| Method   | Path                       | Descrição                               | Auth |
| -------- | -------------------------- | --------------------------------------- | ---- |
| `POST`   | `/api/files/upload`        | Upload de arquivo (multipart)           | JWT  |
| `GET`    | `/api/files/{file_id}`     | Metadata de arquivo                     | JWT  |
| `GET`    | `/api/files`               | Lista arquivos (paginação + tag filter) | JWT  |
| `DELETE` | `/api/files/{file_id}`     | Remove arquivo                          | JWT  |
| `POST`   | `/api/files/presigned-url` | Gera URL presigned para download        | JWT  |

## Upload

```bash
curl -X POST http://localhost:8000/api/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@documento.pdf" \
  -F "tags=documents,important"
```

### Validação

- **Extensões permitidas**: pdf, doc, docx, xls, xlsx, csv, txt, png, jpg, jpeg, gif, svg, webp, zip
- **Tamanho máximo**: 10MB (configurável via `MAX_FILE_SIZE_MB`)

## Schemas

### FileMetadata

```json
{
  "id": "uuid",
  "filename": "documento.pdf",
  "content_type": "application/pdf",
  "size": 1048576,
  "tags": ["documents", "important"],
  "uploaded_by": "user-uuid",
  "uploaded_at": "2026-03-25T10:00:00Z"
}
```

### FileListResponse

```json
{
  "items": [...],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

### Presigned URL

```bash
curl -X POST http://localhost:8000/api/files/presigned-url \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"file_id": "uuid", "expires_in": 3600}'
```

Response: `{ "url": "https://...", "expires_at": "..." }`
