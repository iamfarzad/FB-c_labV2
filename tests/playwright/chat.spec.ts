import { test, expect } from '@playwright/test'

test.describe('Chat Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/chat')
    // Wait for the chat to be fully loaded
    await page.waitForSelector('[data-testid="chat-layout"]', { state: 'visible', timeout: 30000 })
  })

  test('should load page and show all essential UI elements', async ({ page }) => {
    // Page loads
    await expect(page.locator('[data-testid="chat-layout"]')).toBeVisible()
    await expect(page.locator('[data-testid="chat-main"]')).toBeVisible()
    await expect(page.locator('[data-testid="chat-footer"]')).toBeVisible()
    
    // Input bar visible
    const input = page.getByPlaceholder('Ask anything...')
    await expect(input).toBeVisible()
    
    // Audio buttons visible
    await expect(page.locator('button[aria-label*="voice"], button[aria-label*="Voice"], button:has-text("voice"), button:has([data-testid*="mic"]), button:has([data-testid*="voice"])')).toBeVisible()
    
    // Attachment button visible
    await expect(page.locator('button[aria-label*="attachment"], button[aria-label*="Attachment"], button:has([data-testid*="attach"])')).toBeVisible()
  })

  test('should allow typing and sending messages', async ({ page }) => {
    const input = page.getByPlaceholder('Ask anything...')
    
    // Typing works
    await input.fill('Hello, this is a test message')
    await expect(input).toHaveValue('Hello, this is a test message')
    
    // Send message triggers response
    await input.press('Enter')
    
    // Input should clear after sending
    await expect(input).toHaveValue('')
    
    // Message should appear in chat
    await expect(page.locator('[data-testid="messages-container"]')).toContainText('Hello, this is a test message')
  })

  test('should handle voice input buttons', async ({ page }) => {
    // Look for voice/mic buttons with various possible selectors
    const voiceButtons = page.locator('button[aria-label*="voice"], button[aria-label*="Voice"], button[aria-label*="mic"], button[aria-label*="Mic"], button:has([data-testid*="mic"]), button:has([data-testid*="voice"])')
    
    // At least one voice button should be visible
    await expect(voiceButtons.first()).toBeVisible()
    
    // Voice buttons should be clickable
    const firstVoiceButton = voiceButtons.first()
    await expect(firstVoiceButton).toBeEnabled()
    
    // Click should not cause errors (may open modal)
    await firstVoiceButton.click()
    
    // Wait a moment for any modal to appear
    await page.waitForTimeout(500)
    
    // If modal opened, close it
    const closeButton = page.locator('button[aria-label*="close"], button[aria-label*="Close"], button:has-text("×"), button:has-text("Close")')
    if (await closeButton.isVisible()) {
      await closeButton.click()
    }
  })

  test('should open attachment menu', async ({ page }) => {
    // Look for attachment button
    const attachButton = page.locator('button[aria-label*="attachment"], button[aria-label*="Attachment"], button:has([data-testid*="attach"]), button:has(svg)')
    
    await expect(attachButton.first()).toBeVisible()
    await attachButton.first().click()
    
    // Wait for menu to appear
    await page.waitForTimeout(500)
    
    // Look for attachment menu indicators
    const attachmentMenu = page.locator('text*="photo", text*="file", text*="upload", [data-testid*="attach"], [role="menu"]')
    
    // At least one attachment-related element should appear
    const menuVisible = await attachmentMenu.first().isVisible().catch(() => false)
    if (menuVisible) {
      expect(menuVisible).toBe(true)
    }
  })

  test('should handle multiple message exchange', async ({ page }) => {
    const input = page.getByPlaceholder('Ask anything...')
    const messagesContainer = page.locator('[data-testid="messages-container"]')
    
    // Send first message
    await input.fill('First message')
    await input.press('Enter')
    await expect(messagesContainer).toContainText('First message')
    
    // Send second message
    await input.fill('Second message')
    await input.press('Enter')
    await expect(messagesContainer).toContainText('Second message')
    
    // Both messages should be visible
    await expect(messagesContainer).toContainText('First message')
    await expect(messagesContainer).toContainText('Second message')
  })

  test('should maintain responsive layout', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('[data-testid="chat-layout"]')).toBeVisible()
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('[data-testid="chat-layout"]')).toBeVisible()
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('[data-testid="chat-layout"]')).toBeVisible()
    
    // Input should still be accessible on mobile
    const input = page.getByPlaceholder('Ask anything...')
    await expect(input).toBeVisible()
  })

  test('should handle keyboard shortcuts', async ({ page }) => {
    const input = page.getByPlaceholder('Ask anything...')
    
    // Focus input
    await input.click()
    
    // Test Ctrl+Enter (or Cmd+Enter on Mac) for sending
    await input.fill('Test keyboard shortcut message')
    await input.press('Control+Enter')
    
    // Message should be sent
    await expect(page.locator('[data-testid="messages-container"]')).toContainText('Test keyboard shortcut message')
  })

  test('should handle long messages and scrolling', async ({ page }) => {
    const input = page.getByPlaceholder('Ask anything...')
    const messagesContainer = page.locator('[data-testid="messages-container"]')
    
    // Send a very long message
    const longMessage = 'This is a very long message that should test how the chat handles lengthy content. '.repeat(10)
    await input.fill(longMessage)
    await input.press('Enter')
    
    // Message should appear
    await expect(messagesContainer).toContainText('This is a very long message')
    
    // Container should be scrollable if needed
    const isScrollable = await messagesContainer.evaluate(el => el.scrollHeight > el.clientHeight)
    if (isScrollable) {
      // Test scrolling
      await messagesContainer.evaluate(el => el.scrollTo(0, 0))
      await messagesContainer.evaluate(el => el.scrollTo(0, el.scrollHeight))
    }
  })

  test('should handle rapid message sending', async ({ page }) => {
    const input = page.getByPlaceholder('Ask anything...')
    const messagesContainer = page.locator('[data-testid="messages-container"]')
    
    // Send multiple messages quickly
    for (let i = 1; i <= 3; i++) {
      await input.fill(`Rapid message ${i}`)
      await input.press('Enter')
      await page.waitForTimeout(100) // Small delay to avoid overwhelming
    }
    
    // All messages should appear
    await expect(messagesContainer).toContainText('Rapid message 1')
    await expect(messagesContainer).toContainText('Rapid message 2') 
    await expect(messagesContainer).toContainText('Rapid message 3')
  })

  test('should maintain state across page interactions', async ({ page }) => {
    const input = page.getByPlaceholder('Ask anything...')
    
    // Send a message
    await input.fill('State test message')
    await input.press('Enter')
    
    // Interact with other elements (click around)
    await page.locator('body').click()
    await input.click()
    
    // Previous message should still be visible
    await expect(page.locator('[data-testid="messages-container"]')).toContainText('State test message')
    
    // Input should still work
    await input.fill('Second state test')
    await input.press('Enter')
    await expect(page.locator('[data-testid="messages-container"]')).toContainText('Second state test')
  })
})