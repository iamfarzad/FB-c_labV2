#!/usr/bin/env node
const fs = require('fs')
async function run() {
  const { chromium } = await import('playwright')
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const url = process.argv[2] || 'http://localhost:3000/test-chat-page'
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  // wait a moment for hydration
  await page.waitForTimeout(500)
  const data = await page.evaluate(() => {
    const q = (sel) => Array.from(document.querySelectorAll(sel))
    const mapTap = (el) => {
      const r = el.getBoundingClientRect()
      const name = el.getAttribute('aria-label') || (el.textContent || '').trim() || el.getAttribute('title') || ''
      return { w: Math.round(r.width), h: Math.round(r.height), name: name.slice(0,80) }
    }
    const headings = ['h1','h2','h3','h4','h5','h6'].flatMap(tag => q(tag).map(h => ({ tag, text: (h.textContent||'').trim().slice(0,120) })))
    const buttons = q('button').map(mapTap)
    const links = q('a').map(a => ({ text: (a.textContent||'').trim().slice(0,80), href: a.getAttribute('href')||'', aria: a.getAttribute('aria-label')||'' }))
    const landmarks = {
      header: q('header').length,
      main: q('main').length,
      nav: q('nav, [role="navigation"]').length,
      aside: q('aside').length,
      footer: q('footer').length,
    }
    const badTapTargets = buttons.filter(b => b.w < 44 || b.h < 44)
    const emptyLinks = links.filter(l => !l.text && !l.aria)
    const title = document.title
    const viewport = { w: window.innerWidth, h: window.innerHeight }
    return { title, viewport, landmarks, headings, counts: { buttons: buttons.length, links: links.length }, badTapTargets, emptyLinks }
  })
  await browser.close()
  fs.mkdirSync('test-results', { recursive: true })
  fs.writeFileSync('test-results/test-chat-page.layout.json', JSON.stringify(data, null, 2))
  console.log(JSON.stringify(data, null, 2))
}
run().catch(err => { console.error(err); process.exit(1) })


