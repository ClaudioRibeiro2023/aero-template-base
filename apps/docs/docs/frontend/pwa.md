---
sidebar_position: 6
title: PWA
---

# Progressive Web App (PWA)

## Componentes

| Arquivo                  | Descrição                                |
| ------------------------ | ---------------------------------------- |
| `public/manifest.json`   | Web App Manifest (icons, theme, display) |
| `public/sw.js`           | Service Worker (cache strategies)        |
| `public/offline.html`    | Página offline fallback                  |
| `src/lib/sw-register.ts` | Registration utility + update detection  |

## Estratégias de Cache

| Tipo de Request                         | Estratégia    | Fallback                    |
| --------------------------------------- | ------------- | --------------------------- |
| **Assets estáticos** (JS, CSS, imagens) | Cache-first   | Network                     |
| **API requests** (`/api/*`)             | Network-first | JSON `{ error: "offline" }` |
| **Navegação** (HTML pages)              | Network-first | Cache → `offline.html`      |

## Registro

O Service Worker é registrado **apenas em produção**:

```tsx
// main.tsx
if (import.meta.env.PROD) {
  registerServiceWorker()
}
```

## Manifest

```json
{
  "name": "Template Platform",
  "short_name": "Platform",
  "display": "standalone",
  "theme_color": "#14b8a6",
  "start_url": "/"
}
```

## Desregistrar SW

```ts
import { unregisterServiceWorker } from '@/lib/sw-register'
await unregisterServiceWorker()
```
