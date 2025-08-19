#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

async function run() {
  const { chromium, devices } = await import('playwright')
  const url = process.argv[2] || 'http://localhost:3000/test-chat-page'
  const outDir = 'test-results'
  fs.mkdirSync(outDir, { recursive: true })

  const logs = { console: [], network: [] }

  const browser = await chromium.launch({ headless: true })

  // Desktop
  const ctxDesktop = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await ctxDesktop.newPage()
  page.on('console', msg => logs.console.push({ type: msg.type(), text: msg.text() }))
  page.on('requestfinished', async req => {
    const resp = await req.response()
    logs.network.push({ url: req.url(), status: resp?.status(), type: req.resourceType() })
  })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.screenshot({ path: path.join(outDir, 'test-chat-page.desktop.png'), fullPage: true })

  // Mobile
  const iPhone = devices['iPhone 14 Pro']
  const ctxMobile = await browser.newContext({ ...iPhone })
  const m = await ctxMobile.newPage()
  await m.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  await m.screenshot({ path: path.join(outDir, 'test-chat-page.mobile.png'), fullPage: true })

  // Component inventory
  const inventory = await page.evaluate(() => {
    const $ = (s) => Array.from(document.querySelectorAll(s))
    const hasClass = (el, substr) => (el.className||'').toString().includes(substr)
    const cards = $('*').filter(el => hasClass(el,'card') || hasClass(el,'rounded') && hasClass(el,'border'))
    const buttons = $('button')
    const inputs = $('input, textarea, select')
    return {
      cards: cards.length,
      buttons: buttons.length,
      inputs: inputs.length,
      headings: Array.from(document.querySelectorAll('h1,h2,h3')).map(h=>({tag:h.tagName.toLowerCase(), text:(h.textContent||'').trim()})),
    }
  })

  // Save outputs
  fs.writeFileSync(path.join(outDir, 'test-chat-page.console.json'), JSON.stringify(logs.console, null, 2))
  fs.writeFileSync(path.join(outDir, 'test-chat-page.network.json'), JSON.stringify(logs.network, null, 2))
  fs.writeFileSync(path.join(outDir, 'test-chat-page.inventory.json'), JSON.stringify(inventory, null, 2))

  await browser.close()
  console.log(JSON.stringify({ ok: true, inventory }, null, 2))
}

run().catch(err => { console.error(err); process.exit(1) })


