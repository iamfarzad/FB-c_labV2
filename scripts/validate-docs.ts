/*
  Scans Markdown docs and validates referenced file paths actually exist.
  - Parses inline code/backticks (`path/to/file.tsx`)
  - Parses under headings like "Files Modified" and code fences listing paths
  - Reports missing paths and a summary table
*/
import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()

function walk(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const e of entries) {
    if (e.name.startsWith('.next') || e.name === 'node_modules' || e.name === '.git') continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...walk(p))
    else files.push(p)
  }
  return files
}

function looksLikeRepoPath(p: string): boolean {
  const roots = [
    'app/', 'components/', 'hooks/', 'lib/', 'server/', 'scripts/', 'public/', 'tests/', 'docs/', 'types/',
    'supabase/', 'styles/', 'pages/'
  ]
  const singles = new Set([
    'package.json','pnpm-lock.yaml','README.md','CHANGELOG.md','tsconfig.json','next.config.mjs','tailwind.config.ts',
    'postcss.config.mjs','jest.config.mjs','jest.config.simple.cjs','jest.setup.js','vercel.json'
  ])
  if (p.startsWith('http')) return false
  if (roots.some(r => p.startsWith(r))) return true
  if (singles.has(p)) return true
  return false
}

function extractPathsFromMarkdown(md: string): string[] {
  const paths = new Set<string>()
  // Inline backticked tokens
  const inlineRegex = /`([^`\n]+)`/g
  let m: RegExpExecArray | null
  while ((m = inlineRegex.exec(md))) {
    const p = m[1].trim()
    if (looksLikeRepoPath(p)) paths.add(p)
  }
  // Bullet lists likely under "Files Modified" or similar
  const listRegex = /^-\s+[`']?([^`'\n]+)[`']?/gim
  while ((m = listRegex.exec(md))) {
    const p = m[1].trim()
    if (looksLikeRepoPath(p)) paths.add(p)
  }
  return Array.from(paths)
}

function main() {
  const all = walk(ROOT).filter(f => f.endsWith('.md'))
  const results: Array<{ doc: string; refs: string[]; missing: string[] }> = []
  let totalRefs = 0
  let totalMissing = 0

  for (const file of all) {
    const md = fs.readFileSync(file, 'utf8')
    const refs = extractPathsFromMarkdown(md)
    if (refs.length === 0) continue
    const missing = refs.filter(r => !fs.existsSync(path.resolve(ROOT, r)))
    results.push({ doc: path.relative(ROOT, file), refs, missing })
    totalRefs += refs.length
    totalMissing += missing.length
  }

  // Print concise report
  // eslint-disable-next-line no-console
  console.log('📑 Documentation reference validation')
  // eslint-disable-next-line no-console
  console.log(`Docs scanned: ${all.length}`)
  // eslint-disable-next-line no-console
  console.log(`References found: ${totalRefs}`)
  // eslint-disable-next-line no-console
  console.log(`Missing references: ${totalMissing}`)

  for (const r of results) {
    if (r.missing.length === 0) continue
    // eslint-disable-next-line no-console
    console.log(`\n— ${r.doc}`)
    for (const m of r.missing) {
      // eslint-disable-next-line no-console
      console.log(`  ✗ ${m}`)
    }
  }

  process.exit(totalMissing === 0 ? 0 : 1)
}

main()


