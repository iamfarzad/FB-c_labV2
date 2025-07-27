import { test, expect } from '@playwright/test';

test.describe('Chat Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the chat page before each test
    await page.goto('/chat');
  });

  test('should load the chat interface', async ({ page }) => {
    // Check if the chat container is visible
    await expect(page.locator('[data-testid="chat-container"]')).toBeVisible();
    
    // Check if the message input is present
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible();
    
    // Check if the send button is present
    await expect(page.locator('[data-testid="send-button"]')).toBeVisible();
  });

  test('should send and display a message', async ({ page }) => {
    const testMessage = 'Hello, this is a test message';
    
    // Type a message
    await page.locator('[data-testid="message-input"]').fill(testMessage);
    
    // Click the send button
    await page.locator('[data-testid="send-button"]').click();
    
    // Check if the message appears in the chat
    await expect(page.locator(`[data-testid="message"]:has-text("${testMessage}")`)).toBeVisible();
    
    // Check if the message is marked as sent
    await expect(page.locator('[data-testid="message-status"]').last()).toHaveText('✓✓');
  });

  test('should display typing indicator when receiving a message', async ({ page }) => {
    // Mock a response from the server
    await page.route('**/api/chat', route => {
      // Simulate a delay to show typing indicator
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'This is a test response',
            timestamp: new Date().toISOString()
          })
        });
      }, 1000);
    });

    // Send a message
    await page.locator('[data-testid="message-input"]').fill('Test message');
    await page.locator('[data-testid="send-button"]').click();
    
    // Check if typing indicator appears
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();
    
    // Wait for the response and check if it appears
    await expect(page.locator('[data-testid="message"]:has-text("This is a test response")')).toBeVisible({
      timeout: 5000
    });
  });

  test('should handle empty message', async ({ page }) => {
    // Try to send an empty message
    await page.locator('[data-testid="send-button"]').click();
    
    // Check that no message was added
    const messageCount = await page.locator('[data-testid="message"]').count();
    expect(messageCount).toBe(0);
  });

  test('should display error when message fails to send', async ({ page }) => {
    // Mock a failed API response
    await page.route('**/api/chat', route => {
      route.fulfill({
        status: 500,
        body: 'Internal Server Error'
      });
    });

    // Send a message
    await page.locator('[data-testid="message-input"]').fill('This should fail');
    await page.locator('[data-testid="send-button"]').click();
    
    // Check if error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({
      timeout: 5000
    });
  });

  test('should support keyboard shortcuts', async ({ page }) => {
    // Test sending message with Enter key
    await page.locator('[data-testid="message-input"]').fill('Message with Enter');
    await page.keyboard.press('Enter');
    await expect(page.locator('text=Message with Enter')).toBeVisible();
    
    // Test Shift+Enter for new line
    await page.locator('[data-testid="message-input"]').fill('First line');
    await page.keyboard.down('Shift');
    await page.keyboard.press('Enter');
    await page.keyboard.up('Shift');
    await page.keyboard.type('Second line');
    
    // Check that the message wasn't sent yet
    await expect(page.locator('text=Second line')).not.toBeVisible();
    
    // Send the message
    await page.keyboard.press('Enter');
    await expect(page.locator('text=First line\nSecond line')).toBeVisible();
  });

  test('should display message timestamps', async ({ page }) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Send a message
    await page.locator('[data-testid="message-input"]').fill('Test timestamp');
    await page.locator('[data-testid="send-button"]').click();
    
    // Check if timestamp is displayed
    await expect(page.locator(`[data-testid="message-time"]:has-text("${timeString}")`).first()).toBeVisible({
      timeout: 1000
    });
  });
});
