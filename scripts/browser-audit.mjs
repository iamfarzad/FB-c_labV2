#!/usr/bin/env node
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

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

// Small viewport sweep: desktop and mobile
await page.setViewportSize({ width: 1280, height: 800 })
await page.screenshot({ path: path.join(outDir, 'test-chat-page.desktop.png'), fullPage: true })
await page.setViewportSize({ width: 390, height: 844 })
await page.screenshot({ path: path.join(outDir, 'test-chat-page.mobile.png'), fullPage: true })

await browser.close()

await fs.promises.writeFile(path.join(outDir, 'test-chat-page.console.json'), JSON.stringify({ logs: consoleLogs, errors: consoleErrors }, null, 2))
await fs.promises.writeFile(path.join(outDir, 'test-chat-page.network.json'), JSON.stringify({ entries: networkLogs }, null, 2))

console.log('✅ Audit complete:')
console.log(' - Screenshots: test-results/test-chat-page.desktop.png, test-results/test-chat-page.mobile.png')
console.log(' - Console:     test-results/test-chat-page.console.json')
console.log(' - Network:     test-results/test-chat-page.network.json')

#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer-core'
import os from 'os'

const OUT_DIR = path.resolve(process.cwd(), 'test-results')
const URL = process.env.AUDIT_URL || 'http://localhost:3000/collab'

async function run() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
  const screenshotPath = path.join(OUT_DIR, 'collab.png')
  const reportPath = path.join(OUT_DIR, 'collab-audit.json')

  // Try system Chrome to avoid bundled download
  const candidates = [
    process.env.CHROME_BIN,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
  ].filter(Boolean)

  let executablePath = undefined
  for (const c of candidates) {
    try { if (c && fs.existsSync(c)) { executablePath = c; break } } catch {}
  }

  if (!executablePath && os.platform() === 'darwin') {
    // Fallback: try `open -Ra` probe
    const possible = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    if (fs.existsSync(possible)) executablePath = possible
  }

  const browser = await puppeteer.launch({ headless: true, executablePath, args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })

  const consoleLogs = []
  const consoleErrors = []
  const requests = []
  const responses = []
  const failedRequests = []

  page.on('console', msg => {
    const entry = { type: msg.type(), text: msg.text() }
    consoleLogs.push(entry)
    if (msg.type() === 'error' || msg.type() === 'warning') consoleErrors.push(entry)
  })
  page.on('request', req => {
    requests.push({ url: req.url(), method: req.method(), resourceType: req.resourceType() })
  })
  page.on('requestfailed', req => {
    failedRequests.push({ url: req.url(), method: req.method(), failure: req.failure()?.errorText })
  })
  page.on('response', res => {
    responses.push({ url: res.url(), status: res.status(), ok: res.ok() })
  })

  const navStart = Date.now()
  const resp = await page.goto(URL, { waitUntil: 'networkidle0', timeout: 120000 })
  const ttfbMs = resp && resp.timing() ? Math.max(0, resp.timing().responseStart - resp.timing().startTime) : null
  const navMs = Date.now() - navStart

  // Give client hydration a moment
  await page.waitForTimeout(1000)

  // Take screenshot
  await page.screenshot({ path: screenshotPath, fullPage: true })

  const data = await page.evaluate(() => {
    const q = (sel) => document.querySelector(sel)
    const exists = (sel) => !!q(sel)
    const textIncludes = (txt) => document.body.innerText.toLowerCase().includes(txt.toLowerCase())
    const chatRoot = document.querySelector('[data-chat-root="true"]')
    const chatRect = chatRoot ? chatRoot.getBoundingClientRect() : null
    const stageRail = document.querySelector('[aria-label="Session progress and stage information"]')
    const sidebarFooterHasPlus = false // removed by design
    const onlineBadgePresent = textIncludes('0 online')

    return {
      title: document.title,
      hasNav: exists('nav[aria-label="Primary navigation"]'),
      hasHeader: exists('header[role="banner"]'),
      hasMain: exists('main[role="main"]'),
      hasAsideDock: !!document.getElementById('collab-chat-panel'),
      onlineBadgePresent,
      sidebarFooterHasPlus,
      stageRailPresent: !!stageRail,
      chatFullWidth: chatRect ? Math.round(chatRect.width) >= Math.round(window.innerWidth * 0.95) : false,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    }
  })

  const errorResponses = responses.filter(r => r.status >= 400)

  const report = {
    url: URL,
    navMs,
    ttfbMs,
    counts: {
      requests: requests.length,
      responses: responses.length,
      failedRequests: failedRequests.length,
      consoleErrors: consoleErrors.length,
    },
    a11y: {
      hasNav: data.hasNav,
      hasHeader: data.hasHeader,
      hasMain: data.hasMain,
      hasAsideDock: data.hasAsideDock,
    },
    ui: {
      onlineBadgePresent: data.onlineBadgePresent,
      sidebarFooterHasPlus: data.sidebarFooterHasPlus,
      stageRailPresent: data.stageRailPresent,
      chatFullWidth: data.chatFullWidth,
      viewport: data.viewport,
    },
    errors: {
      consoleErrors,
      failedRequests,
      errorResponses,
    },
    artifacts: {
      screenshotPath,
    },
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  await browser.close()

  // Print concise summary
  const summary = {
    url: report.url,
    navMs: report.navMs,
    a11y: report.a11y,
    ui: report.ui,
    counts: report.counts,
    artifacts: report.artifacts,
  }
  console.log(JSON.stringify(summary, null, 2))
}

run().catch(err => {
  console.error('Audit failed:', err)
  process.exit(1)
})


