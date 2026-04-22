/**
 * Tipos do módulo template.
 * Substitua pelo modelo de dados do seu módulo.
 */

export interface TemplateItem {
  id: string
  title: string
  description?: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  updatedAt: string
}

export interface TemplateFormData {
  title: string
  description?: string
  status: TemplateItem['status']
}

export interface TemplateFilter {
  search?: string
  status?: TemplateItem['status'] | 'all'
}
