/**
 * Font configuration — Dark Glass Engineering
 *
 * Inter: corpo de texto, UI geral
 * JetBrains Mono: dados numéricos, código, métricas
 *
 * Uso nos componentes:
 *   import { fontMono } from '@/app/fonts'
 *   <span className={fontMono.className}>R$ 1.234,56</span>
 */

import { Inter, JetBrains_Mono } from 'next/font/google'

export const fontSans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})
