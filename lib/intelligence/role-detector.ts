export interface ResearchResultLike {
  company?: { summary?: string; industry?: string }
  person?: { fullName?: string; role?: string; seniority?: string }
  role?: string
}

const ROLE_REGEX = /(cto|chief technology officer|ceo|founder|co[-\s]?founder|vp engineering|head of (?:engineering|ai|ml)|product manager|marketing|sales|operations|data scientist|ml engineer|software engineer|developer|architect)/i

export async function detectRole(research: ResearchResultLike): Promise<{ role: string; confidence: number }> {
  // Guard
  if (!research) return { role: 'Unknown', confidence: 0 }

  // 1) If person.role is present, trust it with high confidence
  const direct = research.person?.role?.trim()
  if (direct) {
    return { role: normalizeRole(direct), confidence: 0.9 }
  }

  // 2) Try regex across known text surfaces
  const surfaces = [
    research.role,
    research.person?.seniority,
    research.company?.summary,
  ]
    .filter(Boolean)
    .join(' \n ')

  const match = surfaces.match(ROLE_REGEX)
  if (match) {
    return { role: normalizeRole(match[1]), confidence: 0.6 }
  }

  // 3) Fallback
  return { role: 'Business Professional', confidence: 0.2 }
}

function normalizeRole(input: string): string {
  const r = input.toLowerCase()
  if (/(cto|chief technology officer)/.test(r)) return 'CTO'
  if (/(ceo)/.test(r)) return 'CEO'
  if (/(founder)/.test(r)) return 'Founder'
  if (/(vp engineering)/.test(r)) return 'VP Engineering'
  if (/(head of engineering)/.test(r)) return 'Head of Engineering'
  if (/(head of ai|head of ml)/.test(r)) return 'Head of AI/ML'
  if (/(product manager)/.test(r)) return 'Product Manager'
  if (/(marketing)/.test(r)) return 'Marketing'
  if (/(sales)/.test(r)) return 'Sales'
  if (/(operations)/.test(r)) return 'Operations'
  if (/(data scientist)/.test(r)) return 'Data Scientist'
  if (/(ml engineer)/.test(r)) return 'ML Engineer'
  if (/(software engineer|developer)/.test(r)) return 'Software Engineer'
  if (/(architect)/.test(r)) return 'Architect'
  return input
}


