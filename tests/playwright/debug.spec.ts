import { test, expect } from '@playwright/test';

test('Debug - Capture page structure', async ({ page }) => {
  // Navigate to the chat page
  await page.goto('http://localhost:4000/chat', { waitUntil: 'networkidle' });
  
  // Wait a moment for any dynamic content to load
  await page.waitForTimeout(2000);
  
  // Take a full page screenshot
  await page.screenshot({ path: 'test-results/debug-full-page.png', fullPage: true });
  
  // Get the page HTML structure
  const html = await page.content();
  console.log('Page HTML (first 2000 chars):', html.substring(0, 2000));
  
  // Get all elements with data-testid attributes
  const testIds = await page.evaluate(() => {
    const elements = document.querySelectorAll('[data-testid]');
    return Array.from(elements).map(el => ({
      testId: el.getAttribute('data-testid'),
      tagName: el.tagName,
      id: el.id,
      className: el.className,
      text: el.textContent?.substring(0, 100) || ''
    }));
  });
  
  console.log('Elements with data-testid:', JSON.stringify(testIds, null, 2));
  
  // Get all interactive elements
  const interactiveElements = await page.evaluate(() => {
    const selectors = ['button', 'input', 'textarea', 'select', 'a[href]'];
    const elements = document.querySelectorAll(selectors.join(','));
    return Array.from(elements).map(el => ({
      tagName: el.tagName,
      id: el.id,
      className: el.className,
      text: el.textContent?.substring(0, 100) || '',
      placeholder: (el as HTMLInputElement).placeholder || '',
      'aria-label': el.getAttribute('aria-label') || '',
      'data-testid': el.getAttribute('data-testid') || ''
    }));
  });
  
  console.log('Interactive elements:', JSON.stringify(interactiveElements, null, 2));
  
  // This test is just for debugging, so we'll always pass
  expect(true).toBe(true);
});
