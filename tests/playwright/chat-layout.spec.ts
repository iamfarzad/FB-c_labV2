import { test, expect } from '@playwright/test';

test.describe('Chat Layout Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the chat page
    await page.goto('http://localhost:3001/chat');
    // Wait for the chat to be fully loaded
    await page.waitForSelector('[data-testid="chat-layout"]', { state: 'visible', timeout: 30000 });
  });

  test('should load chat page successfully', async ({ page }) => {
    // Check if the main chat container is visible
    await expect(page.locator('[data-testid="chat-layout"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-main"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-footer"]')).toBeVisible();
  });

  test('should have a textarea that auto-expands with content', async ({ page }) => {
    const textarea = page.locator('[data-testid="message-input"]');
    await expect(textarea).toBeVisible();
    
    const initialHeight = await textarea.evaluate(el => (el as HTMLElement).offsetHeight);
    
    // Type multiple lines of text
    await textarea.fill('Line 1\nLine 2\nLine 3\nLine 4');
    
    // Wait for any resize animations
    await page.waitForTimeout(500);
    
    const newHeight = await textarea.evaluate(el => (el as HTMLElement).offsetHeight);
    expect(newHeight).toBeGreaterThan(initialHeight);
    
    // Check if height is within max bounds (200px max-height from CSS)
    expect(newHeight).toBeLessThanOrEqual(200);
  });

  test('should maintain layout when textarea expands', async ({ page }) => {
    const layout = page.locator('[data-testid="chat-layout"]');
    const initialLayoutBox = await layout.boundingBox();
    
    // Type some content to expand the textarea
    const textarea = page.locator('[data-testid="message-input"]');
    await textarea.fill('Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6');
    
    // Wait for any resize animations
    await page.waitForTimeout(500);
    
    const newLayoutBox = await layout.boundingBox();
    
    // The layout width should remain the same (or be close if initial was undefined)
    if (initialLayoutBox?.width) {
      expect(newLayoutBox?.width).toBeCloseTo(initialLayoutBox.width, 1);
    }
    // The layout height might change slightly due to textarea resizing
    expect(Math.abs((newLayoutBox?.height || 0) - (initialLayoutBox?.height || 0))).toBeLessThan(20);
  });

  test('should reset textarea height after sending a message', async ({ page }) => {
    const textarea = page.locator('[data-testid="message-input"]');
    
    // Type multiple lines
    await textarea.fill('Line 1\nLine 2\nLine 3');
    await page.waitForTimeout(500);
    const expandedHeight = await textarea.evaluate(el => (el as HTMLElement).offsetHeight);
    
    // Send the message
    await textarea.press('Enter');
    await page.waitForTimeout(500);
    
    // Textarea should be cleared and reset to initial height
    await expect(textarea).toHaveValue('');
    const resetHeight = await textarea.evaluate(el => (el as HTMLElement).offsetHeight);
    expect(resetHeight).toBeLessThan(expandedHeight);
  });

  test('should maintain scroll position when adding new messages', async ({ page }) => {
    // Add several messages
    const textarea = page.locator('[data-testid="message-input"]');
    const messagesContainer = page.locator('[data-testid="messages-container"]');
    
    // Send multiple messages
    for (let i = 0; i < 5; i++) {
      await textarea.fill(`Test message ${i + 1}`);
      await textarea.press('Enter');
      await page.waitForTimeout(300);
    }
    
    // Wait for messages to be rendered
    await page.waitForTimeout(500);
    
    // Scroll to bottom
    await messagesContainer.evaluate(el => el.scrollTo(0, el.scrollHeight));
    const initialScrollPosition = await messagesContainer.evaluate(el => el.scrollTop + el.clientHeight);
    const initialScrollHeight = await messagesContainer.evaluate(el => el.scrollHeight);
    
    // Add another message
    await textarea.fill('New message after scroll');
    await textarea.press('Enter');
    await page.waitForTimeout(500);
    
    // Get new scroll position
    const newScrollPosition = await messagesContainer.evaluate(el => el.scrollTop + el.clientHeight);
    const newScrollHeight = await messagesContainer.evaluate(el => el.scrollHeight);
    
    // The scroll position should be at the bottom
    expect(newScrollPosition).toBeGreaterThanOrEqual(initialScrollPosition);
    expect(newScrollPosition).toBe(newScrollHeight);
  });
});
