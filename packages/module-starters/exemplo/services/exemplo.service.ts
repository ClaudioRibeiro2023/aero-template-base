import { apiClient } from '@template/shared'
import type { ExampleItem, ExampleFormData } from '../types'

const BASE_PATH = '/exemplo'

/**
 * Service for Example module API calls
 * Replace with real API endpoints when available
 */
export const exemploService = {
  async getAll(): Promise<ExampleItem[]> {
    const response = await apiClient.get<ExampleItem[]>(BASE_PATH)
    return response.data
  },

  async getById(id: string): Promise<ExampleItem> {
    const response = await apiClient.get<ExampleItem>(`${BASE_PATH}/${id}`)
    return response.data
  },

  async create(data: ExampleFormData): Promise<ExampleItem> {
    const response = await apiClient.post<ExampleItem>(BASE_PATH, data)
    return response.data
  },

  async update(id: string, data: Partial<ExampleFormData>): Promise<ExampleItem> {
    const response = await apiClient.put<ExampleItem>(`${BASE_PATH}/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/${id}`)
  },
}
