// Tipos específicos do módulo Exemplo

export interface ExampleItem {
  id: string
  title: string
  description: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
}

export interface ExampleFormData {
  title: string
  description: string
  status: ExampleItem['status']
}
