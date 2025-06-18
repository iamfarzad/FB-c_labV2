const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen for console events
  page.on('console', msg => {
    console.log('Browser console:', msg.text());
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.error('Page error:', error.message);
  });
  
  console.log('Navigating to http://localhost:3001/about');
  await page.goto('http://localhost:3001/about');
  
  // Wait for a bit to capture any async errors
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await browser.close();
})();

process.on('unhandledRejection', error => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});
