# Template.Base v3.0 — Plano de Overhaul Visual

**Autora:** Sofia (Engenheira Frontend, Aero Studio)
**Data:** 2026-03-31
**Status:** Proposta para aprovacao
**Restricao:** A pagina de login (`apps/web/app/login/page.tsx`) NAO sera tocada.

---

## A) Direcao Visual Proposta

### Estilo Geral: "Dark Glass Engineering"

A direcao visual combina tres escolas de design que dominam 2025-2026:

1. **Linear-style calm interface** — sidebar discreta, hierarquia via luminosidade (nao cor), reducao de ruido visual, tipografia como protagonista
2. **Dark glassmorphism refinado** — paineis translucidos com backdrop-blur sobre gradients ambientais sutis, bordas 1px rgba brancas, noise texture overlay
3. **Vercel-style data density** — metricas limpas, espaco generoso, monocromatico com accents pontuais, zero decoracao desnecessaria

O resultado: um dashboard que parece um cockpit de engenharia premium — escuro, preciso, com profundidade sutil e accents que guiam o olho sem gritar.

### Paleta de Cores Premium (Dark-First)

A paleta atual (teal `#0087A8` / dark teal `#005F73` / mint `#94D2BD`) e solida mas precisa de ajustes para o visual premium dark-first:

```
── BACKGROUNDS ──────────────────────────────────────────
--bg-root:           #09090b          (zinc-950, fundo absoluto)
--bg-surface:        #18181b          (zinc-900, cards/panels)
--bg-elevated:       #27272a          (zinc-800, hover states, dropdowns)
--bg-muted:          #3f3f46          (zinc-700, dividers, subtle fills)

── GLASS SURFACES ───────────────────────────────────────
--glass-bg:          rgba(24, 24, 27, 0.72)     (painel glassmorphism)
--glass-border:      rgba(255, 255, 255, 0.06)  (borda sutil glass)
--glass-border-hover:rgba(255, 255, 255, 0.12)  (borda hover)
--glass-blur:        12px                         (backdrop-filter blur)
--glass-noise:       url('/noise.svg') 0.03       (noise texture opacity)

── BRAND (manter identidade, ajustar luminosidade) ─────
--brand-primary:     #00b4d8          (cyan vibrante, +brilho vs atual)
--brand-primary-dim: #0087a8          (cyan original, uso em textos)
--brand-glow:        rgba(0, 180, 216, 0.15)  (glow para focus/hover)
--brand-glow-strong: rgba(0, 180, 216, 0.30)  (glow para active)

── ACCENT COLORS ────────────────────────────────────────
--accent-purple:     #a78bfa          (violet-400, para badges/tags)
--accent-amber:      #fbbf24          (amber-400, warnings)
--accent-emerald:    #34d399          (emerald-400, success)
--accent-rose:       #fb7185          (rose-400, errors/alerts)

── TEXT ─────────────────────────────────────────────────
--text-primary:      #fafafa          (zinc-50)
--text-secondary:    #a1a1aa          (zinc-400)
--text-muted:        #71717a          (zinc-500)
--text-disabled:     #52525b          (zinc-600)

── BORDERS ──────────────────────────────────────────────
--border-default:    rgba(255, 255, 255, 0.06)
--border-strong:     rgba(255, 255, 255, 0.12)
--border-focus:      var(--brand-primary)
```

### Gradients Ambientais (para dar vida ao glass)

Glassmorphism so funciona com algo por tras do vidro. Gradients ambientais sutis no fundo da pagina:

```css
.ambient-gradient {
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(ellipse 600px 400px at 20% 10%, rgba(0, 180, 216, 0.06), transparent),
    radial-gradient(ellipse 500px 500px at 80% 80%, rgba(167, 139, 250, 0.04), transparent),
    radial-gradient(ellipse 400px 300px at 50% 50%, rgba(52, 211, 153, 0.03), transparent);
  pointer-events: none;
}
```

### Tipografia

**Inter** e suficiente como fonte principal — e a mesma usada por Linear, Vercel, Stripe e Raycast. Porem, complementar com:

- **JetBrains Mono** para dados numericos, KPIs, tabelas de dados, badges de codigo — reforcar o carater tecnico/engineering
- **Inter Variable** (em vez de Inter statico) — permite optical-sizing e weight variavel (300-700) para hierarquia mais fina

