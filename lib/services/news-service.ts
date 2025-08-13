import GoogleSearchService, { GoogleSearchResponse } from '@/lib/services/google-search-service'

export type NewsItem = {
  title: string
  url: string
  source: string
  publishedAt?: string
  category: 'providers' | 'prompting' | 'nocode' | 'research' | 'product'
  keyFindings: string[]
}

type FetchOpts = { locale?: string; industry?: string; role?: string }

let cachedAt = 0
let cache: NewsItem[] | null = null
const TTL_MS = 1000 * 60 * 60 * 6 // 6h

const PROVIDER_SITES = [
  { site: 'openai.com', category: 'providers' as const },
  { site: 'anthropic.com', category: 'providers' as const },
  { site: 'ai.google', category: 'providers' as const },
  { site: 'deepmind.google', category: 'providers' as const },
  { site: 'meta.com', category: 'providers' as const },
  { site: 'microsoft.com', category: 'providers' as const },
  { site: 'nvidia.com', category: 'providers' as const },
  { site: 'apple.com', category: 'providers' as const },
]

const PROMPT_SITES = [
  { site: 'deeplearning.ai', category: 'prompting' as const },
  { site: 'promptingguide.ai', category: 'prompting' as const },
]

const NOCODE_SITES = [
  { site: 'zapier.com', category: 'nocode' as const },
  { site: 'make.com', category: 'nocode' as const },
  { site: 'notion.so', category: 'nocode' as const },
]

const RESEARCH_SITES = [
  { site: 'arxiv.org', category: 'research' as const },
]

const PRODUCT_SITES = [
  { site: 'techcrunch.com', category: 'product' as const },
  { site: 'reuters.com', category: 'product' as const },
]

function extractFindings(snippet: string): string[] {
  if (!snippet) return []
  const parts = snippet.replace(/\s+/g, ' ').split(/\.(\s|$)/).map(s => s.trim()).filter(Boolean)
  return parts.slice(0, 2)
}

function mapResponse(resp: GoogleSearchResponse, category: NewsItem['category']): NewsItem[] {
  const items = resp.items || []
  return items.map(it => ({
    title: it.title,
    url: it.link,
    source: it.displayLink || (new URL(it.link).hostname.replace('www.', '')),
    publishedAt: undefined,
    category,
    keyFindings: extractFindings(it.snippet)
  }))
}

function dedupe(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>()
  const out: NewsItem[] = []
  for (const it of items) {
    const key = it.url.split('?')[0]
    if (seen.has(key)) continue
    seen.add(key)
    out.push(it)
  }
  return out
}

export async function fetchLatestNews(opts: FetchOpts = {}): Promise<NewsItem[]> {
  const now = Date.now()
  if (cache && now - cachedAt < TTL_MS) return cache
  const configured = GoogleSearchService.isConfigured()
  if (!configured) {
    cache = []
    cachedAt = now
    return cache
  }
  const results: NewsItem[] = []
  const dateRestrict = 'w1'
  const searchTerm = 'AI'
  // Limit calls to stay cheap
  const slices = [PROVIDER_SITES.slice(0, 6), PROMPT_SITES.slice(0, 2), NOCODE_SITES.slice(0, 2), RESEARCH_SITES.slice(0, 1), PRODUCT_SITES.slice(0, 2)]
  for (const group of slices) {
    for (const { site, category } of group) {
      try {
        const resp = await GoogleSearchService.search(searchTerm, { num: 5, safe: 'active', dateRestrict, siteSearch: site })
        results.push(...mapResponse(resp, category))
      } catch {}
    }
  }
  let items = dedupe(results)
  // Simple re-rank: providers first, then research, then others
  const rank = (c: NewsItem['category']) => c === 'providers' ? 3 : c === 'research' ? 2 : 1
  items = items.sort((a, b) => rank(b.category) - rank(a.category))
  cache = items.slice(0, 10)
  cachedAt = now
  return cache
}


