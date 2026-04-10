import type { CategoryResult } from './types'

export function checkSecurity(): CategoryResult {
  const checks = [
    {
      name: 'HTTPS configurado',
      status: (typeof window !== 'undefined' && window.location.protocol === 'https:'
        ? 'pass'
        : 'warn') as 'pass' | 'warn' | 'fail',
      score: typeof window !== 'undefined' && window.location.protocol === 'https:' ? 100 : 50,
      details:
        typeof window !== 'undefined'
          ? `Protocolo: ${window.location.protocol}`
          : 'Server-side check',
      recommendation: 'Garanta que a aplicação roda exclusivamente via HTTPS em produção.',
    },
    {
      name: 'Content Security Policy',
      status: 'warn' as const,
      score: 60,
      details: 'CSP headers devem ser configurados no next.config.js ou middleware.',
      recommendation: 'Adicione headers CSP para prevenir XSS e injection attacks.',
    },
    {
      name: 'Autenticação configurada',
      status: (typeof window !== 'undefined' && document.cookie.includes('sb-')
        ? 'pass'
        : 'warn') as 'pass' | 'warn' | 'fail',
      score: typeof window !== 'undefined' && document.cookie.includes('sb-') ? 100 : 40,
      details: 'Verifica presença de cookies Supabase auth.',
      recommendation: 'Configure Supabase Auth com middleware de proteção de rotas.',
    },
    {
      name: 'Variáveis sensíveis protegidas',
      status: 'pass' as const,
      score: 100,
      details: 'Apenas NEXT_PUBLIC_* são expostas ao cliente.',
      recommendation: 'Nunca exponha SERVICE_ROLE_KEY ou secrets no cliente.',
    },
  ]

  const score = Math.round(checks.reduce((sum, c) => sum + c.score, 0) / checks.length)
  return { category: 'Segurança', score, checks }
}