```css
--font-sans: 'Inter Variable', 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

Escala tipografica:

```
--text-xs:    0.6875rem / 11px    (badges, meta)
--text-sm:    0.8125rem / 13px    (body secundario, labels)
--text-base:  0.875rem  / 14px    (body principal — density compacta)
--text-lg:    1rem      / 16px    (titulos de secao)
--text-xl:    1.25rem   / 20px    (titulos de pagina)
--text-2xl:   1.5rem    / 24px    (KPI values)
--text-3xl:   2rem      / 32px    (hero numbers)
```

### Espacamento e Density

Abordagem **"comfortable compact"** — inspirada no Linear (nao apertado como terminal, nao espacado como marketing page):

```
--space-0:  0px
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
```

- Padding interno de cards: 20px (--space-5)
- Gap entre cards em grid: 16px (--space-4)
- Padding de pagina: 24px mobile, 32px desktop
- Altura de linhas de tabela: 44px (toque confortavel)
- Sidebar item height: 36px

### Cantos, Sombras, Bordas

```css
/* Cantos */
--radius-sm:
  6px (badges, inputs) --radius-md: 8px (buttons, small cards) --radius-lg: 12px (cards, panels)
    --radius-xl: 16px (modais, sections) --radius-full: 9999px (pills, avatars)
    /* Sombras — layered para profundidade real */ --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3),
  0 1px 3px rgba(0, 0, 0, 0.15);

--shadow-md:
  0 2px 4px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.03);

--shadow-lg:
  0 4px 8px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.25), 0 16px 32px rgba(0, 0, 0, 0.15),
  0 0 0 1px rgba(255, 255, 255, 0.05);

--shadow-glow: 0 0 20px var(--brand-glow), 0 0 40px rgba(0, 180, 216, 0.05);

/* Bordas: 1px com rgba (nao solid colors) */
border: 1px solid var(--glass-border);
```

### Backdrop Effects

```css
/* Glass panel base */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.2);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
}

/* Noise texture overlay (sutil, 3% opacity) */
.glass-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: url('/textures/noise.svg');
  opacity: 0.03;
  pointer-events: none;
  mix-blend-mode: overlay;
}
```

---

## B) Componentes a Redesenhar

### 1. Sidebar — "Translucent Rail"

**Estado atual:** Sidebar solid com `sidebar-gradient`, 256px expanded, 64px collapsed. Funcional mas visualmente flat.

**Proposta:**

```
EXPANDED (240px):
┌──────────────────────┐
│  [Logo] App Name   ← │  h:48px, glass-bg, border-b
├──────────────────────┤
│  🔍 Buscar...  ⌘K    │  h:36px, input glass sutil
├──────────────────────┤
│                       │
│  PRINCIPAL            │  label: text-xs, uppercase, tracking-wide
│  ● Dashboard          │  active: bg-brand-primary/12, text-brand, barra esq 2px
│  ○ Relatorios         │  hover: bg-white/4, text-white/80
│  ○ Atividade          │
│                       │
│  ADMINISTRACAO        │
│  ○ Usuarios     BETA  │  badge: amber pill
│  ○ Config             │
│                       │
│  ──────────────────   │  separator: rgba(255,255,255,0.06)
│                       │
│  SISTEMA              │
│  ○ Auditoria          │
│  ○ Integracao         │
├──────────────────────┤
│  [AV] Claudio R.  ⚙ ▸│  h:52px, avatar + nome + settings + logout
└──────────────────────┘

COLLAPSED (56px):
Apenas icones centrados, tooltip on hover (glass panel com seta)
```

**Detalhes visuais:**

- Background: `rgba(9, 9, 11, 0.85)` com `backdrop-filter: blur(16px) saturate(1.3)`
- Borda direita: `1px solid rgba(255,255,255,0.06)`
- Item ativo: background `rgba(0, 180, 216, 0.12)`, texto `#00b4d8`, barra lateral esquerda `2px solid #00b4d8` com `border-radius: 0 2px 2px 0`
- Item hover: background `rgba(255,255,255,0.04)`, transicao `150ms ease-out`
- Item icon size: 18px (ativo: ligeiro scale 1.05)
- Notification badge: `min-w-[16px] h-[16px]`, bg-rose-500, ring-2 ring-[var(--bg-root)]
- Transicao collapse/expand: `width 250ms cubic-bezier(0.4, 0, 0.2, 1)`, labels fade com `opacity 150ms`
- Separadores de grupo: `1px solid rgba(255,255,255,0.04)`, margin `8px 12px`
- Logo area: `w-8 h-8`, border-radius: 10px, glow sutil on hover
- Search trigger: border `1px solid rgba(255,255,255,0.06)`, background `rgba(255,255,255,0.03)`, kbd tag com mono font

