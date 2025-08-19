const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

;(async () => {
  const url = process.argv[2] || 'http://localhost:3000/test-chat-page'
  const outDir = path.resolve(process.cwd(), 'test-results')
  await fs.promises.mkdir(outDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext()
  const page = await ctx.newPage()

  const consoleLogs = []
  const consoleErrors = []
  const networkLogs = []

  page.on('console', (msg) => {
    const entry = { type: msg.type(), text: msg.text() }
    consoleLogs.push(entry)
    if (msg.type() === 'error') consoleErrors.push(entry)
  })

  page.on('request', (req) => {
    networkLogs.push({ phase: 'request', url: req.url(), method: req.method(), resourceType: req.resourceType() })
  })
  page.on('response', async (res) => {
    networkLogs.push({ phase: 'response', url: res.url(), status: res.status(), ok: res.ok(), request: { method: res.request().method(), resourceType: res.request().resourceType() } })
  })

  await page.goto(url, { waitUntil: 'networkidle' })

  await page.setViewportSize({ width: 1280, height: 800 })
  await page.screenshot({ path: path.join(outDir, 'test-chat-page.desktop.png'), fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: path.join(outDir, 'test-chat-page.mobile.png'), fullPage: true })

  await browser.close()

  await fs.promises.writeFile(path.join(outDir, 'test-chat-page.console.json'), JSON.stringify({ logs: consoleLogs, errors: consoleErrors }, null, 2))
  await fs.promises.writeFile(path.join(outDir, 'test-chat-page.network.json'), JSON.stringify({ entries: networkLogs }, null, 2))

  console.log('done')
})().catch(err => { console.error(err); process.exit(1) })
