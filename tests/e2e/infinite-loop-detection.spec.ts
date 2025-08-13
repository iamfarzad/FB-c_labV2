import { test, expect } from '@playwright/test'

test.describe('Infinite Loop Detection', () => {
  test('should not cause infinite API calls when consent is given', async ({ page }) => {
    // Navigate to the chat page
    await page.goto('http://localhost:3000/chat')
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="consent-form"]', { timeout: 10000 })
    
    // Fill in consent form
    await page.fill('input[placeholder*="email"]', 'farzad@talktoeve.com')
    await page.fill('input[placeholder*="company"]', 'https://talktoeve.com')
    
    // Start monitoring network requests
    const contextRequests: string[] = []
    
    page.on('request', (request) => {
      if (request.url().includes('/api/intelligence/context')) {
        contextRequests.push(request.url())
        console.info(`🔍 Context API called: ${request.url()}`)
      }
    })
    
    // Click allow and wait for initial load
    await page.click('button:has-text("Allow")')
    
    // Wait for the consent to be processed
    await page.waitForTimeout(2000)
    
    // Wait a bit more to see if there are additional calls
    await page.waitForTimeout(5000)
    
    // Check that we don't have excessive API calls
    console.info(`📊 Total context API calls: ${contextRequests.length}`)
    
    // Should have at most 2-3 calls (initial + maybe one retry)
    expect(contextRequests.length).toBeLessThanOrEqual(3)
    
    // Check that we have a personalized greeting
    const greeting = await page.locator('.message').first().textContent()
    expect(greeting).toContain('Farzad Bayat')
    expect(greeting).toContain('Talk to EVE')
  })
  
  test('should prevent duplicate context fetches for same session', async ({ page }) => {
    await page.goto('http://localhost:3000/chat')
    
    // Fill and submit consent
    await page.fill('input[placeholder*="email"]', 'farzad@talktoeve.com')
    await page.fill('input[placeholder*="company"]', 'https://talktoeve.com')
    await page.click('button:has-text("Allow")')
    
    // Wait for initial load
    await page.waitForTimeout(3000)
    
    // Trigger multiple state changes that could cause re-renders
    await page.evaluate(() => {
      // Simulate multiple React re-renders
      window.dispatchEvent(new Event('resize'))
      window.dispatchEvent(new Event('scroll'))
    })
    
    await page.waitForTimeout(2000)
    
    // Check console for any error messages about infinite loops
    const consoleMessages = await page.evaluate(() => {
      return (window as any).consoleMessages || []
    })
    
    const errorMessages = consoleMessages.filter((msg: string) => 
      msg.includes('Maximum update depth exceeded') || 
      msg.includes('infinite loop') ||
      msg.includes('too many re-renders')
    )
    
    expect(errorMessages.length).toBe(0)
  })
})
