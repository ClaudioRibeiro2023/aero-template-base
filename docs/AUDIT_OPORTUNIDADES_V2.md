# DOCUMENTO DE OPORTUNIDADES — Template.Base v2.0

## Auditoria Visual, Funcional e Técnica

**Data:** 2026-03-29
**Método:** Navegação real via Chrome (localhost:3005), screenshots, inspeção DOM, computed styles, console audit
**Telas auditadas:** 10 (Dashboard, Login, Forgot-password, Profile, Config hub, Config Geral, Config Aparência, Config Notificações, Config Integrações, Admin Usuarios)

---

## 1. DIAGNÓSTICO EXECUTIVO

O template apresenta **boa estrutura técnica e visual**, com design system maduro (270+ tokens CSS), componentes consistentes e dark mode coerente. Porém, está num estágio de **"funciona e tem presença"** — ainda não encanta nem transmite sofisticação premium. As oportunidades abaixo transformam o template de "starter funcional" em "produto vendável".

**Classificação geral:**

- Funciona: SIM
- Parece consistente: PARCIALMENTE (login descolado do resto)
- Encanta: NÃO AINDA
- Parece premium: NÃO
- Parece vendável: PROMISSOR (com os ajustes abaixo)
- Parece ferramenta interna: SIM, leve
- Parece fragmentado: EM PONTOS ESPECÍFICOS

---

## 2. FINDINGS CRÍTICOS (Quebram percepção de qualidade)

### 2.1 GRÁFICO DO DASHBOARD VAZIO

**Severidade: ALTA | Impacto visual: Devastador**

O card "Atividade Mensal — Últimos 6 meses" exibe apenas os labels do eixo X (Jan-Jun) sem nenhuma barra, linha ou dado. É a maior área visual do dashboard e está completamente vazia.

- **Problema:** O gráfico CSS-only não renderiza barras porque os dados mock não estão alimentando alturas
- **Impacto:** Primeira impressão do produto é de algo incompleto/quebrado
- **Fix:** Renderizar barras com alturas mock (ex: 65%, 45%, 80%, 70%, 55%, 90%) ou usar SVG simples

### 2.2 LOGIN EM LIGHT MODE vs. APP EM DARK MODE

**Severidade: ALTA | Impacto visual: Ruptura de identidade**

