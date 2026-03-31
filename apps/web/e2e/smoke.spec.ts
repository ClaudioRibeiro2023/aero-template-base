import { test, expect } from '@playwright/test'

test('health endpoint retorna 200', async ({ request }) => {
  const response = await request.get('/api/health')
  expect(response.status()).toBe(200)
  const body = await response.json()
  // health retorna wrapper { data: { status, ... }, error, meta }
  expect(body.data).toHaveProperty('status')
})

test('página de login carrega', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveTitle(/Template|Login|Aero/i)
  await expect(page.locator('input[type="email"]')).toBeVisible()
})

test('rota raiz redireciona ou carrega', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBeLessThan(500)
})
