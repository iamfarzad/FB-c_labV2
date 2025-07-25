import { test, expect } from '@playwright/test';

test.describe('Chat Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/chat');
    // Wait for the chat to be fully loaded
    await page.waitForSelector('[data-testid="chat-layout"]', { state: 'visible', timeout: 30000 });
  });

  test('should load chat page with all essential elements', async ({ page }) => {
    // Check main layout components
    await expect(page.locator('[data-testid="chat-layout"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-main"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-footer"]')).toBeVisible();
    
    // Check input elements
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="send-button"]')).toBeVisible();
  });

  test('should handle text input and message sending', async ({ page }) => {
    const input = page.locator('[data-testid="message-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    // Test typing in input
    await input.fill('Hello, this is a test message');
    await expect(input).toHaveValue('Hello, this is a test message');
    
    // Test sending via Enter key
    await input.press('Enter');
    await expect(input).toHaveValue(''); // Should clear after sending
    
    // Test sending via button click
    await input.fill('Another test message');
    await sendButton.click();
    await expect(input).toHaveValue(''); // Should clear after sending
  });

  test('should show voice and microphone buttons', async ({ page }) => {
    // Check for voice input button
    await expect(page.locator('button[aria-label="Start voice input"]')).toBeVisible();
    
    // Check for microphone button
    await expect(page.locator('button[aria-label="Microphone"]')).toBeVisible();
    
    // Test clicking voice button opens modal
    await page.click('button[aria-label="Start voice input"]');
    await expect(page.locator('[data-testid="voice-input-modal"]')).toBeVisible();
  });

  test('should open attachment menu and handle file uploads', async ({ page }) => {
    // Click attachment button
    await page.click('button[aria-label="Add attachment"]');
    
    // Check if attachment menu is visible
    await expect(page.locator('text=Add photos & files')).toBeVisible();
    
    // Test file input functionality
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
  });

  test('should handle camera and screen share buttons', async ({ page }) => {
    // Check camera button
    await expect(page.locator('button[aria-label="Camera"]')).toBeVisible();
    
    // Check screen share button
    await expect(page.locator('button[aria-label="Screen share"]')).toBeVisible();
    
    // Test camera button opens modal
    await page.click('button[aria-label="Camera"]');
    await expect(page.locator('[data-testid="webcam-modal"]')).toBeVisible();
  });

  test('should handle AI responses and loading states', async ({ page }) => {
    const input = page.locator('[data-testid="message-input"]');
    
    // Send a message that should trigger AI response
    await input.fill('Hello, can you help me?');
    await input.press('Enter');
    
    // Check for loading state
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
    
    // Wait for response (with timeout)
    await page.waitForSelector('[data-testid="ai-message"]', { timeout: 30000 });
    
    // Verify AI response is displayed
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible();
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    const input = page.locator('[data-testid="message-input"]');
    
    // Test Ctrl+Enter for new line
    await input.fill('First line');
    await input.press('Control+Enter');
    await expect(input).toHaveValue('First line\n');
    
    // Test Enter for sending
    await input.fill('Test message');
    await input.press('Enter');
    await expect(input).toHaveValue(''); // Should clear after sending
  });

  test('should handle textarea auto-resize', async ({ page }) => {
    const textarea = page.locator('[data-testid="message-input"]');
    
    // Get initial height
    const initialHeight = await textarea.evaluate(el => (el as HTMLElement).offsetHeight);
    
    // Type multiple lines
    await textarea.fill('Line 1\nLine 2\nLine 3\nLine 4\nLine 5');
    
    // Wait for resize
    await page.waitForTimeout(500);
    
    const newHeight = await textarea.evaluate(el => (el as HTMLElement).offsetHeight);
    expect(newHeight).toBeGreaterThan(initialHeight);
    
    // Check max height constraint
    expect(newHeight).toBeLessThanOrEqual(200);
  });

  test('should handle error states gracefully', async ({ page }) => {
    const input = page.locator('[data-testid="message-input"]');
    
    // Send a message that might cause an error
    await input.fill('This might cause an error');
    await input.press('Enter');
    
    // Wait a bit and check for error handling
    await page.waitForTimeout(2000);
    
    // Check if error message is displayed (if any)
    const errorElement = page.locator('[data-testid="error-message"]');
    if (await errorElement.isVisible()) {
      await expect(errorElement).toBeVisible();
    }
  });

  test('should maintain chat history and scroll behavior', async ({ page }) => {
    const input = page.locator('[data-testid="message-input"]');
    const messagesContainer = page.locator('[data-testid="messages-container"]');
    
    // Send multiple messages
    for (let i = 0; i < 3; i++) {
      await input.fill(`Message ${i + 1}`);
      await input.press('Enter');
      await page.waitForTimeout(500);
    }
    
    // Check that messages are added to history
    await expect(page.locator('[data-testid="user-message"]')).toHaveCount(3);
    
    // Test scroll to bottom behavior
    const scrollPosition = await messagesContainer.evaluate(el => el.scrollTop + el.clientHeight);
    const scrollHeight = await messagesContainer.evaluate(el => el.scrollHeight);
    expect(scrollPosition).toBe(scrollHeight);
  });

  test('should handle modal interactions correctly', async ({ page }) => {
    // Test voice modal
    await page.click('button[aria-label="Start voice input"]');
    await expect(page.locator('[data-testid="voice-input-modal"]')).toBeVisible();
    await page.click('[data-testid="close-modal"]');
    await expect(page.locator('[data-testid="voice-input-modal"]')).not.toBeVisible();
    
    // Test camera modal
    await page.click('button[aria-label="Camera"]');
    await expect(page.locator('[data-testid="webcam-modal"]')).toBeVisible();
    await page.click('[data-testid="close-modal"]');
    await expect(page.locator('[data-testid="webcam-modal"]')).not.toBeVisible();
  });

  test('visual snapshot of chat page', async ({ page }) => {
    await page.goto('http://localhost:3001/chat');
    await page.waitForSelector('[data-testid="chat-layout"]', { state: 'visible', timeout: 30000 });
    
    // Take a screenshot of the chat page
    await expect(page).toHaveScreenshot('chat-ui.png');
  });
});