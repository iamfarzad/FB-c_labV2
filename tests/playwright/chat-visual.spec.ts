import { test, expect } from '@playwright/test'

test.describe('Chat Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/chat')
    await page.waitForSelector('[data-testid="chat-layout"]', { state: 'visible', timeout: 30000 })
  })

  test('visual snapshot of empty chat page', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForTimeout(1000)
    
    // Take screenshot of the entire chat interface
    await expect(page.locator('[data-testid="chat-layout"]')).toHaveScreenshot('chat-empty-state.png')
  })

  test('visual snapshot of chat with messages', async ({ page }) => {
    const input = page.getByPlaceholder('Ask anything...')
    
    // Add a few messages to create content
    await input.fill('Hello, this is a test message')
    await input.press('Enter')
    await page.waitForTimeout(500)
    
    await input.fill('This is a second message to test the conversation flow')
    await input.press('Enter')
    await page.waitForTimeout(500)
    
    // Take screenshot with messages
    await expect(page.locator('[data-testid="chat-layout"]')).toHaveScreenshot('chat-with-messages.png')
  })

  test('visual snapshot of chat input area', async ({ page }) => {
    // Focus on just the input area
    const chatFooter = page.locator('[data-testid="chat-footer"]')
    await expect(chatFooter).toHaveScreenshot('chat-input-area.png')
  })

  test('visual snapshot of chat on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    // Take mobile screenshot
    await expect(page.locator('[data-testid="chat-layout"]')).toHaveScreenshot('chat-mobile-view.png')
  })

  test('visual snapshot of chat on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(500)
    
    // Take tablet screenshot
    await expect(page.locator('[data-testid="chat-layout"]')).toHaveScreenshot('chat-tablet-view.png')
  })

  test('visual snapshot of chat input with text', async ({ page }) => {
    const input = page.getByPlaceholder('Ask anything...')
    
    // Fill input with text
    await input.fill('This is some sample text in the input field to test how it looks')
    
    // Take screenshot of input with text
    const chatFooter = page.locator('[data-testid="chat-footer"]')
    await expect(chatFooter).toHaveScreenshot('chat-input-with-text.png')
  })

  test('visual snapshot of loading state', async ({ page }) => {
    const input = page.getByPlaceholder('Ask anything...')
    
    // Send a message to trigger loading state
    await input.fill('Test message for loading state')
    await input.press('Enter')
    
    // Quickly capture loading state (if visible)
    await page.waitForTimeout(100)
    await expect(page.locator('[data-testid="chat-layout"]')).toHaveScreenshot('chat-loading-state.png')
  })

  test('visual snapshot of chat with long message', async ({ page }) => {
    const input = page.getByPlaceholder('Ask anything...')
    
    // Send a very long message
    const longMessage = 'This is a very long message that should test how the chat interface handles lengthy content and text wrapping. '.repeat(10)
    await input.fill(longMessage)
    await input.press('Enter')
    await page.waitForTimeout(1000)
    
    // Take screenshot with long message
    await expect(page.locator('[data-testid="chat-layout"]')).toHaveScreenshot('chat-long-message.png')
  })

  test('visual snapshot of dark mode (if available)', async ({ page }) => {
    // Try to toggle dark mode if available
    const darkModeToggle = page.locator('button[aria-label*="dark"], button[aria-label*="theme"], button:has-text("dark")')
    
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click()
      await page.waitForTimeout(500)
      
      // Take dark mode screenshot
      await expect(page.locator('[data-testid="chat-layout"]')).toHaveScreenshot('chat-dark-mode.png')
    } else {
      // Skip if dark mode toggle not found
      test.skip()
    }
  })

  test('visual snapshot of attachment menu (if available)', async ({ page }) => {
    // Try to open attachment menu
    const attachButton = page.locator('button[aria-label*="attachment"], button[aria-label*="Attachment"], button:has([data-testid*="attach"])')
    
    if (await attachButton.first().isVisible()) {
      await attachButton.first().click()
      await page.waitForTimeout(500)
      
      // Take screenshot with attachment menu open
      await expect(page.locator('[data-testid="chat-layout"]')).toHaveScreenshot('chat-attachment-menu.png')
    } else {
      // Skip if attachment button not found
      test.skip()
    }
  })

  test('visual snapshot comparison across browsers', async ({ page, browserName }) => {
    // Add a message for consistency
    const input = page.getByPlaceholder('Ask anything...')
    await input.fill('Cross-browser test message')
    await input.press('Enter')
    await page.waitForTimeout(1000)
    
    // Take browser-specific screenshot
    await expect(page.locator('[data-testid="chat-layout"]')).toHaveScreenshot(`chat-${browserName}.png`)
  })
})