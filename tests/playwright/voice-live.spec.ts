import { test, expect } from '@playwright/test'

test('voice streams PCM and completes a turn', async ({ page }) => {
  // Enable test metrics collection in the client
  await page.addInitScript(() => {
    ;(window as any).__TEST__ = true
    ;(window as any).__voiceMetrics = { chunks: 0, turns: 0, finalTranscript: '' }
  })

  const baseUrl = process.env.TEST_URL || 'http://localhost:3000'
  await page.goto(`${baseUrl}/chat?voiceMock=1`)

  // Open the VoiceOverlay (dev-only control appears when voiceMock=1)
  const openOverlay = page.getByTestId('open-voice')
  await expect(openOverlay).toBeVisible({ timeout: 5000 })
  await openOverlay.click()

  // Toggle recording in the overlay
  const toggle = page.getByTestId('toggle-voice')
  await expect(toggle).toBeVisible({ timeout: 5000 })
  await toggle.click() // start
  await page.waitForTimeout(800)
  await toggle.click() // stop => sends TURN_COMPLETE

  // Wait for PCM bytes and turn completion
  await page.waitForFunction(() => (window as any).__voiceMetrics?.chunks > 2000, null, { timeout: 15000 })
  await page.waitForFunction(() => (window as any).__voiceMetrics?.turns >= 1, null, { timeout: 15000 })
})


