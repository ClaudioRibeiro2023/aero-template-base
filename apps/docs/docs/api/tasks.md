---
sidebar_position: 1
title: Tasks API
---

# Tasks API

Base path: `/api/tasks`

## Endpoints

| Method   | Path              | Descrição                         | Auth |
| -------- | ----------------- | --------------------------------- | ---- |
| `GET`    | `/api/tasks`      | Lista tasks (paginação + filtros) | JWT  |
| `POST`   | `/api/tasks`      | Cria nova task                    | JWT  |
| `GET`    | `/api/tasks/{id}` | Obtém task por ID                 | JWT  |
| `PUT`    | `/api/tasks/{id}` | Atualiza task                     | JWT  |
| `DELETE` | `/api/tasks/{id}` | Remove task                       | JWT  |

## Schemas

### TaskCreate

```json
{
  "title": "Implementar feature X",
  "description": "Detalhes da tarefa...",
  "status": "pending",
  "priority": "high",
  "assigned_to": "uuid-do-usuario"
}
```

### TaskResponse

```json
{
  "id": "uuid",
  "title": "Implementar feature X",
  "description": "Detalhes...",
  "status": "pending",
  "priority": "high",
  "assigned_to": "uuid",
  "tenant_id": "uuid",
  "created_at": "2026-03-25T10:00:00Z",
  "updated_at": "2026-03-25T10:00:00Z"
}
```

### Filtros (query params)

| Param         | Tipo   | Descrição                     |
| ------------- | ------ | ----------------------------- |
| `page`        | int    | Página (default 1)            |
| `limit`       | int    | Itens por página (default 20) |
| `status`      | string | Filtrar por status            |
| `priority`    | string | Filtrar por prioridade        |
| `assigned_to` | UUID   | Filtrar por assignee          |
