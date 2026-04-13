/**
 * Configuração Central de Módulos — Template.Base
 *
 * Este é o único arquivo que define quais módulos estão ativos neste deployment.
 * Core modules (auth, admin, settings, search) são sempre ativos — overrides ignorados.
 *
 * Para ativar/desativar um módulo, altere o valor de `enabled`.
 * Dependências são validadas automaticamente no startup.
 *
 * @see docs/MODULES.md para documentação completa
 * @see apps/web/config/modules/*.manifest.ts para detalhes de cada módulo
 */

import type { ModuleOverride } from '@template/modules'

export const moduleOverrides: Record<string, ModuleOverride> = {
  // ── Default (ativos por padrão) ────────────────────────────
  dashboard: { enabled: true },
  reports: { enabled: true },

  // ── Opcionais ──────────────────────────────────────────────
  tasks: { enabled: true },
  support: { enabled: false },
  notifications: { enabled: true },
  'feature-flags': { enabled: true },
  organizations: { enabled: false },

  // ── Utilitários ────────────────────────────────────────────
  'file-upload': { enabled: true },
}