### 2. Header — "Slim Command Bar"

**Estado atual:** 56-64px, breadcrumb + search + notifs + theme toggle + language. Funcional mas generico.

**Proposta:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Home / Admin / Usuarios          [🔍 ⌘K]  [🌐]  [🔔 3]  [AV] │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
  h: 52px
  bg: transparent (sem background — glass vem do content area)
  border-bottom: 1px solid rgba(255,255,255,0.06)
```

**Detalhes visuais:**

- Altura reduzida para 52px (de 56-64px)
- Background: **transparente** — o header e apenas uma barra de ferramentas sobre o content, sem background proprio
- Breadcrumb: separador `/` em text-muted, items clickaveis em text-secondary, ultimo item em text-primary font-medium
- Search button: ghost style, hover bg-white/4, icon 18px
- Notification bell: posicao relativa, badge count como dot vermelho se < 10, numero se >= 10
- Avatar: 28px, rounded-full, border 2px solid rgba(255,255,255,0.1), hover border-brand-primary/40
- Acoes com gap de 4px entre elas (mais compacto)
- Sem theme toggle no header — mover para settings page (dark-first, nao precisa ficar no header)

### 3. Dashboard KPI Cards — "Bento Glass Grid"

**Estado atual:** 4 cards em grid, com border, hover translate-y, change badges. Funcional mas basico.

**Proposta — Bento Grid Layout:**

```
┌────────────────────────┬──────────────────┐
│                        │                  │
│   USUARIOS     48      │  RELATORIOS 134  │
│   ▲ +12%  ~~~~~~~~~~~~ │  ▲ +5%  ~~~~~~~~ │
│   [sparkline 7 dias]   │  [sparkline]     │  h: ~140px
│                        │                  │
├────────────┬───────────┼──────────────────┤
│            │           │                  │
│  ATIVIDADE │ CONFIG    │  CHART AREA      │
│   92%      │  17       │  (spans 2 rows)  │
│   ▼ -2%    │  → 0%     │                  │  h: ~100px
│            │           │                  │
└────────────┴───────────┴──────────────────┘
```

**Detalhes visuais por card:**

- Background: `var(--glass-bg)` com `backdrop-filter: blur(12px)`
- Border: `1px solid var(--glass-border)`, hover: `var(--glass-border-hover)`
- Border-radius: 12px
- Padding: 20px
- Hover: `translateY(-2px)` + `shadow-lg` + border brightens para `rgba(255,255,255,0.12)`
- KPI value: `font-mono text-2xl font-bold`, cor `text-primary`
- KPI label: `text-sm text-muted`, abaixo do valor
- Change badge: pill com icone seta (12px), fundo `success/10%` ou `error/10%`, texto `success` ou `error`
- **Sparkline**: SVG inline 80x24px, 7 pontos ultimos 7 dias, stroke `var(--brand-primary)` 1.5px, fill gradient para baixo com 10% opacity, animate draw on mount com `stroke-dashoffset`
- **Glow sutil no hover**: `box-shadow: 0 0 24px var(--brand-glow)` — apenas visivel no hover, transicao 200ms
- **Count-up animation**: numeros animam de 0 ao valor final em 800ms com ease-out cubic (ja existe, manter)

### 4. Tabelas — "Data Grid Premium"

**Estado atual:** Tabela HTML basica com hover row, badges de role, paginacao simples.

**Proposta:**

```
┌──────────────────────────────────────────────────────────────┐
│  Nome          Email              Role       Status    Acoes │  header: sticky
├──────────────────────────────────────────────────────────────┤
│  [AV] Admin    admin@t.dev        ADMIN ●    ● Ativo    ✎   │  row h: 48px
│  [AV] Gestor   gestor@t.dev       GESTOR ●   ● Ativo    ✎   │  hover: bg-white/[0.02]
│  [AV] Op 1     op1@t.dev          OPER ●     ● Ativo    ✎   │
│  [AV] Viewer   viewer@t.dev       VIEW ●     ○ Inativo  ✎   │  inativo: opacity 0.6
├──────────────────────────────────────────────────────────────┤
│  Mostrando 4 de 5          ◄ Pagina 1 de 1 ►               │
└──────────────────────────────────────────────────────────────┘
```

**Detalhes visuais:**

- Container: `rounded-xl`, glass-panel, overflow hidden
- Header row: `bg-white/[0.02]`, `text-xs font-medium uppercase tracking-wider text-muted`, sticky top
- Sort indicators: chevron up/down 10px ao lado do header label, active = `text-brand-primary`
- Body rows: height 48px, `border-b border-white/[0.04]`
- Hover row: `bg-white/[0.02]`, transicao `100ms`
- Avatar inline: 28px, bg-brand/10, text-brand, font-mono font-semibold
- Role badges: pill `px-2 py-0.5 rounded-md text-[11px] font-medium`, cores por role com fundo 10% opacity
- Status dot: `w-2 h-2 rounded-full`, ativo: `bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]` (glow sutil), inativo: `bg-zinc-600`
- Action buttons: ghost icon buttons 28px, hover: bg-white/[0.06]
- Pagination: buttons ghost com border `rgba(255,255,255,0.08)`, disabled opacity 0.3
- Empty state: icone 48px em text-muted, texto "Nenhum resultado", sugestao de acao
- **Selecao de rows**: checkbox a esquerda (futuro), selected row: `bg-brand-primary/5 border-l-2 border-brand-primary`

### 5. Modais — "Focus Overlay"

**Estado atual:** Backdrop blur, rounded-xl, shadow-2xl. Funcional.

**Proposta de upgrade:**

- Backdrop: `bg-black/70 backdrop-filter: blur(8px)` (aumentar blur de 4px para 8px)
- Entry animation: `scale(0.96) opacity(0)` → `scale(1) opacity(1)`, `250ms cubic-bezier(0.16, 1, 0.3, 1)` (ease-out expo)
- Exit animation: `scale(1) opacity(1)` → `scale(0.98) opacity(0)`, `150ms ease-in`
- Modal panel: glass-panel com `border: 1px solid rgba(255,255,255,0.08)`
- **Glow border sutil**: `box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 0 40px rgba(0,0,0,0.5)`
- Header: `border-b border-white/[0.06]`, padding `px-6 py-4`
- Close button: ghost, 32px, hover `bg-white/[0.06]`, `transition 150ms`
- Footer actions: `border-t border-white/[0.06]`, padding `px-6 py-4`
- Max-width: `sm` (420px) para forms, `md` (560px) para confirmacoes complexas, `lg` (720px) para previews
- Mobile: full-width com `rounded-t-xl` e slide up from bottom

### 6. Cards Gerais — "Glass Tile"

Estilo padrao para qualquer card no sistema:

```css
.card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px) saturate(1.2);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg); /* 12px */
  padding: var(--space-5); /* 20px */
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  border-color: var(--glass-border-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
```

- **Gradient border sutil** (opcional, para cards destaque):

```css
.card-featured {
  position: relative;
  border: none;
}
.card-featured::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: var(--radius-lg);
  background: linear-gradient(
    135deg,
    rgba(0, 180, 216, 0.3),
    rgba(167, 139, 250, 0.2),
    rgba(0, 180, 216, 0.1)
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
```

### 7. Formularios — "Minimal Focus"

**Estado atual:** Inputs basicos com border e bg-surface.

**Proposta:**

- Input base: `h-10`, `rounded-lg` (8px), `border: 1px solid var(--border-default)`, `bg: rgba(255,255,255,0.02)`
- Focus state: `border-color: var(--brand-primary)`, `ring: 0 0 0 3px var(--brand-glow)`, transicao `150ms`
- Hover (pre-focus): `border-color: rgba(255,255,255,0.12)`
- Label: `text-sm font-medium text-secondary`, margin-bottom `6px`
- **Floating label** (opcional, para formularios densos): label dentro do input que anima para cima on focus/filled
- Placeholder: `text-muted`, desaparece on focus (nao on type)
- Error state: `border-color: var(--accent-rose)`, `ring: 0 0 0 3px rgba(251,113,133,0.15)`, mensagem de erro em `text-xs text-rose-400` com icone inline
- Success state: `border-color: var(--accent-emerald)`, checkmark icon animado (scale 0 → 1 em 200ms com spring)
- Select: mesmo estilo que input, chevron down customizado, dropdown com glass-panel
- Textarea: mesmas regras, `min-h-[100px]`, resize vertical only
- Toggle/Switch: `w-10 h-5`, rounded-full, inativo `bg-zinc-700`, ativo `bg-brand-primary`, thumb `w-4 h-4 bg-white shadow-sm`, transicao `200ms spring`

### 8. Empty States — "Calm Void"

**Proposta:**

- Container: centralizado vertical e horizontal, max-w-[320px]
- Ilustracao: **Icone Lucide 48px** em `text-zinc-600` (nao SVG ilustracao pesada — manter leve)
- Alternativa: **dot pattern** ou **grid pattern** como fundo sutil atras do icone
- Titulo: `text-base font-medium text-secondary`
- Descricao: `text-sm text-muted`, max 2 linhas
- CTA button: `btn-primary` ou `btn-ghost` dependendo do contexto
- Animacao on mount: `fadeIn + slideInUp`, 300ms, ease-out

```
         ┌───────────────────┐
         │                   │
         │      [📋 48px]    │
         │                   │
         │  Nenhum resultado │
         │  encontrado       │
         │                   │
         │  Tente ajustar    │
         │  os filtros       │
         │                   │
         │  [ Limpar filtros ]│
         └───────────────────┘
```

### 9. Loading States — "Ghost Shimmer"

**Estado atual:** `animate-pulse` basico.

**Proposta:**

```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 25%,
    rgba(255, 255, 255, 0.06) 50%,
    rgba(255, 255, 255, 0.03) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}
```

- Skeleton shapes devem imitar o layout real (nao blocos genericos)
- Cards skeleton: contorno do card com 3-4 linhas skeleton dentro
- Table skeleton: linhas com alturas reais, avatars circulares, badges retangulares
- KPI skeleton: numero grande + label + sparkline placeholder
- Adicionar `aria-busy="true"` e `aria-label="Carregando"` nos containers

### 10. Notificacoes/Toasts — "Slide Beam"

**Proposta:**

- Posicao: bottom-right (desktop), bottom-center (mobile)
- Container: glass-panel, max-w-[380px], padding 14px 16px
- Entry: slide de `translateX(100%)` para `translateX(0)` + `opacity 0→1`, 300ms ease-out expo
- Exit: `translateX(100%)` + `opacity 0`, 150ms ease-in
- Stack: multiple toasts empilham com gap 8px, animacao de reposicao
- Icone: 20px a esquerda, cor semantica (emerald/amber/rose/blue)
- Progress bar: barra fina (2px) no bottom do toast, bg-brand-primary, anima de 100% → 0% width
- Tipos:
  - **Success**: borda esquerda 3px solid emerald-400, icone CheckCircle
  - **Warning**: borda esquerda 3px solid amber-400, icone AlertTriangle
  - **Error**: borda esquerda 3px solid rose-400, icone XCircle
  - **Info**: borda esquerda 3px solid blue-400, icone Info
- Dismiss: botao X ghost 24px, top-right, hover bg-white/[0.06]
- Auto-dismiss: 5000ms default, pausar on hover

---

## C) Micro-interacoes Premium

### 1. Page Transitions

```tsx
// Com motion (ex-framer-motion)
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.15 } },
}

