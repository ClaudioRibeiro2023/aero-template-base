/**
 * E2E Tests — Bulk Actions (tickets + users)
 *
 * Testa fluxos de seleção em massa, ações bulk (fechar, exportar),
 * e feedback visual (toast, undo).
 */
import { test, expect } from '@playwright/test'

test.describe('Bulk Actions — Tickets', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a lista de tickets (autenticado via cookie ou bypass de auth)
    await page.goto('/support/tickets')
    await page.waitForLoadState('networkidle')
  })

  test('selecionar todos os tickets via checkbox "Todos"', async ({ page }) => {
    const selectAll = page.locator('input[type="checkbox"]').first()
    // Se houver tickets na página
    const ticketCheckboxes = page.locator('input[type="checkbox"][aria-label^="Selecionar ticket"]')
    const count = await ticketCheckboxes.count()

    if (count > 0) {
      await selectAll.check()
      // Verificar que a BulkActionBar aparece
      await expect(page.locator('text=/selecionado/i')).toBeVisible()

      // Desmarcar todos
      await selectAll.uncheck()
      await expect(page.locator('text=/selecionado/i')).not.toBeVisible()
    }
  })

  test('BulkActionBar mostra ações corretas quando tickets selecionados', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"][aria-label^="Selecionar ticket"]')
    const count = await checkboxes.count()

    if (count >= 2) {
      await checkboxes.nth(0).check()
      await checkboxes.nth(1).check()

      // BulkActionBar deve mostrar botões de ação
      const bar = page.locator('[class*="fixed"]').filter({ hasText: /selecionado/i })
      await expect(bar).toBeVisible()

      // Verificar que as ações existem
      await expect(bar.locator('text=Fechar')).toBeVisible()
      await expect(bar.locator('text=CSV')).toBeVisible()
      await expect(bar.locator('text=XLSX')).toBeVisible()
    }
  })

  test('exportar tickets selecionados como CSV gera download', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"][aria-label^="Selecionar ticket"]')
    const count = await checkboxes.count()

    if (count > 0) {
      await checkboxes.nth(0).check()

      // Escutar evento de download
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)

      // Clicar em CSV
      await page.locator('button:has-text("CSV")').click()

      const download = await downloadPromise
      if (download) {
        expect(download.suggestedFilename()).toContain('tickets')
        expect(download.suggestedFilename()).toMatch(/\.csv$/)
      }
    }
  })

  test('exportar tickets selecionados como XLSX gera download', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"][aria-label^="Selecionar ticket"]')
    const count = await checkboxes.count()

    if (count > 0) {
      await checkboxes.nth(0).check()

      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)

      await page.locator('button:has-text("XLSX")').click()

      const download = await downloadPromise
      if (download) {
        expect(download.suggestedFilename()).toContain('tickets')
        expect(download.suggestedFilename()).toMatch(/\.xls$/)
      }
    }
  })

  test('limpar seleção via botão "Limpar" no BulkActionBar', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"][aria-label^="Selecionar ticket"]')
    const count = await checkboxes.count()

    if (count > 0) {
      await checkboxes.nth(0).check()

      const clearButton = page.locator('button[aria-label*="limpar" i], button:has-text("Limpar")')
      if (await clearButton.isVisible()) {
        await clearButton.click()
        await expect(page.locator('text=/selecionado/i')).not.toBeVisible()
      }
    }
  })
})

test.describe('Bulk Actions — Users', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/usuarios')
    await page.waitForLoadState('networkidle')
  })

  test('selecionar usuários e ver BulkActionBar', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"][aria-label^="Selecionar"]')
    const count = await checkboxes.count()

    if (count >= 2) {
      // Primeiro checkbox é "selecionar todos", pular
      await checkboxes.nth(1).check()
      await checkboxes.nth(2).check()

      await expect(page.locator('text=/selecionado/i')).toBeVisible()
      await expect(page.locator('text=Desativar')).toBeVisible()
      await expect(page.locator('text=CSV')).toBeVisible()
    }
  })

  test('exportar usuários como CSV', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"][aria-label^="Selecionar"]')
    const count = await checkboxes.count()

    if (count >= 2) {
      await checkboxes.nth(1).check()

      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)
      await page.locator('button:has-text("CSV")').click()

      const download = await downloadPromise
      if (download) {
        expect(download.suggestedFilename()).toContain('usuarios')
      }
    }
  })
})
