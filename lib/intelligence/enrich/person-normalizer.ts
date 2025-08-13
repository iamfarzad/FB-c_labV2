export interface RawPersonData { fullName?: string; role?: string; seniority?: string; profileUrl?: string }
export interface PersonContext { fullName: string; role?: string; seniority?: string; profileUrl?: string }

export function normalizePerson(raw: RawPersonData): PersonContext {
  return {
    fullName: raw.fullName?.trim() || 'Unknown',
    role: raw.role,
    seniority: raw.seniority,
    profileUrl: raw.profileUrl
  }
}


