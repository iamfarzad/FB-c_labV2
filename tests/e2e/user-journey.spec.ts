import { test, expect } from '@playwright/test'

test.describe('User Journey', () => {
  test('Complete chat flow', async ({ page }) => {
    await page.goto('/')
    
    // Check if page loads
    await expect(page).toHaveTitle(/F\.B/)
    
    // Navigate to chat
    await page.click('text=Chat')
    await expect(page).toHaveURL('/chat')
    
    // Check if chat interface is loaded
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible()
  })
  
  test('Lead capture flow', async ({ page }) => {
    await page.goto('/chat')
    
    // Check if lead capture form appears
    await expect(page.locator('[data-testid="lead-form"]')).toBeVisible()
    
    // Fill lead form
    await page.fill('[data-testid="name-input"]', 'Test User')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="submit-lead"]')
    
    // Verify lead capture completion
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible()
  })

  test('Navigation works correctly', async ({ page }) => {
    await page.goto('/')
    
    // Test navigation links
    await page.click('text=About')
    await expect(page).toHaveURL('/about')
    
    await page.click('text=Consulting')
    await expect(page).toHaveURL('/consulting')
    
    await page.click('text=Contact')
    await expect(page).toHaveURL('/contact')
  })

  test('Theme switching works', async ({ page }) => {
    await page.goto('/')
    
    // Find theme toggle
    const themeToggle = page.locator('[data-testid="theme-toggle"]')
    await expect(themeToggle).toBeVisible()
    
    // Click theme toggle
    await themeToggle.click()
    
    // Check if theme class is applied
    await expect(page.locator('html')).toHaveClass(/dark/)
  })
})