import { describe, it, expect } from 'vitest'
import { featureFlagCreateSchema, featureFlagUpdateSchema } from '@template/shared/schemas'

describe('featureFlagCreateSchema', () => {
  it('valida flag_name com letras minusculas', () => {
    const result = featureFlagCreateSchema.safeParse({ flag_name: 'my-flag' })
    expect(result.success).toBe(true)
  })

  it('valida flag_name com numeros', () => {
    const result = featureFlagCreateSchema.safeParse({ flag_name: 'flag123' })
    expect(result.success).toBe(true)
  })

  it('valida flag_name com hifens e underscores', () => {
    const result = featureFlagCreateSchema.safeParse({ flag_name: 'my_flag-v2' })
    expect(result.success).toBe(true)
  })

  it('rejeita flag_name com letras maiusculas', () => {
    const result = featureFlagCreateSchema.safeParse({ flag_name: 'MyFlag' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.flag_name).toBeDefined()
    }
  })

  it('rejeita flag_name com espacos', () => {
    const result = featureFlagCreateSchema.safeParse({ flag_name: 'my flag' })
    expect(result.success).toBe(false)
  })

  it('rejeita flag_name com caracteres especiais', () => {
    const result = featureFlagCreateSchema.safeParse({ flag_name: 'flag@v1!' })
    expect(result.success).toBe(false)
  })

  it('rejeita flag_name vazio', () => {
    const result = featureFlagCreateSchema.safeParse({ flag_name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.flag_name).toBeDefined()
    }
  })

  it('rejeita description maior que 500 caracteres', () => {
    const result = featureFlagCreateSchema.safeParse({
      flag_name: 'flag',
      description: 'x'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('aceita description com 500 caracteres', () => {
    const result = featureFlagCreateSchema.safeParse({
      flag_name: 'flag',
      description: 'x'.repeat(500),
    })
    expect(result.success).toBe(true)
  })

  it('aceita description vazia (string vazia)', () => {
    const result = featureFlagCreateSchema.safeParse({
      flag_name: 'flag',
      description: '',
    })
    expect(result.success).toBe(true)
  })

  it('enabled tem default false', () => {
    const result = featureFlagCreateSchema.safeParse({ flag_name: 'flag' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.enabled).toBe(false)
    }
  })

  it('aceita enabled explicitamente true', () => {
    const result = featureFlagCreateSchema.safeParse({
      flag_name: 'flag',
      enabled: true,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.enabled).toBe(true)
    }
  })

  it('rejeita flag_name maior que 100 caracteres', () => {
    const result = featureFlagCreateSchema.safeParse({
      flag_name: 'a'.repeat(101),
    })
    expect(result.success).toBe(false)
  })
})

describe('featureFlagUpdateSchema', () => {
  it('aceita objeto vazio (todos campos opcionais)', () => {
    const result = featureFlagUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('aceita update parcial de enabled', () => {
    const result = featureFlagUpdateSchema.safeParse({ enabled: true })
    expect(result.success).toBe(true)
  })

  it('aceita update parcial de description', () => {
    const result = featureFlagUpdateSchema.safeParse({ description: 'nova desc' })
    expect(result.success).toBe(true)
  })

  it('aceita update parcial de flag_name', () => {
    const result = featureFlagUpdateSchema.safeParse({ flag_name: 'new-name' })
    expect(result.success).toBe(true)
  })

  it('rejeita flag_name invalido em update', () => {
    const result = featureFlagUpdateSchema.safeParse({ flag_name: 'INVALID NAME' })
    expect(result.success).toBe(false)
  })

  it('aceita update completo', () => {
    const result = featureFlagUpdateSchema.safeParse({
      flag_name: 'updated-flag',
      description: 'Descricao atualizada',
      enabled: true,
    })
    expect(result.success).toBe(true)
  })
})
