export interface RawCompanyInput {
  text?: string
  url?: string
  title?: string
}

export interface NormalizedCompany {
  name: string
  domain: string
  industry?: string
  size?: string
  summary?: string
  website?: string
  linkedin?: string
}

export function normalizeCompany(input: RawCompanyInput, fallbackDomain: string): NormalizedCompany {
  const text = (input.text || '').trim()
  const domain = fallbackDomain
  const name = input.title?.trim() || domain.split('.')[0]

  // Extremely lightweight heuristics
  const lines = text.split(/\n+/).map(s => s.trim()).filter(Boolean)
  const summary = lines.slice(0, 3).join(' ')

  return {
    name,
    domain,
    industry: undefined,
    size: undefined,
    summary: summary || undefined,
    website: input.url || `https://${domain}`,
  }
}


