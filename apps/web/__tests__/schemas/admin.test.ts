import { describe, it, expect } from 'vitest'
import { UpdateBrandingSchema, UpdateThemeSchema, UpdateConfigSchema } from '../../schemas/admin'

describe('UpdateBrandingSchema', () => {
  it('valida objeto vazio (todos opcionais)', () => {
    const result = UpdateBrandingSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('valida appName válido', () => {
    const result = UpdateBrandingSchema.safeParse({ appName: 'Minha Empresa' })
    expect(result.success).toBe(true)
  })

  it('rejeita appName vazio (min 1)', () => {
    const result = UpdateBrandingSchema.safeParse({ appName: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita appName com mais de 100 caracteres', () => {
    const result = UpdateBrandingSchema.safeParse({ appName: 'a'.repeat(101) })
    expect(result.success).toBe(false)
  })

  it('aceita appName com exatamente 100 caracteres', () => {
    const result = UpdateBrandingSchema.safeParse({ appName: 'a'.repeat(100) })
    expect(result.success).toBe(true)
  })

  it('valida cor primária hex válida (maiúsculas)', () => {
    const result = UpdateBrandingSchema.safeParse({ primaryColor: '#0087A8' })
    expect(result.success).toBe(true)
  })

  it('valida cor primária hex válida (minúsculas)', () => {
    const result = UpdateBrandingSchema.safeParse({ primaryColor: '#ff5500' })
    expect(result.success).toBe(true)
  })

  it('valida cor secundária hex válida', () => {
    const result = UpdateBrandingSchema.safeParse({ secondaryColor: '#AABBCC' })
    expect(result.success).toBe(true)
  })

  it('rejeita cor hex sem # prefix', () => {
    const result = UpdateBrandingSchema.safeParse({ primaryColor: '0087A8' })
    expect(result.success).toBe(false)
  })

  it('rejeita cor hex com nome de cor', () => {
    const result = UpdateBrandingSchema.safeParse({ primaryColor: 'azul' })
    expect(result.success).toBe(false)
  })

  it('rejeita cor hex com 3 dígitos (só aceita 6)', () => {
    const result = UpdateBrandingSchema.safeParse({ primaryColor: '#fff' })
    expect(result.success).toBe(false)
  })

  it('valida logoUrl como URL válida', () => {
    const result = UpdateBrandingSchema.safeParse({ logoUrl: 'https://example.com/logo.png' })
    expect(result.success).toBe(true)
  })

  it('aceita logoUrl como null', () => {
    const result = UpdateBrandingSchema.safeParse({ logoUrl: null })
    expect(result.success).toBe(true)
  })

  it('rejeita logoUrl como string não-URL', () => {
    const result = UpdateBrandingSchema.safeParse({ logoUrl: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  it('valida faviconUrl como URL válida', () => {
    const result = UpdateBrandingSchema.safeParse({ faviconUrl: 'https://example.com/favicon.ico' })
    expect(result.success).toBe(true)
  })

  it('aceita faviconUrl como null', () => {
    const result = UpdateBrandingSchema.safeParse({ faviconUrl: null })
    expect(result.success).toBe(true)
  })

  it('valida múltiplos campos simultaneamente', () => {
    const result = UpdateBrandingSchema.safeParse({
      appName: 'Aero Studio',
      primaryColor: '#0087A8',
      secondaryColor: '#334155',
      logoUrl: 'https://example.com/logo.png',
    })
    expect(result.success).toBe(true)
  })
})

describe('UpdateThemeSchema', () => {
  it('valida objeto vazio (todos opcionais)', () => {
    const result = UpdateThemeSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('valida mode "light"', () => {
    const result = UpdateThemeSchema.safeParse({ mode: 'light' })
    expect(result.success).toBe(true)
  })

  it('valida mode "dark"', () => {
    const result = UpdateThemeSchema.safeParse({ mode: 'dark' })
    expect(result.success).toBe(true)
  })

  it('valida mode "system"', () => {
    const result = UpdateThemeSchema.safeParse({ mode: 'system' })
    expect(result.success).toBe(true)
  })

  it('rejeita mode inválido', () => {
    const result = UpdateThemeSchema.safeParse({ mode: 'pink' })
    expect(result.success).toBe(false)
  })

  it('rejeita mode vazio', () => {
    const result = UpdateThemeSchema.safeParse({ mode: '' })
    expect(result.success).toBe(false)
  })

  it('valida density "comfortable"', () => {
    const result = UpdateThemeSchema.safeParse({ density: 'comfortable' })
    expect(result.success).toBe(true)
  })

  it('valida density "compact"', () => {
    const result = UpdateThemeSchema.safeParse({ density: 'compact' })
    expect(result.success).toBe(true)
  })

  it('valida density "spacious"', () => {
    const result = UpdateThemeSchema.safeParse({ density: 'spacious' })
    expect(result.success).toBe(true)
  })

  it('rejeita density inválida', () => {
    const result = UpdateThemeSchema.safeParse({ density: 'extra-large' })
    expect(result.success).toBe(false)
  })

  it('valida borderRadius "none"', () => {
    const result = UpdateThemeSchema.safeParse({ borderRadius: 'none' })
    expect(result.success).toBe(true)
  })

  it('valida borderRadius "sm"', () => {
    const result = UpdateThemeSchema.safeParse({ borderRadius: 'sm' })
    expect(result.success).toBe(true)
  })

  it('valida borderRadius "md"', () => {
    const result = UpdateThemeSchema.safeParse({ borderRadius: 'md' })
    expect(result.success).toBe(true)
  })

  it('valida borderRadius "lg"', () => {
    const result = UpdateThemeSchema.safeParse({ borderRadius: 'lg' })
    expect(result.success).toBe(true)
  })

  it('rejeita borderRadius inválido', () => {
    const result = UpdateThemeSchema.safeParse({ borderRadius: 'xl' })
    expect(result.success).toBe(false)
  })

  it('valida fontFamily como string livre', () => {
    const result = UpdateThemeSchema.safeParse({ fontFamily: 'Inter, sans-serif' })
    expect(result.success).toBe(true)
  })

  it('valida múltiplos campos simultaneamente', () => {
    const result = UpdateThemeSchema.safeParse({
      mode: 'dark',
      density: 'compact',
      borderRadius: 'md',
      fontFamily: 'Roboto',
    })
    expect(result.success).toBe(true)
  })
})

describe('UpdateConfigSchema', () => {
  it('valida objeto vazio (todos opcionais)', () => {
    const result = UpdateConfigSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('valida maintenanceMode como boolean', () => {
    const result = UpdateConfigSchema.safeParse({ maintenanceMode: true })
    expect(result.success).toBe(true)
  })

  it('valida maintenanceMode false', () => {
    const result = UpdateConfigSchema.safeParse({ maintenanceMode: false })
    expect(result.success).toBe(true)
  })

  it('rejeita maintenanceMode como string', () => {
    const result = UpdateConfigSchema.safeParse({ maintenanceMode: 'true' })
    expect(result.success).toBe(false)
  })

  it('valida defaultLanguage como string', () => {
    const result = UpdateConfigSchema.safeParse({ defaultLanguage: 'pt-BR' })
    expect(result.success).toBe(true)
  })

  it('valida defaultTimezone como string', () => {
    const result = UpdateConfigSchema.safeParse({ defaultTimezone: 'America/Sao_Paulo' })
    expect(result.success).toBe(true)
  })

  it('valida branding aninhado', () => {
    const result = UpdateConfigSchema.safeParse({
      branding: {
        appName: 'Aero Studio',
        primaryColor: '#0087A8',
      },
    })
    expect(result.success).toBe(true)
  })

  it('valida theme aninhado', () => {
    const result = UpdateConfigSchema.safeParse({
      theme: {
        mode: 'dark',
        density: 'comfortable',
      },
    })
    expect(result.success).toBe(true)
  })

  it('rejeita branding inválido (cor incorreta)', () => {
    const result = UpdateConfigSchema.safeParse({
      branding: { primaryColor: 'vermelho' },
    })
    expect(result.success).toBe(false)
  })

  it('rejeita theme inválido (mode incorreto)', () => {
    const result = UpdateConfigSchema.safeParse({
      theme: { mode: 'neon' },
    })
    expect(result.success).toBe(false)
  })

  it('valida payload completo com todos os campos', () => {
    const result = UpdateConfigSchema.safeParse({
      branding: {
        appName: 'Aero Studio',
        primaryColor: '#0087A8',
        logoUrl: 'https://example.com/logo.png',
      },
      theme: {
        mode: 'system',
        density: 'comfortable',
        borderRadius: 'lg',
      },
      maintenanceMode: false,
      defaultLanguage: 'pt-BR',
      defaultTimezone: 'America/Sao_Paulo',
    })
    expect(result.success).toBe(true)
  })
})
