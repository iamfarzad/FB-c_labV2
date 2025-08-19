const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

;(async () => {
  const url = process.argv[2] || 'http://localhost:3000/test-chat-page'
  const out = path.resolve(process.cwd(), 'test-results/ui-inventory.json')
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })

  const data = await page.evaluate(() => {
    function rect(el){ const r=el.getBoundingClientRect(); return { x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height) } }
    function styles(el){ const s=getComputedStyle(el); return { color:s.color, bg:s.backgroundColor, padding:s.padding, fontSize:s.fontSize, lineHeight:s.lineHeight } }
    function contrastOK(fg, bg){ try{ const p=n=>{n=n.trim(); if(n.startsWith('rgb')){const a=n.match(/\d+/g).map(Number);return a.length>=3? a.slice(0,3):[0,0,0]} return [0,0,0]}; const [r1,g1,b1]=p(fg), [r2,g2,b2]=p(bg); const l=c=>{c/=255; return c<=0.03928? c/12.92: Math.pow((c+0.055)/1.055,2.4)}; const L1=0.2126*l(r1)+0.7152*l(g1)+0.0722*l(b1), L2=0.2126*l(r2)+0.7152*l(g2)+0.0722*l(b2); const ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05); return ratio>=4.5 }catch(e){ return null } }

    const comps=[]
    const q = (sel, role) => {
      document.querySelectorAll(sel).forEach(el => {
        const st=styles(el); const r=rect(el);
        comps.push({ role, text: (el.innerText||'').trim().slice(0,60), rect:r, styles:st, contrastOK:contrastOK(st.color, st.bg) })
      })
    }

    q('header button, header a', 'header-action')
    q('aside button', 'left-rail-button')
    q('main button', 'main-button')
    q('main input, main textarea', 'main-input')
    q('main .rounded-xl.border', 'card')
    q('aside.border-l button', 'stage-button')

    return comps
  })

  await browser.close()
  await fs.promises.writeFile(out, JSON.stringify(data, null, 2))
  console.log('wrote', out)
})().catch(err => { console.error(err); process.exit(1) })
