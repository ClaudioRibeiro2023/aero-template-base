---
id: 'ADR-005'
title: 'Migração para ESLint 9 com Flat Config'
status: 'accepted'
date: '2026-03-30'
owners:
  - 'Equipe de Arquitetura'
tags:
  - 'tooling'
  - 'eslint'
  - 'qualidade'
  - 'typescript'
related:
  - 'ADR-001'
supersedes: null
superseded_by: null
---

# ADR-005: Migração para ESLint 9 com Flat Config

## 1. Contexto e Problema

O template.base v2.0 utilizava ESLint 8 com o formato de configuração legado (`.eslintrc.cjs`). Em 2024, o ESLint 9 foi lançado tornando o **flat config** (`eslint.config.mjs`) o padrão oficial, com o formato legado marcado para descontinuação.

Problemas identificados com a configuração anterior:

- **Formato legado depreciado** — O ESLint 8 com `.eslintrc.*` não receberá novos recursos; plugins já começaram a exigir ESLint 9
- **Comportamento implícito** — O lookup hierárquico de arquivos de configuração em diretórios pais tornava o comportamento difícil de prever em monorepos e ao usar ferramentas externas
- **Incompatibilidade de versões** — `@typescript-eslint/eslint-plugin` v6 e `eslint-plugin-react-hooks` v4 não suportam ESLint 9, forçando manutenção de versões antigas
- **Performance** — O flat config elimina o overhead de resolução de múltiplos arquivos `.eslintrc` na árvore de diretórios

> **Problema central:** Como migrar para ESLint 9 com flat config garantindo compatibilidade com TypeScript strict e React hooks, sem introduzir regressões nas regras de qualidade existentes?

## 2. Drivers de Decisão

- **DR1:** Suporte futuro — Garantir que o tooling de linting continuará recebendo atualizações e novos plugins
- **DR2:** Explicitabilidade — Configuração declarativa e sem comportamentos implícitos de lookup hierárquico
- **DR3:** Performance — Redução do tempo de linting em projetos com múltiplos subdiretórios
- **DR4:** Compatibilidade — Manter todas as regras TypeScript e React hooks existentes sem regressões

Priorização: DR1 > DR2 > DR3 > DR4

## 3. Decisão

> **Decidimos:** Migrar de `.eslintrc.cjs` (ESLint 8) para `eslint.config.mjs` (ESLint 9 flat config), bumpar `@typescript-eslint/eslint-plugin` de v6 para v8 e `eslint-plugin-react-hooks` de v4 para v5, e adicionar `@eslint/js` como dependência explícita.

### Especificações

| Pacote                             | Versão Anterior | Versão Nova  | Arquivo de Referência |
| ---------------------------------- | --------------- | ------------ | --------------------- |
| `eslint`                           | 8.55.x          | 9.x          | `package.json`        |
| `@typescript-eslint/eslint-plugin` | 6.x             | 8.x          | `package.json`        |
| `@typescript-eslint/parser`        | 6.x             | 8.x          | `package.json`        |
| `eslint-plugin-react-hooks`        | 4.x             | 5.x          | `package.json`        |
| `eslint-plugin-react`              | 7.x             | 7.x (compat) | `package.json`        |
| `@eslint/js`                       | —               | 9.x          | `package.json`        |
| `eslint-config-next`               | —               | 15.x         | `package.json`        |

### Estrutura do `eslint.config.mjs`

```javascript
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  // Regras base do JavaScript
  js.configs.recommended,

  // Configuração Next.js (via FlatCompat para compatibilidade)
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // TypeScript strict (typescript-eslint v8)
  ...tseslint.configs.recommended,

  // React Hooks (v5 — flat config nativo)
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },

  // Overrides customizados do projeto
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  // Ignorar arquivos gerados e build output
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**', '*.generated.ts'],
  },
]

export default eslintConfig
```

### Principais Diferenças do Flat Config

