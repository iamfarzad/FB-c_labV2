export interface RawCompanyData { name?: string; domain?: string; industry?: string; size?: string; about?: string }
export interface CompanyContext { name: string; domain?: string; industry?: string; size?: string; summary?: string }

export function normalizeCompany(raw: RawCompanyData): CompanyContext {
  return {
    name: raw.name?.trim() || 'Unknown',
    domain: raw.domain?.toLowerCase(),
    industry: raw.industry,
    size: raw.size,
    summary: raw.about?.slice(0, 800)
  }
}