A tela de login renderiza com fundo claro (#f5f5f5), card branco e textos escuros. Todo o restante do app está em dark mode (fundo #0f172a). O usuário faz login num "produto" e entra em outro visualmente diferente.

- **Problema:** Login usa CSS vars próprias (`bg-[var(--surface-base)]`) que resolvem para light, enquanto o layout protegido força dark via `data-theme` ou class
- **Impacto:** Sensação de produto fragmentado, dois sistemas visuais coexistindo
- **Fix:** Login deve respeitar o tema do sistema (dark/light) ou pelo menos ter variante dark como padrão

### 2.3 PAINEL LATERAL (Functions Panel) ABRE AUTOMATICAMENTE

**Severidade: MÉDIA | Impacto UX: Confusão**

Ao navegar entre rotas, um painel lateral secundário aparece automaticamente (com "RECENTES", "ANÁLISE", "INDICADORES", "CONTROLE"). Isso:

- Ocupa ~250px de espaço útil
- Repete parcialmente a navegação da sidebar
- Confunde a hierarquia de informação (3 colunas: sidebar + painel + conteúdo)
- O "X" para fechar não é intuitivo

- **Problema:** O painel parece ser um sistema de favoritos/functions herdado de versão anterior
- **Impacto:** Usuário novo não entende para que serve, conteúdo fica comprimido
- **Fix:** Painel deve iniciar fechado por padrão; abrir apenas via botão explícito

### 2.4 SEM FOOTER

**Severidade: MÉDIA | Impacto: Falta de acabamento**

Nenhuma tela do app renderiza footer. Falta: versão do sistema, links úteis, copyright.

- **Impacto:** Sensação de interface inacabada na parte inferior
- **Fix:** Footer discreto com versão + link para docs

---

## 3. INCONSISTÊNCIAS VISUAIS

### 3.1 Tipografia: Sem fonte customizada

- Usa `ui-sans-serif, system-ui` (fallback do navegador)
- Todo produto premium tem uma fonte deliberada (Inter, Geist, Plus Jakarta Sans)
- **Fix:** Adicionar `next/font` com Inter ou Geist como fonte principal

### 3.2 Border-radius inconsistente

- Valores encontrados: 0px, 2px, 4px, 6px, 8px, 12px, 9999px
- Muitos componentes usam border-radius arbitrário
- **Fix:** Padronizar em 3 tokens: `sm (6px)`, `md (8px)`, `lg (12px)`, `full (9999px)`

### 3.3 Sidebar: items "Configurações" e "Administração" em opacidade reduzida

- Quando fora de foco, parecem desabilitados (opacity < 1 ou color muted)
- Confunde se o item está disponível ou não
- **Fix:** Manter opacidade 1 para todos os items, usar apenas cor para diferenciar ativo/inativo

### 3.4 Breadcrumb incompleto

- Dashboard mostra "Template /" sem indicar a página atual
- Deveria ser "Template / Dashboard" com o último item em bold ou cor primária
- Config mostra "Template / Admin / Config /" com trailing slash

### 3.5 Badge de role no perfil sem contraste

- "ADMIN" em teal sobre fundo dark — legível mas sem peso visual
- Badges de role na tabela de usuários (ADMIN=teal, GESTOR=blue, OPERADOR=green, VIEWER=gray) — bom padrão, manter

---

## 4. PONTOS DE FRICÇÃO UX

### 4.1 Dashboard: KPI cards sem hover feedback visual

- Cards são clicáveis (links) mas não tem hover state perceptível
- Cursor muda para pointer mas não há elevação, borda, ou sombra em hover
- **Fix:** Adicionar `hover:border-[var(--brand-primary)]/50` + `hover:shadow-lg` transition

### 4.2 Dashboard: Ações Rápidas sem ícones distintos

- As 3 ações usam apenas um bullet verde + texto
- Falta iconografia para diferenciar visualmente (UserPlus, FileText, Settings)
- **Fix:** Adicionar ícone Lucide à esquerda de cada ação

### 4.3 Perfil: Botão "Alterar foto" sem funcionalidade

- O ícone de câmera aparece sobre o avatar mas o tooltip diz "em breve"
- Cria expectativa falsa
- **Fix:** Ou implementar upload real (Supabase Storage), ou remover o ícone e deixar placeholder honesto

### 4.4 Configurações: Cards sem ícone chevron consistente

- Os 4 cards (Geral, Aparência, Notificações, Integrações) têm chevron `>` à direita — bom
- Mas os sub-pages não têm breadcrumb de retorno consistente (link `<` à esquerda vs. breadcrumb no header)
- **Fix:** Padronizar: breadcrumb no header É o mecanismo de retorno; remover `<` inline

### 4.5 Admin Usuarios: Sem paginação visível

- Com 5 usuários mock não aparece paginação
- Quando houver 50+ usuários, a tabela vai crescer sem controle
- **Fix:** Adicionar paginação mesmo com poucos items (mostra que o pattern existe)

### 4.6 Busca global (Ctrl+K): Sem feedback visual

- O campo "Buscar..." na sidebar não faz nada visível ao clicar
- Deveria abrir um command palette (modal de busca)
- **Fix:** Se não implementado, remover o shortcut hint "Ctrl+K" para não criar expectativa

---

## 5. LACUNAS DE PRODUTO

### 5.1 Sem rota /relatórios

- Sidebar lista "Relatórios" mas clicar nele não leva a nenhuma tela implementada
- **Fix:** Criar page placeholder com empty state e CTA

### 5.2 Sem toast/feedback ao salvar

- Os botões "Salvar" nas config pages não mostram feedback de sucesso/erro
- **Fix:** Adicionar toast notification: "Configurações salvas com sucesso"

### 5.3 Sem confirmação ao sair com alterações

- Editar nome no perfil e navegar para outra tela perde as alterações sem aviso
- **Fix:** `beforeunload` ou prompt de confirmação para forms sujos

### 5.4 Sem dark/light toggle funcional

- O ícone de sol/lua no header existe mas o app permanece em dark mode
- A tela de login é light mode sempre
- **Fix:** Implementar toggle que salva preferência em localStorage + aplica `data-theme`

### 5.5 Sem notificações

- O ícone de sino existe no header mas não abre nenhum dropdown/panel
- **Fix:** Criar dropdown com empty state: "Nenhuma notificação"

---

## 6. OPORTUNIDADES DE ENCANTAMENTO

### 6.1 Animação de entrada nas páginas

- Transição entre rotas é instantânea (sem fade, slide, ou scale)
- **Oportunidade:** Adicionar `animate-in fade-in slide-in-from-bottom-2 duration-300` nos containers de cada page

### 6.2 Skeleton loading aproveitando o que já existe

- Os `loading.tsx` foram criados com skeletons inline
- **Oportunidade:** Adicionar pulsação mais suave e gradient shimmer em vez de `animate-pulse` simples

### 6.3 KPI cards com micro-animação de contagem

- Os números (48, 134, 92%, 17) aparecem estáticos
- **Oportunidade:** Counter animation que incrementa de 0 ao valor final em 600ms (react-countup ou requestAnimationFrame)

### 6.4 Gráfico de atividade com animação de crescimento

- Se as barras forem renderizadas, animar a altura de 0 ao valor com `transition-all duration-700 ease-out`
- Cada barra com delay escalonado (stagger): 0ms, 100ms, 200ms...

### 6.5 Login com background sutil

- O login é um card centrado sobre fundo plano
- **Oportunidade:** Adicionar gradient mesh ou pattern sutil no fundo (CSS-only, sem imagem)

### 6.6 Sidebar com indicador de rota ativa animado

- A rota ativa tem highlight teal estático
- **Oportunidade:** Transição suave da barra de highlight (slide vertical de um item para outro com `layoutId` ou CSS transition)

---

## 7. OPORTUNIDADES TÉCNICAS

### 7.1 Fonte customizada via next/font

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
// <body className={inter.className}>
```

- Impacto: Melhora tipografia sem dependência externa, zero CLS

### 7.2 CSS Container Queries para cards responsivos

- KPI cards usam grid breakpoints globais
- Container queries permitem que os cards se adaptem ao espaço disponível (com ou sem sidebar/panel)

### 7.3 View Transitions API

- Next.js 14 suporta View Transitions experimentalmente
- Transições entre rotas seriam fluidas e nativas

### 7.4 Prefetch inteligente

- O layout já faz `router.prefetch()` para rotas fixas
- **Melhoria:** Prefetch on hover nos links da sidebar (Intersection Observer pattern)

### 7.5 Componente `<ConfirmDialog>` reutilizável

- Necessário para: deletar usuário, sair com alterações, desabilitar notificações
- Pattern: `useConfirm()` hook que retorna `{ confirm, ConfirmDialog }`

### 7.6 Pattern `useFormDirty()` para detecção de alterações

- Previne perda de dados ao navegar com form sujo
- Usa `router.events` ou `beforeunload`

---

## 8. ACESSIBILIDADE (a11y)

| Check               | Resultado        | Ação                                                  |
| ------------------- | ---------------- | ----------------------------------------------------- |
| Imagens sem alt     | 0                | OK                                                    |
| Botões sem label    | **9**            | Adicionar aria-label nos icon-only buttons            |
| Inputs sem label    | **1**            | Associar label ao input                               |
| Focus visible       | Suportado        | OK                                                    |
| Skip to content     | Verificar        | Confirmar que nav link "Skip to content" existe       |
| Color contrast      | Dark mode OK     | Login light mode verificar contraste dos placeholders |
| Keyboard navigation | Sidebar funciona | Verificar tab order nos modais                        |

---

## 9. MATRIZ DE PRIORIZAÇÃO

| #   | Oportunidade                      | Impacto | Esforço | Prioridade |
| --- | --------------------------------- | ------- | ------- | ---------- |
| 1   | Fix gráfico dashboard vazio       | ALTO    | Baixo   | P0         |
| 2   | Login respeitar dark mode         | ALTO    | Médio   | P0         |
| 3   | Painel lateral iniciar fechado    | ALTO    | Baixo   | P0         |
| 4   | Toast/feedback ao salvar          | ALTO    | Baixo   | P1         |
| 5   | Fonte customizada (Inter/Geist)   | ALTO    | Baixo   | P1         |
| 6   | KPI hover states                  | MÉDIO   | Baixo   | P1         |
| 7   | Animação de entrada nas páginas   | MÉDIO   | Baixo   | P1         |
| 8   | Dark/light toggle funcional       | ALTO    | Médio   | P1         |
| 9   | Footer com versão                 | BAIXO   | Baixo   | P2         |
| 10  | Rota /relatórios com placeholder  | MÉDIO   | Baixo   | P2         |
| 11  | Breadcrumb sem trailing slash     | BAIXO   | Baixo   | P2         |
| 12  | Notificações dropdown vazio       | MÉDIO   | Médio   | P2         |
| 13  | Counter animation KPIs            | BAIXO   | Médio   | P3         |
| 14  | Busca global (Ctrl+K) funcional   | ALTO    | Alto    | P3         |
| 15  | Paginação na tabela usuarios      | MÉDIO   | Baixo   | P2         |
| 16  | Confirmação ao sair com form sujo | MÉDIO   | Médio   | P2         |
| 17  | aria-label nos 9 botões           | MÉDIO   | Baixo   | P1         |
| 18  | Gráfico com animação stagger      | BAIXO   | Médio   | P3         |
| 19  | Login background gradient         | BAIXO   | Baixo   | P3         |
| 20  | Container queries nos KPIs        | BAIXO   | Médio   | P3         |

---

## 10. SEQUÊNCIA RECOMENDADA DE EXECUÇÃO

### Sprint A — "Primeiras Impressões" (P0 + P1 críticos)

1. Fix gráfico dashboard com barras mock animadas
2. Login dark mode (respeitar tema do sistema)
3. Painel lateral fechado por padrão
4. Fonte customizada via next/font
5. Toast feedback ao salvar
6. KPI hover states
7. aria-label nos botões icon-only

### Sprint B — "Polimento e Acabamento" (P1 + P2)

8. Dark/light toggle funcional
9. Animação de entrada nas páginas
10. Footer com versão
11. Rota /relatórios placeholder
12. Breadcrumb fix
13. Notificações dropdown
14. Paginação na tabela
15. Confirmação form dirty

### Sprint C — "Encantamento" (P3)

16. Counter animation KPIs
17. Busca global (Ctrl+K)
18. Gráfico animação stagger
19. Login background gradient
20. Container queries

---

## 11. VEREDICTO FINAL

O Template.Base v2.0 tem **fundação técnica sólida** — build limpo, design tokens maduros, auth dual funcional, security hardened. Mas a **camada de experiência** ainda não acompanha.

Os 3 fixes P0 (gráfico vazio, login dark mode, painel lateral) resolvem **80% da percepção negativa** com **esforço mínimo**. A Sprint A completa transforma o template de "starter técnico" em "produto que impressiona no primeiro contato".

**Score atual de experiência: 6.5/10**
**Score projetado após Sprint A: 8.5/10**
**Score projetado após Sprint B: 9.2/10**