// Wrap no layout:
<AnimatePresence mode="wait">
  <motion.div key={pathname} variants={pageVariants} initial="initial" animate="enter" exit="exit">
    {children}
  </motion.div>
</AnimatePresence>
```

**Alternativa CSS-only** (mais leve, ja implementada parcialmente):

```css
@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.page-enter {
  animation: page-enter 0.3s cubic-bezier(0, 0, 0.2, 1);
}
```

### 2. Card Hover — Tilt 3D Sutil + Glow Follow Cursor

```tsx
// Hook: useCardTilt — aplica rotateX/rotateY baseado na posicao do mouse
function useCardTilt(ref: RefObject<HTMLElement>, intensity = 4) {
  // Em mousemove: calcular rotateX e rotateY baseado na posicao relativa
  // rotateX = (y - centerY) / height * intensity (max 4deg)
  // rotateY = (x - centerX) / width * -intensity (max 4deg)
  // Em mouseleave: reset para rotateX(0) rotateY(0) em 300ms spring
  // Transform: perspective(600px) rotateX(Xdeg) rotateY(Ydeg) translateZ(2px)
}

// Glow follow cursor:
// Div absolute no card com radial-gradient centrado na posicao do mouse
// background: radial-gradient(300px at mouseX mouseY, var(--brand-glow), transparent)
// opacity: 0 → 1 on hover, transition 200ms
```

**Nota de performance:** Usar `transform3d` para GPU acceleration, throttle mousemove a 60fps via rAF.

### 3. Button Press Animations

```css
.btn-primary {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-primary:hover {
  box-shadow: 0 0 20px var(--brand-glow);
}
.btn-primary:active {
  transform: scale(0.97);
  box-shadow: 0 0 10px var(--brand-glow);
  transition-duration: 50ms;
}
```

Icone dentro de botao: `transition: transform 150ms`, on hover `translateX(2px)` para icones de seta.

### 4. Scroll-Linked Animations

- **Header compacta on scroll**: quando scrollY > 20px, header height anima de 52px para 44px, font-size diminui levemente, opacity do breadcrumb reduce
- **Fade-in on scroll**: elementos que entram na viewport animam com `IntersectionObserver`, `opacity 0 translateY(12px)` → `opacity 1 translateY(0)`, stagger 50ms entre siblings
- **Parallax sutil**: gradient ambientais movem a 0.3x da velocidade do scroll

### 5. Count-Up Animations nos KPIs

Ja implementado no template atual com `useCountUp`. Manter, mas ajustar:

- Duracao: 800ms → 600ms (mais snappy)
- Easing: cubic ease-out → spring-like `cubic-bezier(0.16, 1, 0.3, 1)` (expo ease-out)
- **Decimal formatting**: numeros > 1000 mostram como "1.2k" com animacao
- **Suffix animation**: "%" ou "k" aparece com slight delay (50ms) e fade-in separado

### 6. Accordion/Expand

```tsx
// Motion:
<motion.div
  initial={false}
  animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
  transition={{ height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.15 } }}
  style={{ overflow: 'hidden' }}
