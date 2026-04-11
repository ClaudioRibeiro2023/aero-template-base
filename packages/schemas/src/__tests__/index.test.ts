/**
 * Tests for @template/schemas — validação de Zod schemas exportados.
 */
import { describe, it, expect } from 'vitest'
import {
  taskCreateSchema,
  taskUpdateSchema,
  TaskStatusEnum,
  TaskPriorityEnum,
  SignupSchema,
  LoginSchema,
  ticketCreateSchema,
} from '../index'

describe('taskCreateSchema', () => {
  it('valida task com dados corretos', () => {
    const result = taskCreateSchema.safeParse({
      title: 'Minha Task',
      status: 'todo',
      priority: 'medium',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Minha Task')
      expect(result.data.status).toBe('todo')
    }
  })

  it('rejeita task sem titulo', () => {
    const result = taskCreateSchema.safeParse({
      title: '',
      status: 'todo',
      priority: 'medium',
    })
    expect(result.success).toBe(false)
  })

  it('aplica defaults para status e priority', () => {
    const result = taskCreateSchema.safeParse({ title: 'Teste' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('todo')
      expect(result.data.priority).toBe('medium')
    }
  })
})

describe('TaskStatusEnum e TaskPriorityEnum', () => {
  it('aceita valores validos de status', () => {
    expect(TaskStatusEnum.safeParse('todo').success).toBe(true)
    expect(TaskStatusEnum.safeParse('in_progress').success).toBe(true)
    expect(TaskStatusEnum.safeParse('done').success).toBe(true)
    expect(TaskStatusEnum.safeParse('cancelled').success).toBe(true)
  })

  it('rejeita status invalido', () => {
    expect(TaskStatusEnum.safeParse('invalid').success).toBe(false)
  })

  it('aceita valores validos de priority', () => {
    expect(TaskPriorityEnum.safeParse('low').success).toBe(true)
    expect(TaskPriorityEnum.safeParse('critical').success).toBe(true)
  })
})

describe('taskUpdateSchema', () => {
  it('aceita update parcial (somente priority)', () => {
    const result = taskUpdateSchema.safeParse({ priority: 'high' })
    expect(result.success).toBe(true)
  })

  it('aceita objeto vazio (todos campos opcionais)', () => {
    const result = taskUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('rejeita titulo vazio quando fornecido', () => {
    const result = taskUpdateSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
  })
})
