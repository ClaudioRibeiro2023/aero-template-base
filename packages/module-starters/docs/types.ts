// Docs Module Types — placeholder. Expanda conforme o módulo crescer.

export type DocCategory = 'guide' | 'reference' | 'changelog' | 'faq'

export interface DocPage {
  id: string
  slug: string
  title: string
  category: DocCategory
  content: string
  updatedAt: string
  tags: string[]
}

export interface DocSearchResult {
  pageId: string
  title: string
  excerpt: string
  score: number
}
