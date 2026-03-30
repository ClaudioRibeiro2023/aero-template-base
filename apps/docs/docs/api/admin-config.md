---
sidebar_position: 4
title: Admin Config API
---

# Admin Config API

## Endpoints Públicos

| Method | Path                          | Descrição                                  | Auth    |
| ------ | ----------------------------- | ------------------------------------------ | ------- |
| `GET`  | `/api/platform/public-config` | Config pública do tenant (branding, theme) | Público |

## Endpoints Admin

| Method  | Path                               | Descrição                       | Auth  |
| ------- | ---------------------------------- | ------------------------------- | ----- |
| `GET`   | `/api/admin/platform-config`       | Config completa do tenant       | ADMIN |
| `PATCH` | `/api/admin/platform-config`       | Atualiza config (merge parcial) | ADMIN |
| `POST`  | `/api/admin/platform-config/reset` | Reset para defaults             | ADMIN |

## Schema — PlatformConfig

```json
{
  "branding": {
    "appName": "Meu Produto",
    "logoUrl": "/logo.svg",
    "primaryColor": "#14b8a6",
    "faviconUrl": "/favicon.ico"
  },
  "theme": {
    "mode": "light",
    "borderRadius": "8px",
    "fontFamily": "Inter"
  },
  "navigation": [
    {
      "id": "dashboard",
      "label": "Dashboard",
      "path": "/",
      "icon": "home",
      "visible": true,
      "order": 0
    }
  ],
  "notifications": {
    "emailEnabled": true,
    "pushEnabled": false
  }
}
```

## Exemplo

```bash
# Atualizar branding
curl -X PATCH http://localhost:8000/api/admin/platform-config \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"branding": {"appName": "Novo Nome", "primaryColor": "#3b82f6"}}'
```