| Aspecto            | ESLint 8 (`.eslintrc.cjs`)   | ESLint 9 (`eslint.config.mjs`)             |
| ------------------ | ---------------------------- | ------------------------------------------ |
| Formato            | CommonJS ou JSON             | ES Module (`.mjs`)                         |
| Composição         | `extends` por nome de string | Array de objetos (spread explícito)        |
| Lookup hierárquico | Percorre diretórios pais     | Apenas o arquivo raiz                      |
| Plugins legados    | Suportados nativamente       | Requerem `FlatCompat` para compatibilidade |
| `ignorePatterns`   | Campo no objeto de config    | Array `ignores` como objeto separado       |
| `parser`           | Campo `parser` na raiz       | Campo `languageOptions.parser` por bloco   |

### Escopo

- **Afeta:** Pipeline de CI/CD (lint step), pré-commit hooks, VS Code ESLint extension
- **Não afeta:** Regras de formatação (Prettier permanece independente)

## 4. Alternativas Consideradas

### Alternativa A: Manter ESLint 8

| Aspecto | Avaliação                                                              |
| ------- | ---------------------------------------------------------------------- |
| Prós    | Zero esforço de migração, sem risco de regressão                       |
| Contras | Sem suporte futuro, plugins passando a exigir ESLint 9, dívida técnica |
| Esforço | Zero                                                                   |
| Risco   | Alto (curto prazo: funciona; médio prazo: plugins param de funcionar)  |

**Por que descartada:** Dívida técnica inevitável. Plugins como `eslint-plugin-react-hooks` v5 e futuros plugins Next.js já requerem ESLint 9.

### Alternativa B: Biome

| Aspecto | Avaliação                                                                                                   |
| ------- | ----------------------------------------------------------------------------------------------------------- |
| Prós    | 10-100x mais rápido que ESLint, linter + formatter em um só, sem config complexa                            |
| Contras | Ecossistema de plugins menor, algumas regras TypeScript ausentes, sem suporte a ESLint plugins customizados |
| Esforço | Alto (reescrita completa de config, treinamento)                                                            |
| Risco   | Médio (regras faltantes podem deixar passar bugs)                                                           |

**Por que descartada:** O ecossistema de plugins do ESLint (especialmente TypeScript e React) ainda é superior. A velocidade do Biome não compensa a perda de cobertura de regras no perfil atual dos projetos.

### Alternativa C: Oxlint + ESLint híbrido

| Aspecto | Avaliação                                                              |
| ------- | ---------------------------------------------------------------------- |
| Prós    | Oxlint para regras rápidas, ESLint para regras TypeScript avançadas    |
| Contras | Dois processos de lint, configuração duplicada, overhead de manutenção |
| Esforço | Alto                                                                   |
| Risco   | Médio (complexidade operacional)                                       |

**Por que descartada:** Complexidade de manter dois linters sincronizados supera o ganho de performance neste perfil de projeto.

## 5. Consequências e Trade-offs

### Positivas

- ✅ Configuração explícita e composable — sem comportamentos implícitos de lookup hierárquico
- ✅ Suporte garantido pelo ESLint team — flat config é o futuro oficial
- ✅ `@typescript-eslint` v8 traz regras mais precisas para TypeScript 5.x (satisfies, const type parameters)
- ✅ `eslint-plugin-react-hooks` v5 com suporte nativo a flat config (sem FlatCompat)
- ✅ Melhor performance em monorepos (sem percorrer diretórios pais)
- ✅ ES Module nativo no arquivo de configuração (import/export em vez de require/module.exports)

### Negativas

- ⚠️ Breaking change — plugins que só suportam ESLint 8 precisam de `FlatCompat` wrapper ou devem ser substituídos
- ⚠️ Curva de aprendizado para equipes acostumadas com `.eslintrc` (sintaxe diferente)
- ⚠️ `eslint-plugin-react` ainda não tem suporte nativo a flat config em v7 — requer `FlatCompat`

### Riscos Identificados

