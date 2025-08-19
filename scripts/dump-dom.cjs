#!/usr/bin/env node
const fs = require('fs')
async function main() {
  const { chromium } = await import('playwright')
  const url = process.argv[2] || 'http://localhost:3000/test-chat-page'
  const out = process.argv[3] || 'test-results/test-chat-page.dom.html'
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  // Give hydration a moment just in case
  await page.waitForTimeout(500)
  const html = await page.content()
  fs.mkdirSync(require('path').dirname(out), { recursive: true })
  fs.writeFileSync(out, html)
  console.log(out)
  await browser.close()
}
main().catch(err => { console.error(err); process.exit(1) })


