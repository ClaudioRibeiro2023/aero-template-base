import { describe, it, expect } from 'vitest'
import {
  SignupSchema,
  LoginSchema,
  ResetPasswordSchema,
  UpdatePasswordSchema,
} from '../../schemas/auth'

describe('SignupSchema', () => {
  it('valida dados mínimos corretos', () => {
    const result = SignupSchema.safeParse({
      email: 'user@example.com',
      password: 'senha123',
      name: 'João Silva',
    })
    expect(result.success).toBe(true)
  })

  it('aceita tenant_id UUID opcional', () => {
    const result = SignupSchema.safeParse({
      email: 'user@example.com',
      password: 'senha123',
      name: 'João Silva',
      tenant_id: '123e4567-e89b-12d3-a456-426614174000',
    })
    expect(result.success).toBe(true)
  })

  it('funciona sem tenant_id (campo opcional)', () => {
    const result = SignupSchema.safeParse({
      email: 'user@example.com',
      password: 'senha12345',
      name: 'Maria',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita email inválido', () => {
    const result = SignupSchema.safeParse({
      email: 'not-an-email',
      password: 'senha123',
      name: 'João',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita email vazio', () => {
    const result = SignupSchema.safeParse({
      email: '',
      password: 'senha123',
      name: 'João',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita senha com menos de 8 caracteres', () => {
    const result = SignupSchema.safeParse({
      email: 'user@example.com',
      password: '1234567',
      name: 'João',
    })
    expect(result.success).toBe(false)
  })

  it('aceita senha com exatamente 8 caracteres', () => {
    const result = SignupSchema.safeParse({
      email: 'user@example.com',
      password: '12345678',
      name: 'João',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita nome com menos de 2 caracteres', () => {
    const result = SignupSchema.safeParse({
      email: 'user@example.com',
      password: 'senha123',
      name: 'J',
    })
    expect(result.success).toBe(false)
  })

  it('aceita nome com exatamente 2 caracteres', () => {
    const result = SignupSchema.safeParse({
      email: 'user@example.com',
      password: 'senha123',
      name: 'Jo',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita tenant_id que não é UUID válido', () => {
    const result = SignupSchema.safeParse({
      email: 'user@example.com',
      password: 'senha123',
      name: 'João',
      tenant_id: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita tenant_id com formato incorreto', () => {
    const result = SignupSchema.safeParse({
      email: 'user@example.com',
      password: 'senha123',
      name: 'João',
      tenant_id: '12345',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita payload sem campos obrigatórios', () => {
    const result = SignupSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('LoginSchema', () => {
  it('valida email e password corretos', () => {
    const result = LoginSchema.safeParse({
      email: 'user@example.com',
      password: 'qualquersenha',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita email inválido', () => {
    const result = LoginSchema.safeParse({
      email: 'invalid',
      password: 'senha123',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita password vazio', () => {
    const result = LoginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })

  it('aceita password de 1 caractere (min=1)', () => {
    const result = LoginSchema.safeParse({
      email: 'user@example.com',
      password: 'x',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita payload sem email', () => {
    const result = LoginSchema.safeParse({ password: 'senha123' })
    expect(result.success).toBe(false)
  })

  it('rejeita payload sem password', () => {
    const result = LoginSchema.safeParse({ email: 'user@example.com' })
    expect(result.success).toBe(false)
  })
})

describe('ResetPasswordSchema', () => {
  it('valida email correto', () => {
    const result = ResetPasswordSchema.safeParse({ email: 'user@example.com' })
    expect(result.success).toBe(true)
  })

  it('rejeita email inválido', () => {
    const result = ResetPasswordSchema.safeParse({ email: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('rejeita email vazio', () => {
    const result = ResetPasswordSchema.safeParse({ email: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita payload vazio', () => {
    const result = ResetPasswordSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('UpdatePasswordSchema', () => {
  it('valida senha com 8+ caracteres', () => {
    const result = UpdatePasswordSchema.safeParse({ password: 'novaSenha1' })
    expect(result.success).toBe(true)
  })

  it('rejeita senha com menos de 8 caracteres', () => {
    const result = UpdatePasswordSchema.safeParse({ password: '1234567' })
    expect(result.success).toBe(false)
  })

  it('aceita senha com exatamente 8 caracteres', () => {
    const result = UpdatePasswordSchema.safeParse({ password: '12345678' })
    expect(result.success).toBe(true)
  })

  it('rejeita payload sem password', () => {
    const result = UpdatePasswordSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
