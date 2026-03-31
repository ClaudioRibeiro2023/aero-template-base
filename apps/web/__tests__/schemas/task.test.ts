import { describe, it, expect } from 'vitest'
import {
  taskCreateSchema,
  taskUpdateSchema,
  TaskStatusEnum,
  TaskPriorityEnum,
} from '@template/shared/schemas'

describe('TaskStatusEnum', () => {
  it('aceita valores válidos', () => {
    for (const v of ['todo', 'in_progress', 'done', 'cancelled']) {
      expect(TaskStatusEnum.safeParse(v).success).toBe(true)
    }
  })

  it('rejeita valor inválido', () => {
    expect(TaskStatusEnum.safeParse('pending').success).toBe(false)
  })
})

describe('TaskPriorityEnum', () => {
  it('aceita valores válidos', () => {
    for (const v of ['low', 'medium', 'high', 'critical']) {
      expect(TaskPriorityEnum.safeParse(v).success).toBe(true)
    }
    expect(TaskPriorityEnum.safeParse('low').success).toBe(true)
    expect(TaskPriorityEnum.safeParse('critical').success).toBe(true)
  })

  it('rejeita valor inválido', () => {
    expect(TaskPriorityEnum.safeParse('urgent').success).toBe(false)
  })
})

describe('taskCreateSchema', () => {
  it('valida task mínima', () => {
    const result = taskCreateSchema.safeParse({ title: 'Implementar feature X' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('todo')
      expect(result.data.priority).toBe('medium')
    }
  })

  it('valida task completa', () => {
    const result = taskCreateSchema.safeParse({
      title: 'Implementar feature X',
      description: 'Detalhes da implementação',
      status: 'in_progress',
      priority: 'high',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita título vazio', () => {
    const result = taskCreateSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title).toBeDefined()
    }
  })

  it('rejeita título muito longo (>255 chars)', () => {
    const result = taskCreateSchema.safeParse({ title: 'a'.repeat(256) })
    expect(result.success).toBe(false)
  })

  it('rejeita descrição muito longa (>5000 chars)', () => {
    const result = taskCreateSchema.safeParse({
      title: 'OK',
      description: 'x'.repeat(5001),
    })
    expect(result.success).toBe(false)
  })

  it('aceita assignee_id como UUID válido', () => {
    const result = taskCreateSchema.safeParse({
      title: 'Task',
      assignee_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita assignee_id inválido (não UUID)', () => {
    const result = taskCreateSchema.safeParse({
      title: 'Task',
      assignee_id: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })

  it('aceita assignee_id como string vazia (campo opcional)', () => {
    const result = taskCreateSchema.safeParse({
      title: 'Task',
      assignee_id: '',
    })
    expect(result.success).toBe(true)
  })

  it('aplica trim no título', () => {
    const result = taskCreateSchema.safeParse({ title: '  Título com espaços  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Título com espaços')
    }
  })
})

describe('taskUpdateSchema', () => {
  it('aceita objeto vazio (todos campos opcionais)', () => {
    const result = taskUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('aceita update parcial de status', () => {
    const result = taskUpdateSchema.safeParse({ status: 'done' })
    expect(result.success).toBe(true)
  })

  it('aceita update parcial de priority', () => {
    const result = taskUpdateSchema.safeParse({ priority: 'critical' })
    expect(result.success).toBe(true)
  })

  it('rejeita título vazio em update', () => {
    const result = taskUpdateSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
  })

  it('aceita update completo', () => {
    const result = taskUpdateSchema.safeParse({
      title: 'Título atualizado',
      description: 'Nova descrição',
      status: 'done',
      priority: 'low',
    })
    expect(result.success).toBe(true)
  })
})
