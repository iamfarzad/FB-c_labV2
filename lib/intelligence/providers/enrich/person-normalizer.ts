export interface RawPersonInput {
  text?: string
  name?: string
  company?: string
  profileUrl?: string
}

export interface NormalizedPerson {
  fullName: string
  role?: string
  seniority?: string
  profileUrl?: string
  company?: string
}

export function normalizePerson(input: RawPersonInput): NormalizedPerson {
  const fullName = input.name?.trim() || 'Unknown'
  const role = extractRole(input.text)
  return {
    fullName,
    role: role || undefined,
    seniority: undefined,
    profileUrl: input.profileUrl || undefined,
    company: input.company || undefined,
  }
}

function extractRole(text?: string | null): string | null {
  if (!text) return null
  const m = text.match(/(cto|ceo|founder|vp engineering|head of [^,\n]+)/i)
  return m ? m[1] : null
}


