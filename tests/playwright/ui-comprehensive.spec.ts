import { test, expect } from '@playwright/test'

test.describe('Comprehensive UI Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the chat page
    await page.goto('http://localhost:3000/chat')
    await page.waitForLoadState('networkidle')
  })

  test('should load chat page correctly', async ({ page }) => {
    // Check if the page loads without errors
    await expect(page).toHaveTitle(/F\.B/)
    
    // Check for main chat elements
    await expect(page.locator('[data-testid="chat-layout"]')).toBeVisible()
    await expect(page.locator('[data-testid="chat-main"]')).toBeVisible()
    await expect(page.locator('[data-testid="chat-footer"]')).toBeVisible()
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible()
    
    // Check for welcome message
    await expect(page.getByText('Welcome to F.B/c AI')).toBeVisible()
  })

  test('should send and receive messages', async ({ page }) => {
    const testMessage = 'Hello, this is a test message'
    
    // Type and send a message
    await page.locator('[data-testid="message-input"]').fill(testMessage)
    await page.locator('[data-testid="message-input"]').press('Enter')
    
    // Wait for the message to appear
    await expect(page.getByText(testMessage)).toBeVisible()
    
    // Wait for AI response (mock response)
    await expect(page.getByText(/\[MOCK\]/)).toBeVisible({ timeout: 10000 })
  })

  test('should handle file upload button', async ({ page }) => {
    // Check if file upload button exists
    const fileUploadButton = page.locator('button[aria-label*="upload"], button[aria-label*="file"]')
    await expect(fileUploadButton.first()).toBeVisible()
  })

  test('should handle voice input button', async ({ page }) => {
    // Check if voice input button exists
    const voiceButton = page.locator('button[aria-label*="mic"], button[aria-label*="voice"]')
    await expect(voiceButton.first()).toBeVisible()
  })

  test('should handle sidebar toggle', async ({ page }) => {
    // Check if sidebar toggle button exists
    const sidebarToggle = page.locator('button[aria-label*="menu"], button[aria-label*="sidebar"]')
    if (await sidebarToggle.count() > 0) {
      await sidebarToggle.first().click()
      // Check if sidebar is visible after toggle
      await expect(page.locator('[data-testid="sidebar"], .sidebar')).toBeVisible()
    }
  })

  test('should handle new chat functionality', async ({ page }) => {
    // Look for new chat button
    const newChatButton = page.getByText('New Chat')
    if (await newChatButton.count() > 0) {
      await newChatButton.click()
      // Should clear messages
      await expect(page.getByText('Welcome to F.B/c AI')).toBeVisible()
    }
  })

  test('should handle export summary', async ({ page }) => {
    // Look for export button
    const exportButton = page.getByText('Export Summary')
    if (await exportButton.count() > 0) {
      await exportButton.click()
      // Should trigger download or show success message
      await expect(page.getByText(/export|download/i)).toBeVisible({ timeout: 5000 })
    }
  })

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Test Ctrl+Enter to send message
    await page.locator('[data-testid="message-input"]').fill('Test keyboard shortcut')
    await page.keyboard.press('Control+Enter')
    
    // Should send the message
    await expect(page.getByText('Test keyboard shortcut')).toBeVisible()
  })

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check if elements are still visible
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="chat-main"]')).toBeVisible()
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible()
  })

  test('should handle error states', async ({ page }) => {
    // Try to send an empty message
    await page.locator('[data-testid="message-input"]').press('Enter')
    
    // Should not send empty message
    const messages = page.locator('[data-testid="messages-container"] .message')
    const messageCount = await messages.count()
    
    // Send a valid message
    await page.locator('[data-testid="message-input"]').fill('Valid message')
    await page.locator('[data-testid="message-input"]').press('Enter')
    
    // Should have one more message
    await expect(page.locator('[data-testid="messages-container"] .message')).toHaveCount(messageCount + 1)
  })

  test('should handle loading states', async ({ page }) => {
    // Send a message and check loading state
    await page.locator('[data-testid="message-input"]').fill('Test loading state')
    await page.locator('[data-testid="message-input"]').press('Enter')
    
    // Should show loading indicator
    await expect(page.locator('[data-testid="message-input"]')).toBeDisabled()
    
    // Wait for response
    await expect(page.getByText(/\[MOCK\]/)).toBeVisible({ timeout: 10000 })
    
    // Should be enabled again
    await expect(page.locator('[data-testid="message-input"]')).toBeEnabled()
  })

  test('should handle accessibility', async ({ page }) => {
    // Check for proper ARIA labels
    await expect(page.locator('[data-testid="message-input"]')).toHaveAttribute('aria-label')
    
    // Check for proper focus management
    await page.locator('[data-testid="message-input"]').focus()
    await expect(page.locator('[data-testid="message-input"]')).toBeFocused()
    
    // Check for keyboard navigation
    await page.keyboard.press('Tab')
    // Should move focus to next interactive element
  })

  test('should handle theme switching', async ({ page }) => {
    // Look for theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="dark"], button[aria-label*="light"]')
    if (await themeToggle.count() > 0) {
      await themeToggle.first().click()
      // Should change theme
      await expect(page.locator('html')).toHaveAttribute('class', /dark|light/)
    }
  })

  test('should handle navigation', async ({ page }) => {
    // Test navigation to other pages
    await page.goto('http://localhost:3000/')
    await expect(page.getByText('AI Automation')).toBeVisible()
    
    await page.goto('http://localhost:3000/chat')
    await expect(page.getByText('Welcome to F.B/c AI')).toBeVisible()
  })

  test('should handle session management', async ({ page }) => {
    // Send a message to create session
    await page.locator('[data-testid="message-input"]').fill('Session test')
    await page.locator('[data-testid="message-input"]').press('Enter')
    
    // Wait for response
    await expect(page.getByText(/\[MOCK\]/)).toBeVisible({ timeout: 10000 })
    
    // Refresh page
    await page.reload()
    
    // Should still be on chat page
    await expect(page.getByText('Welcome to F.B/c AI')).toBeVisible()
  })
}) 