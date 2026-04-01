import { describe, it, expect } from 'vitest'
import { userCreateSchema, userUpdateSchema, UserRoleEnum } from '@template/shared/schemas'

describe('UserRoleEnum', () => {
  it('aceita valores validos', () => {
    for (const v of ['ADMIN', 'GESTOR', 'OPERADOR', 'VIEWER']) {
      expect(UserRoleEnum.safeParse(v).success).toBe(true)
    }
  })

  it('rejeita valor invalido', () => {
    expect(UserRoleEnum.safeParse('SUPERADMIN').success).toBe(false)
    expect(UserRoleEnum.safeParse('admin').success).toBe(false)
  })
})

describe('userCreateSchema', () => {
  it('valida user minimo', () => {
    const result = userCreateSchema.safeParse({
      display_name: 'Joao Silva',
      email: 'joao@empresa.com',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.role).toBe('VIEWER')
      expect(result.data.is_active).toBe(true)
    }
  })

  it('valida user completo', () => {
    const result = userCreateSchema.safeParse({
      display_name: 'Joao Silva',
      email: 'joao@empresa.com',
      role: 'ADMIN',
      is_active: false,
      phone: '11999999999',
      department: 'Engenharia',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    const result = userCreateSchema.safeParse({
      display_name: '',
      email: 'joao@empresa.com',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.display_name).toBeDefined()
    }
  })

  it('rejeita email invalido', () => {
    const result = userCreateSchema.safeParse({
      display_name: 'Joao',
      email: 'nao-e-email',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined()
    }
  })

  it('rejeita nome muito longo (>255 chars)', () => {
    const result = userCreateSchema.safeParse({
      display_name: 'a'.repeat(256),
      email: 'joao@empresa.com',
    })
    expect(result.success).toBe(false)
  })

  it('aplica trim no nome', () => {
    const result = userCreateSchema.safeParse({
      display_name: '  Joao Silva  ',
      email: 'joao@empresa.com',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.display_name).toBe('Joao Silva')
    }
  })

  it('aceita phone vazio (campo opcional)', () => {
    const result = userCreateSchema.safeParse({
      display_name: 'Joao',
      email: 'joao@empresa.com',
      phone: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita role invalida', () => {
    const result = userCreateSchema.safeParse({
      display_name: 'Joao',
      email: 'joao@empresa.com',
      role: 'SUPERADMIN',
    })
    expect(result.success).toBe(false)
  })
})

describe('userUpdateSchema', () => {
  it('aceita objeto vazio (todos campos opcionais)', () => {
    const result = userUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('aceita update parcial de role', () => {
    const result = userUpdateSchema.safeParse({ role: 'GESTOR' })
    expect(result.success).toBe(true)
  })

  it('aceita update parcial de is_active', () => {
    const result = userUpdateSchema.safeParse({ is_active: false })
    expect(result.success).toBe(true)
  })

  it('rejeita nome vazio em update', () => {
    const result = userUpdateSchema.safeParse({ display_name: '' })
    expect(result.success).toBe(false)
  })

  it('aceita update completo', () => {
    const result = userUpdateSchema.safeParse({
      display_name: 'Nome Atualizado',
      email: 'novo@email.com',
      role: 'OPERADOR',
      is_active: true,
      phone: '11888888888',
      department: 'RH',
    })
    expect(result.success).toBe(true)
  })
})
