---
sidebar_position: 2
title: Componentes
---

# Componentes

## Common Components

| Componente           | Descrição                                    | Testes | Stories |
| -------------------- | -------------------------------------------- | ------ | ------- |
| `ErrorBoundary`      | Captura erros React com fallback UI          | ✅     | ✅      |
| `Loading`            | Spinner/skeleton de carregamento             | ✅     | ✅      |
| `SkipLink`           | Link de acessibilidade "pular para conteúdo" | ✅     | ✅      |
| `Toast` / `useToast` | Notificações toast com auto-dismiss          | ✅     | ✅      |
| `TenantSwitcher`     | Seletor de tenant para admin multi-org       | ✅     | ✅      |
| `FirstRunWizard`     | Wizard de configuração inicial               | ✅     | ✅      |

## Form Components

| Componente     | Features                                              | Testes | Stories |
| -------------- | ----------------------------------------------------- | ------ | ------- |
| `FormInput`    | Label, hint, error, aria-invalid, required asterisk   | 15     | 6       |
| `FormSelect`   | Options, placeholder, disabled, label, error, hint    | 13     | 6       |
| `FormTextarea` | Character count, maxLength, label, error, hint        | 14     | 6       |
| `FileUpload`   | Drag & drop, size validation, accept filter, keyboard | 18     | 7       |

### Uso dos Form Components

```tsx
import { FormInput, FormSelect, FormTextarea, FileUpload } from '@/components/forms'

<FormInput
  label="Nome"
  name="name"
  value={name}
  onChange={setName}
  error={errors.name}
  required
/>

<FileUpload
  onFilesSelected={handleFiles}
  accept=".pdf,.png,.jpg"
  maxSizeMB={5}
/>
```

## Dashboard Components

| Componente           | Descrição                                     |
| -------------------- | --------------------------------------------- |
| `KpiCard`            | Card com métrica, trend indicator, spark bars |
| `TasksByStatusChart` | Gráfico de barras (Recharts)                  |
| `TasksOverTimeChart` | Gráfico de linhas (Recharts)                  |
| `NavigationEditor`   | Editor drag-and-drop de menu items            |

## Layout Components

| Componente   | Descrição                                     |
| ------------ | --------------------------------------------- |
| `Sidebar`    | Navegação lateral com collapse                |
| `Header`     | Barra superior com user menu + tenant         |
| `MainLayout` | Layout principal (sidebar + header + content) |
