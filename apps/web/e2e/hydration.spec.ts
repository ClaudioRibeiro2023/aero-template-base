import { test, expect } from '@playwright/test'

/**
 * Smoke test de hidratação React.
 *
 * Previne regressão do bug CSP dev (commit 4e14c3d) em que o webpack
 * eval-source-map era bloqueado, impedindo a hidratação e deixando
 * todos os botões inertes.
 *
 * Valida:
 *  1. React fiber keys presentes no body (prova que hidratou)
 *  2. Zero erros JS críticos no console durante a hidratação
 *  3. /manifest.webmanifest responde 200 com JSON válido
 *  4. /favicon.ico responde via rewrite (status < 400)
 *  5. /login carrega sem requests 5xx
 */

test.describe('hidratação e PWA assets', () => {
  test('login hidrata — React fiber keys presentes', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    await page.goto('/login', { waitUntil: 'networkidle' })

    const fiberKeys = await page.evaluate(() => {
      const body = document.body
      return Object.keys(body).filter(
        k => k.startsWith('__reactFiber') || k.startsWith('__reactProps')
      )
    })

    expect(fiberKeys.length, 'React fiber keys em <body>').toBeGreaterThan(0)
    const criticalErrors = consoleErrors.filter(
      e => !/favicon|manifest\.json|404|DevTools/i.test(e)
    )
    expect(criticalErrors, 'console limpo durante hidratação').toEqual([])
  })

  test('manifest.webmanifest responde 200 com JSON válido', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest')
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('name')
    expect(body).toHaveProperty('icons')
    expect(Array.isArray(body.icons)).toBe(true)
  })

  test('favicon.ico responde (via rewrite para icon.svg)', async ({ request }) => {
    const response = await request.get('/favicon.ico')
    expect(response.status()).toBeLessThan(400)
  })

  test('login sem requests 5xx', async ({ page }) => {
    const failedRequests: Array<{ url: string; status: number }> = []
    page.on('response', res => {
      if (res.status() >= 500) {
        failedRequests.push({ url: res.url(), status: res.status() })
      }
    })
    await page.goto('/login', { waitUntil: 'networkidle' })
    expect(failedRequests, '0 requests 5xx').toEqual([])
  })
})
