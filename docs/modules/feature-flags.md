# Modulo: Feature Flags

> **ID**: `feature-flags` | **Versao**: 1.0.0 | **Categoria**: Opcional | **Status**: Ativo

Gerenciamento de feature flags com rollout progressivo

## Metadados

| Campo   | Valor                         |
| ------- | ----------------------------- |
| Icone   | `Flag`                        |
| Caminho | `/admin/config/feature-flags` |
| Ordem   | 35                            |
| Grupo   | Administracao                 |
| Sidebar | Nao                           |

## Dependencias

- [`admin`](./admin.md)

## Rotas

### Paginas

- `/admin/config/feature-flags`

### API

- `/api/feature-flags`

## Tabelas (Supabase)

- `feature_flags`

## Hooks

- `useFeatureFlag`
- `useFeatureFlagsAdmin`

## Componentes

Nenhum componente exportado.

## Variaveis de Ambiente

Nenhuma variavel de ambiente requerida.

## Funcoes (Navegacao)

| ID                     | Nome          | Subtitulo                         | Caminho                       | Categoria |
| ---------------------- | ------------- | --------------------------------- | ----------------------------- | --------- |
| `feature-flags-manage` | Feature Flags | Gerenciar flags de funcionalidade | `/admin/config/feature-flags` | CONFIG    |

---

_Gerado por `scripts/generate-module-docs.mjs` em 2026-04-13_
