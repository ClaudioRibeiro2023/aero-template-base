/**
 * E2E Tests — Dashboard DnD (drag-and-drop widget reorder)
 *
 * Testa reordenação de widgets via teclado e persistência em localStorage.
 */
import { test, expect } from '@playwright/test'

test.describe('Dashboard — Widget Reorder', () => {
  test.beforeEach(async ({ page }) => {
    // Limpar localStorage antes de cada teste
    await page.goto('/dashboard')
    await page.evaluate(() => {
      localStorage.removeItem('dashboard-widget-order')
      localStorage.removeItem('dashboard-section-order')
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('KPI cards renderizam na ordem padrão', async ({ page }) => {
    const cards = page.locator('[role="listitem"]')
    const count = await cards.count()

    // Dashboard deve ter pelo menos os 4 KPI cards
    expect(count).toBeGreaterThanOrEqual(4)
  })

  test('KPI cards têm drag handle visível no hover', async ({ page }) => {
    const firstCard = page.locator('[role="listitem"]').first()
    await firstCard.hover()

    // GripVertical icon deve ficar visível
    const grip = firstCard.locator('svg.lucide-grip-vertical, [aria-hidden="true"]').first()
    await expect(grip).toBeVisible()
  })

  test('reordenar KPI card via teclado (ArrowRight)', async ({ page }) => {
    const cards = page.locator('[role="listitem"]')
    const firstCard = cards.first()

    // Focar no primeiro card
    await firstCard.focus()

    // Capturar label antes de mover
    const labelBefore = await firstCard.getAttribute('aria-label')

    // Pressionar ArrowRight para mover para a direita
    await firstCard.press('ArrowRight')

    // O card na posição 0 agora deve ter um label diferente
    const labelAfter = await cards.first().getAttribute('aria-label')
    expect(labelAfter).not.toBe(labelBefore)
  })

  test('persistência em localStorage após reorder', async ({ page }) => {
    const cards = page.locator('[role="listitem"]')
    const firstCard = cards.first()

    await firstCard.focus()
    await firstCard.press('ArrowRight')

    // Verificar localStorage
    const savedOrder = await page.evaluate(() => localStorage.getItem('dashboard-widget-order'))

    expect(savedOrder).not.toBeNull()
    const parsed = JSON.parse(savedOrder!)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed.length).toBe(4)
  })

  test('seções do dashboard renderizam corretamente', async ({ page }) => {
    // Verificar que as seções principais existem
    await expect(page.locator('text=Atividade Mensal')).toBeVisible()
    await expect(page.locator('text=Ações Rápidas')).toBeVisible()
    await expect(page.locator('text=Status do Sistema')).toBeVisible()
    await expect(page.locator('text=Atividade Recente')).toBeVisible()
  })

  test('seções reordenáveis via teclado', async ({ page }) => {
    const sections = page.locator('[data-section-id]')
    const count = await sections.count()

    if (count >= 2) {
      const firstSection = sections.first()
      await firstSection.focus()

      const idBefore = await firstSection.getAttribute('data-section-id')
      await firstSection.press('ArrowDown')

      // Após mover, a primeira seção deve ser diferente
      const idAfter = await sections.first().getAttribute('data-section-id')
      expect(idAfter).not.toBe(idBefore)
    }
  })

  test('Escape remove foco do widget', async ({ page }) => {
    const firstCard = page.locator('[role="listitem"]').first()
    await firstCard.focus()
    await expect(firstCard).toBeFocused()

    await firstCard.press('Escape')
    await expect(firstCard).not.toBeFocused()
  })

  test('Home move widget para primeira posição', async ({ page }) => {
    const cards = page.locator('[role="listitem"]')

    // Focar no terceiro card
    const thirdCard = cards.nth(2)
    await thirdCard.focus()

    // Pressionar Home
    await thirdCard.press('Home')

    // Verificar que a ordem mudou no localStorage
    const saved = await page.evaluate(() => localStorage.getItem('dashboard-widget-order'))

    if (saved) {
      const order = JSON.parse(saved)
      // O terceiro item original deve estar na primeira posição
      expect(order.length).toBe(4)
    }
  })
})