| Risco                                   | Probabilidade | Impacto | Mitigação                                          |
| --------------------------------------- | ------------- | ------- | -------------------------------------------------- |
| Plugin incompatível com ESLint 9        | Média         | Médio   | Usar `FlatCompat` ou substituir plugin             |
| Regra com comportamento diferente v6→v8 | Baixa         | Baixo   | Revisar erros de lint após bump; ajustar overrides |
| VS Code ESLint extension desatualizada  | Baixa         | Baixo   | Atualizar para versão ≥3.0.10 da extensão          |

## 6. Impacto em Integrações e Contratos

### Breaking Changes

- [x] **Remoção do `.eslintrc.cjs`** — substituído por `eslint.config.mjs`
- [x] **Bump de dependências** — `@typescript-eslint` v6→v8, `eslint-plugin-react-hooks` v4→v5
- [x] **Adição de `@eslint/js`** — nova dependência explícita
- [x] **Scripts de lint no `package.json`** — permanecem iguais (`next lint` detecta flat config automaticamente)

### Configuração do CI/CD

O step de lint no pipeline não muda — `next lint` e `eslint .` continuam funcionando com flat config sem alteração de flags.

### Configuração do VS Code

Adicionar ao `.vscode/settings.json` do projeto:

```json
{
  "eslint.useFlatConfig": true
}
```

> A extensão ESLint para VS Code detecta automaticamente o flat config a partir da versão 3.0.10.

## 7. Plano de Rollout/Migração

### Status

✅ **Implementado** — Aplicado no template.base v2.1 (2026-03-30).

### Passos de Migração

```bash
# 1. Remover ESLint 8 e plugins incompatíveis
npm uninstall eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks

# 2. Instalar ESLint 9 e plugins atualizados
npm install --save-dev \
  eslint@^9 \
  @eslint/js@^9 \
  typescript-eslint@^8 \
  eslint-plugin-react-hooks@^5 \
  @eslint/eslintrc@^3

# 3. Renomear e reescrever o arquivo de configuração
# .eslintrc.cjs → eslint.config.mjs (ver template acima)

# 4. Adicionar ao .vscode/settings.json
# "eslint.useFlatConfig": true

# 5. Rodar lint e corrigir regressões
npx eslint . --max-warnings 0
```

### Verificação Pós-migração

```bash
# Verificar versão instalada
npx eslint --version  # deve retornar v9.x

# Verificar que o flat config foi detectado
npx eslint --print-config src/app/page.tsx
# Deve mostrar a configuração sem erros de "config file not found"
```

### Evolução Futura

1. **Remover `FlatCompat`** — Quando `eslint-plugin-react` lançar suporte nativo a flat config
2. **Oxlint como pre-linter** — Avaliar adição de Oxlint para regras rápidas (complementar, não substituto)
3. **Shared config package** — Em contextos de monorepo, extrair `eslint.config.mjs` para pacote compartilhado

## 8. Referências

### Internas

- [ADR-001: Stack Tecnológica](./001-stack-tecnologica.md)
- [Setup Local](../operacao/setup-local.md)

### Externas

- [ESLint Flat Config Migration Guide](https://eslint.org/docs/latest/use/configure/migration-guide)
- [typescript-eslint v8 Release Notes](https://typescript-eslint.io/blog/announcing-typescript-eslint-v8/)
- [eslint-plugin-react-hooks v5 Changelog](https://github.com/facebook/react/blob/main/packages/eslint-plugin-react-hooks/CHANGELOG.md)
- [ESLint 9 Blog Post](https://eslint.org/blog/2024/04/eslint-v9.0.0-released/)

---

## Histórico

| Data       | Autor        | Mudança                                                                    |
| ---------- | ------------ | -------------------------------------------------------------------------- |
| 2026-03-30 | Aero Factory | Criação — migração de ESLint 8 (.eslintrc.cjs) para ESLint 9 (flat config) |

---

_ADR criada no Sprint 8 do Megaplan Template.Base v2.1_
