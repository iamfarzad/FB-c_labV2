// @ts-check

/**
 * MCP Playwright test for the chat page using Windsurf browser
 * This test will be executed directly in the Windsurf environment
 */

declare const mcp4_playwright_navigate: any;
declare const mcp4_playwright_click: any;
declare const mcp4_playwright_fill: any;
declare const mcp4_playwright_evaluate: any;
declare const mcp4_playwright_screenshot: any;

// Test data
const TEST_MESSAGE = 'Hello from Windsurf browser test';

async function testChatPage() {
  try {
    // 1. Navigate to the chat page
    console.log('Navigating to chat page...');
    await mcp4_playwright_navigate({
      url: 'http://localhost:3000/chat',
      waitUntil: 'networkidle'
    });
    
    // 2. Verify page loaded
    console.log('Checking if chat container is visible...');
    const isChatVisible = await mcp4_playwright_evaluate({
      script: `!!document.querySelector('[data-testid="chat-container"]')`
    });
    
    if (!isChatVisible) {
      throw new Error('Chat container not found on the page');
    }
    
    // 3. Take a screenshot of the initial state
    console.log('Taking initial screenshot...');
    await mcp4_playwright_screenshot({
      name: 'chat-initial-state',
      fullPage: true
    });
    
    // 4. Type a test message
    console.log('Typing test message...');
    await mcp4_playwright_fill({
      selector: '[data-testid="message-input"]',
      value: TEST_MESSAGE
    });
    
    // 5. Click the send button
    console.log('Sending message...');
    await mcp4_playwright_click({
      selector: '[data-testid="send-button"]'
    });
    
    // 6. Wait for the message to appear in the chat
    console.log('Waiting for message to appear...');
    const messageAppeared = await mcp4_playwright_evaluate({
      script: `
        const observer = new MutationObserver(() => {
          const message = document.querySelector('[data-testid="message"]:last-child');
          if (message && message.textContent.includes('${TEST_MESSAGE}')) {
            window.__MESSAGE_FOUND__ = true;
          }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Wait for message or timeout
        return new Promise((resolve) => {
          const check = () => {
            if (window.__MESSAGE_FOUND__) {
              resolve(true);
              observer.disconnect();
            } else {
              setTimeout(check, 100);
            }
          };
          
          setTimeout(() => {
            resolve(false);
            observer.disconnect();
          }, 5000);
          
          check();
        });
      `,
      timeout: 10000
    });
    
    if (!messageAppeared) {
      throw new Error('Message did not appear in the chat');
    }
    
    // 7. Take a screenshot after sending the message
    console.log('Taking screenshot after sending message...');
    await mcp4_playwright_screenshot({
      name: 'chat-message-sent',
      fullPage: true
    });
    
    // 8. Verify the message is displayed correctly
    const messageText = await mcp4_playwright_evaluate({
      script: `
        const message = document.querySelector('[data-testid="message"]:last-child');
        return message ? message.textContent : '';
      `
    });
    
    if (!messageText.includes(TEST_MESSAGE)) {
      throw new Error(`Message content mismatch. Expected: ${TEST_MESSAGE}, Got: ${messageText}`);
    }
    
    console.log('✅ Chat test completed successfully!');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Chat test failed:', error);
    
    // Take a screenshot on error
    try {
      await mcp4_playwright_screenshot({
        name: 'chat-test-error',
        fullPage: true
      });
    } catch (screenshotError) {
      console.error('Failed to take error screenshot:', screenshotError);
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

// Execute the test
// @ts-ignore
return testChatPage();