>
  {children}
</motion.div>
```

Chevron de toggle: `rotate(0)` → `rotate(180deg)`, transicao `200ms ease-out`.

### 7. Stagger Children (Listas e Grids)

```tsx
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
}
```

Aplicar em: KPI cards, table rows (on first load), sidebar items, notification stack.

### 8. Command Palette (Cmd+K)

A GlobalSearch ja existe. Upgrades visuais:

- Backdrop: `bg-black/60 backdrop-blur(12px)`
- Panel: glass-panel, `max-w-[560px]`, `rounded-xl`
- Input: `h-12`, `text-lg`, icone Search 20px, sem border, foco automatico
- Results: `max-h-[400px] overflow-y-auto`, items com `h-10`, hover `bg-white/[0.04]`
- Sections: labels `text-xs uppercase text-muted` separando "Paginas", "Acoes", "Usuarios"
- Keyboard nav: highlight ativo com `bg-white/[0.06] border-l-2 border-brand-primary`
- Entry animation: `scale(0.96) opacity(0)` → `scale(1) opacity(1)`, 200ms

---

## D) Tokens de Design Atualizados

### Novas Sombras

```ts
export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(0,0,0,0.2)',
  sm: '0 1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.15)',
  md: '0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.03)',
  lg: '0 4px 8px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.25), 0 16px 32px rgba(0,0,0,0.15)',
  xl: '0 8px 16px rgba(0,0,0,0.3), 0 24px 48px rgba(0,0,0,0.25), 0 32px 64px rgba(0,0,0,0.15)',
  glow: {
    brand: '0 0 20px rgba(0,180,216,0.15), 0 0 40px rgba(0,180,216,0.05)',
    success: '0 0 20px rgba(52,211,153,0.15)',
    error: '0 0 20px rgba(251,113,133,0.15)',
    purple: '0 0 20px rgba(167,139,250,0.15)',
  },
  // "Color shadows" — a sombra herda a cor do elemento
  colored: (color: string, opacity = 0.25) =>
    `0 4px 12px ${color}${Math.round(opacity * 255).toString(16)}`,
} as const
```

### Novos Gradients

```ts
export const gradients = {
  // Mesh-style backgrounds
  ambient: {
    primary: 'radial-gradient(ellipse 600px 400px at 20% 10%, rgba(0,180,216,0.06), transparent)',
    secondary:
      'radial-gradient(ellipse 500px 500px at 80% 80%, rgba(167,139,250,0.04), transparent)',
    tertiary: 'radial-gradient(ellipse 400px 300px at 50% 50%, rgba(52,211,153,0.03), transparent)',
  },
  // Border gradients (para cards featured)
  border: {
    brand:
      'linear-gradient(135deg, rgba(0,180,216,0.3), rgba(167,139,250,0.2), rgba(0,180,216,0.1))',
    warm: 'linear-gradient(135deg, rgba(251,113,133,0.3), rgba(251,191,36,0.2), rgba(251,113,133,0.1))',
  },
  // Text gradients (para titulos hero)
  text: {
    brand: 'linear-gradient(135deg, #00b4d8, #a78bfa)',
    silver: 'linear-gradient(135deg, #fafafa, #a1a1aa)',
  },
  // Sparkline fills
  sparkline: {
    brand: 'linear-gradient(to bottom, rgba(0,180,216,0.2), rgba(0,180,216,0))',
    success: 'linear-gradient(to bottom, rgba(52,211,153,0.2), rgba(52,211,153,0))',
  },
} as const
```

### Novas Cores

Adicionar ao `colors.ts`:

```ts
export const colorsV3 = {
  // Zinc scale (substituir neutral por zinc para dark-first)
  zinc: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
  // Accent palette expandida
  accent: {
    cyan: { 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2' },
    violet: { 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed' },
    emerald: { 400: '#34d399', 500: '#10b981', 600: '#059669' },
    amber: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
    rose: { 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48' },
  },
} as const
```

### Novas Animacoes

```ts
export const animationsV3 = {
  duration: {
    instant: '0ms',
    faster: '75ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    page: '350ms',
  },
  easing: {
    linear: 'linear',
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)', // standard
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    expoOut: 'cubic-bezier(0.16, 1, 0.3, 1)', // premium exit
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // overshoot sutil
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  // Motion (framer-motion) spring presets
  spring: {
    snappy: { type: 'spring', stiffness: 400, damping: 30 }, // buttons, toggles
    smooth: { type: 'spring', stiffness: 300, damping: 30 }, // cards, panels
    gentle: { type: 'spring', stiffness: 200, damping: 25 }, // page transitions
    bouncy: { type: 'spring', stiffness: 500, damping: 15 }, // notifications
  },
  // Stagger presets
  stagger: {
    fast: { staggerChildren: 0.03 },
    normal: { staggerChildren: 0.05 },
    slow: { staggerChildren: 0.08 },
  },
  keyframes: {
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
    glowPulse: {
      '0%, 100%': { boxShadow: '0 0 20px rgba(0,180,216,0.1)' },
      '50%': { boxShadow: '0 0 30px rgba(0,180,216,0.2)' },
    },
    slideInRight: {
      from: { transform: 'translateX(100%)', opacity: '0' },
      to: { transform: 'translateX(0)', opacity: '1' },
    },
    scaleIn: {
      from: { transform: 'scale(0.96)', opacity: '0' },
      to: { transform: 'scale(1)', opacity: '1' },
    },
    countUp: {
      from: { opacity: '0', transform: 'translateY(4px)' },
      to: { opacity: '1', transform: 'translateY(0)' },
    },
  },
} as const
```

---

## E) Stack de Implementacao

### Libs Necessarias

| Lib                   | Versao | Proposito                                              | Bundle Impact                  |
| --------------------- | ------ | ------------------------------------------------------ | ------------------------------ |
| `motion`              | ^12.x  | Animacoes React (ex framer-motion)                     | ~15kb gzipped (com tree-shake) |
| `@radix-ui/react-*`   | ^1.x   | Primitivos acessiveis (Dialog, Dropdown, Tooltip, etc) | ~2-5kb por componente          |
| `tailwindcss-animate` | ^1.x   | Utilidades de animacao no Tailwind                     | ~1kb                           |
| `clsx`                | ^2.x   | Class merging (ja instalado)                           | ~0.5kb                         |
| `Inter Variable`      | -      | Font variavel via @fontsource ou Google Fonts          | ~100kb (latin subset)          |
| `JetBrains Mono`      | -      | Font mono via @fontsource                              | ~50kb (latin subset)           |

### O Que NAO Instalar

- **GSAP** — overkill para dashboard, Motion cobre tudo
- **Three.js/R3F** — sem necessidade de 3D
- **Lottie** — arquivos pesados, icones Lucide + CSS sao suficientes
- **Styled-components** — Tailwind ja resolve
- **Chart.js/D3** — Recharts (ja no ecosystem) e suficiente para graficos

### CSS-only vs JS Animations

| Tipo             | Abordagem   | Justificativa                                            |
| ---------------- | ----------- | -------------------------------------------------------- |
| Hover effects    | **CSS**     | transform, box-shadow, opacity — performante e simples   |
| Page transitions | **Motion**  | AnimatePresence precisa de controle de mount/unmount     |
| Stagger children | **Motion**  | variants + staggerChildren nao tem equivalente CSS limpo |
| Skeleton shimmer | **CSS**     | keyframes + background-size — zero JS                    |
| Accordion expand | **Motion**  | `animate={{ height: 'auto' }}` — CSS nao anima para auto |
| Card tilt 3D     | **JS hook** | Precisa de mousemove tracking                            |
| Count-up         | **JS hook** | rAF + easing (ja implementado)                           |
| Modal open/close | **Motion**  | AnimatePresence para exit animation                      |
| Toast slide      | **Motion**  | Layout animations para stack reorder                     |
| Scroll-linked    | **CSS**     | `@scroll-timeline` ou IntersectionObserver               |

### Performance Implications

1. **backdrop-filter**: GPU-accelerated nos browsers modernos, mas pode causar jank em dispositivos low-end. Mitigacao: `@media (prefers-reduced-motion: reduce)` desativa blur, `@supports not (backdrop-filter: blur(1px))` fallback para bg solido.

2. **Motion bundle**: usar `LazyMotion` + `domAnimation` feature set (nao `domMax`) para reduzir bundle de 15kb para ~5kb.

3. **Font loading**: `font-display: swap` para Inter Variable, `font-display: optional` para JetBrains Mono (evitar layout shift).

4. **Noise texture**: SVG inline base64 (< 1kb), nao PNG. Aplicar via CSS `background-image`, nao `<img>`.

5. **Ambient gradients**: `position: fixed` com `will-change: transform` para evitar repaint no scroll.

6. **Reduced motion**: TODA animacao deve respeitar `prefers-reduced-motion: reduce`. Nesse caso: duracoes viram 0ms, transforms desaparecem, apenas opacity fica (para nao quebrar funcionalidade).

---

## F) Plano de Execucao (Sprints)

### Sprint 1 — Fundacao (tokens + globals)

- [ ] Atualizar `globals.css` com novas CSS variables (paleta dark-first)
- [ ] Criar `packages/design-system/src/tokens/shadows.ts`
- [ ] Criar `packages/design-system/src/tokens/gradients.ts`
- [ ] Atualizar `colors.ts` com zinc scale + accents
- [ ] Atualizar `animation.ts` com novos presets
- [ ] Adicionar Inter Variable + JetBrains Mono
- [ ] Criar `public/textures/noise.svg`
- [ ] Adicionar componente `AmbientGradient` (background fixo)
- [ ] Instalar `motion` + `tailwindcss-animate`

### Sprint 2 — Layout Core (sidebar + header)

- [ ] Redesenhar AppSidebar com glass style
- [ ] Reduzir Header para 52px, estilo transparente
- [ ] Remover theme toggle do header (mover para settings)
- [ ] Ajustar AppLayout margins e transitions
- [ ] Implementar sidebar collapse animation premium

### Sprint 3 — Dashboard (KPIs + charts)

- [ ] Redesenhar KPI cards com glass + sparklines
- [ ] Implementar bento grid layout responsivo
- [ ] Adicionar glow hover nos cards
- [ ] Melhorar MiniBarChart com gradients
- [ ] Stagger animation no grid de cards

### Sprint 4 — Data Components (tabelas + forms)

- [ ] Redesenhar tabela com sticky header, glass container
- [ ] Sort indicators visuais
- [ ] Status dots com glow
- [ ] Redesenhar inputs/selects com focus glow
- [ ] Redesenhar modal com entry/exit animations

### Sprint 5 — Polish (micro-interacoes + estados)

- [ ] Implementar skeleton shimmer premium
- [ ] Implementar toast system com slide + progress bar
- [ ] Empty states com icones e CTAs
- [ ] Card tilt 3D hook (opcional)
- [ ] Command palette visual upgrade
- [ ] Reduced motion media query em todos os componentes

---

## Fontes de Pesquisa

- Linear UI Refresh (Marco 2026): https://linear.app/now/behind-the-latest-design-refresh
- Linear Design Redesign: https://linear.app/now/how-we-redesigned-the-linear-ui
- Vercel Dashboard UX Analysis: https://medium.com/design-bootcamp/vercels-new-dashboard-ux-what-it-teaches-us-about-developer-centric-design-93117215fe31
- UI Design Trends 2026: https://midrocket.com/en/guides/ui-design-trends-2026/
- Dark Glassmorphism 2026: https://medium.com/@developer_89726/dark-glassmorphism-the-aesthetic-that-will-define-ui-in-2026-93aa4153088f
- Glass UI Components: https://allshadcn.com/components/glass-ui/
- Motion (ex-Framer Motion): https://motion.dev/docs/react
- 15 UI/UX Design Trends 2026: https://www.wearetenet.com/blog/ui-ux-design-trends
- Glassmorphism CSS Guide: https://ui.glass/generator
- Stripe Dashboard Patterns: https://docs.stripe.com/stripe-apps/patterns
