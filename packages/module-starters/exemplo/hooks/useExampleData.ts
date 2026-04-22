import { useState, useEffect } from 'react'
import type { ExampleItem } from '../types'

// Mock data for demonstration
const MOCK_DATA: ExampleItem[] = [
  {
    id: '1',
    title: 'Item de Exemplo 1',
    description: 'Este é um item de demonstração do módulo exemplo.',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Item de Exemplo 2',
    description: 'Outro item para mostrar a estrutura do módulo.',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Item Inativo',
    description: 'Um item com status inativo para demonstração.',
    status: 'inactive',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
]

export function useExampleData() {
  const [items, setItems] = useState<ExampleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, _setError] = useState<Error | null>(null)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setItems(MOCK_DATA)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const addItem = (item: Omit<ExampleItem, 'id' | 'createdAt'>) => {
    const newItem: ExampleItem = {
      ...item,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
    }
    setItems(prev => [newItem, ...prev])
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  return {
    items,
    isLoading,
    error,
    addItem,
    removeItem,
  }
}
