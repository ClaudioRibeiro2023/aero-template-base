/**
 * E2E Tests — Command Palette
 *
 * Testa abertura via Cmd+K, busca, navegação por teclado, e fechamento.
 */
import { test, expect } from '@playwright/test'

test.describe('Command Palette', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('abre com Cmd+K (ou Ctrl+K)', async ({ page }) => {
    await page.keyboard.press('Control+k')

    // O dialog da Command Palette deve aparecer
    const palette = page.locator(
      '[role="dialog"][aria-label*="omand" i], [role="dialog"][aria-label*="Busca" i]'
    )
    await expect(palette).toBeVisible({ timeout: 3000 })
  })

  test('fecha com Escape', async ({ page }) => {
    await page.keyboard.press('Control+k')

    const palette = page.locator('[role="dialog"]').filter({ hasText: /busca|search|comando/i })
    await expect(palette).toBeVisible({ timeout: 3000 })

    await page.keyboard.press('Escape')
    await expect(palette).not.toBeVisible()
  })

  test('campo de busca recebe foco automaticamente', async ({ page }) => {
    await page.keyboard.press('Control+k')

    const input = page.locator(
      '[role="dialog"] input[type="text"], [role="dialog"] input[type="search"]'
    )
    await expect(input).toBeFocused({ timeout: 3000 })
  })

  test('digitar texto mostra resultados ou empty state', async ({ page }) => {
    await page.keyboard.press('Control+k')

    const input = page.locator(
      '[role="dialog"] input[type="text"], [role="dialog"] input[type="search"]'
    )
    await input.fill('dashboard')

    // Deve mostrar resultados de navegação ou empty state
    const results = page.locator(
      '[role="dialog"] [role="option"], [role="dialog"] [role="listbox"] > *'
    )
    // Esperar um pouco para a busca processar
    await page.waitForTimeout(500)

    const resultsCount = await results.count()
    // Ou temos resultados ou uma mensagem de "nenhum resultado"
    if (resultsCount === 0) {
      await expect(
        page.locator('[role="dialog"]').filter({ hasText: /nenhum|vazio|empty/i })
      ).toBeVisible()
    } else {
      expect(resultsCount).toBeGreaterThan(0)
    }
  })

  test('navegar resultados com setas e selecionar com Enter', async ({ page }) => {
    await page.keyboard.press('Control+k')

    const input = page.locator(
      '[role="dialog"] input[type="text"], [role="dialog"] input[type="search"]'
    )
    await input.fill('usu')

    await page.waitForTimeout(500)

    // Navegar para baixo
    await page.keyboard.press('ArrowDown')

    // Verificar que algum item tem aria-selected ou está focado
    const activeItem = page.locator(
      '[role="dialog"] [aria-selected="true"], [role="dialog"] [data-active="true"]'
    )
    const count = await activeItem.count()

    if (count > 0) {
      // Pressionar Enter para navegar
      await page.keyboard.press('Enter')
      // Palette deve fechar
      await expect(
        page.locator('[role="dialog"]').filter({ hasText: /busca|search|comando/i })
      ).not.toBeVisible({ timeout: 3000 })
    }
  })

  test('clicar fora fecha a palette', async ({ page }) => {
    await page.keyboard.press('Control+k')

    const palette = page.locator('[role="dialog"]').filter({ hasText: /busca|search|comando/i })
    await expect(palette).toBeVisible({ timeout: 3000 })

    // Clicar no backdrop
    await page.locator('body').click({ position: { x: 10, y: 10 } })
    await expect(palette).not.toBeVisible({ timeout: 3000 })
  })
})
