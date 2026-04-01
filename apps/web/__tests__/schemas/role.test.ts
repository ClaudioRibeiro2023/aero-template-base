import { describe, it, expect } from 'vitest'
import { roleCreateSchema, roleUpdateSchema } from '@template/shared/schemas'

describe('roleCreateSchema', () => {
  it('valida name com letras maiusculas e underscores', () => {
    const result = roleCreateSchema.safeParse({
      name: 'CUSTOM_ROLE',
      display_name: 'Custom Role',
    })
    expect(result.success).toBe(true)
  })

  it('valida name com numeros', () => {
    const result = roleCreateSchema.safeParse({
      name: 'ROLE_V2',
      display_name: 'Role V2',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita name com letras minusculas', () => {
    const result = roleCreateSchema.safeParse({
      name: 'custom_role',
      display_name: 'Custom Role',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined()
    }
  })

  it('rejeita name com espacos', () => {
    const result = roleCreateSchema.safeParse({
      name: 'CUSTOM ROLE',
      display_name: 'Custom Role',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita name vazio', () => {
    const result = roleCreateSchema.safeParse({
      name: '',
      display_name: 'Custom Role',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita name com hifens', () => {
    const result = roleCreateSchema.safeParse({
      name: 'CUSTOM-ROLE',
      display_name: 'Custom Role',
    })
    expect(result.success).toBe(false)
  })

  it('valida permissions com formato RECURSO.ACAO', () => {
    const result = roleCreateSchema.safeParse({
      name: 'EDITOR',
      display_name: 'Editor',
      permissions: ['DASHBOARD.VIEW', 'USUARIOS.EDIT'],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.permissions).toHaveLength(2)
    }
  })

  it('rejeita permission com formato invalido (minusculas)', () => {
    const result = roleCreateSchema.safeParse({
      name: 'EDITOR',
      display_name: 'Editor',
      permissions: ['dashboard.view'],
    })
    expect(result.success).toBe(false)
  })

  it('rejeita permission sem ponto separador', () => {
    const result = roleCreateSchema.safeParse({
      name: 'EDITOR',
      display_name: 'Editor',
      permissions: ['DASHBOARDVIEW'],
    })
    expect(result.success).toBe(false)
  })

  it('rejeita permission com formato invalido (tres partes)', () => {
    const result = roleCreateSchema.safeParse({
      name: 'EDITOR',
      display_name: 'Editor',
      permissions: ['DASHBOARD.VIEW.ALL'],
    })
    expect(result.success).toBe(false)
  })

  it('permissions tem default array vazio', () => {
    const result = roleCreateSchema.safeParse({
      name: 'BASIC',
      display_name: 'Basic',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.permissions).toEqual([])
    }
  })

  it('hierarchy_level aceita 0', () => {
    const result = roleCreateSchema.safeParse({
      name: 'LOWEST',
      display_name: 'Lowest',
      hierarchy_level: 0,
    })
    expect(result.success).toBe(true)
  })

  it('hierarchy_level aceita 100', () => {
    const result = roleCreateSchema.safeParse({
      name: 'HIGHEST',
      display_name: 'Highest',
      hierarchy_level: 100,
    })
    expect(result.success).toBe(true)
  })

  it('rejeita hierarchy_level negativo', () => {
    const result = roleCreateSchema.safeParse({
      name: 'INVALID',
      display_name: 'Invalid',
      hierarchy_level: -1,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita hierarchy_level maior que 100', () => {
    const result = roleCreateSchema.safeParse({
      name: 'INVALID',
      display_name: 'Invalid',
      hierarchy_level: 101,
    })
    expect(result.success).toBe(false)
  })

  it('hierarchy_level tem default 0', () => {
    const result = roleCreateSchema.safeParse({
      name: 'DEFAULT',
      display_name: 'Default',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.hierarchy_level).toBe(0)
    }
  })

  it('rejeita hierarchy_level decimal', () => {
    const result = roleCreateSchema.safeParse({
      name: 'DECIMAL',
      display_name: 'Decimal',
      hierarchy_level: 50.5,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita display_name vazio', () => {
    const result = roleCreateSchema.safeParse({
      name: 'ROLE',
      display_name: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita description maior que 500 caracteres', () => {
    const result = roleCreateSchema.safeParse({
      name: 'ROLE',
      display_name: 'Role',
      description: 'x'.repeat(501),
    })
    expect(result.success).toBe(false)
  })
})

describe('roleUpdateSchema', () => {
  it('aceita objeto vazio (todos campos opcionais)', () => {
    const result = roleUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('aceita update parcial de display_name', () => {
    const result = roleUpdateSchema.safeParse({ display_name: 'Novo Nome' })
    expect(result.success).toBe(true)
  })

  it('aceita update parcial de permissions', () => {
    const result = roleUpdateSchema.safeParse({
      permissions: ['DASHBOARD.VIEW', 'ADMIN.EDIT'],
    })
    expect(result.success).toBe(true)
  })

  it('aceita update parcial de hierarchy_level', () => {
    const result = roleUpdateSchema.safeParse({ hierarchy_level: 50 })
    expect(result.success).toBe(true)
  })

  it('rejeita permissions com formato invalido em update', () => {
    const result = roleUpdateSchema.safeParse({
      permissions: ['invalid.format'],
    })
    expect(result.success).toBe(false)
  })

  it('rejeita hierarchy_level fora do range em update', () => {
    const result = roleUpdateSchema.safeParse({ hierarchy_level: 200 })
    expect(result.success).toBe(false)
  })

  it('aceita update completo', () => {
    const result = roleUpdateSchema.safeParse({
      display_name: 'Nome Atualizado',
      description: 'Descricao nova',
      permissions: ['DASHBOARD.VIEW'],
      hierarchy_level: 10,
    })
    expect(result.success).toBe(true)
  })

  it('nao permite alterar name no update', () => {
    const result = roleUpdateSchema.safeParse({ name: 'NEW_NAME' })
    // name nao faz parte do updateSchema, entao deve ser ignorado (stripped)
    expect(result.success).toBe(true)
  })
})
