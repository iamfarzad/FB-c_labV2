import { test, expect } from '@playwright/test'

test.describe('Intelligence flow (Phase 2 acceptance)', () => {
  test('consent → first message → suggestions render → suggestion clickable', async ({ page }) => {
    await page.goto('http://localhost:3000/test/ai-chat')

    // Consent gate
    const emailInput = page.getByPlaceholder('Work email (name@company.com)')
    const companyInput = page.getByPlaceholder('Company website (optional)')
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill(`user+${Date.now()}@example.com`)
      await companyInput.fill('https://example.com')
      await page.getByRole('button', { name: 'Allow' }).click()
    }

    // Wait until consent overlay disappears
    await page.waitForTimeout(500) // brief settle
    await page.locator('text=Personalize this chat using your public company info?').waitFor({ state: 'detached', timeout: 10000 }).catch(() => {})

    // First message (triggers intent)
    const prompt = page.locator('textarea')
    await prompt.first().click()
    await prompt.first().fill('We need an ROI estimate and an integration plan')
    await page.keyboard.press('Enter')

    // Suggestions should render (up to 3 buttons)
    const anySuggestion = page.locator('button', { hasText: /ROI|screen|Translate|Search|PDF|Video|Analyze|Schedule/i })
    await expect(anySuggestion.first()).toBeVisible({ timeout: 10000 })

    // Click first suggestion (ensures it is actionable)
    await anySuggestion.first().click()
  })
})


