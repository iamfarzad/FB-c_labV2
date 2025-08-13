export function requireConsentCookie(cookieValue?: string): boolean {
  if (!cookieValue) return false
  try { const parsed = JSON.parse(cookieValue); return !!parsed.allow } catch { return false }
}

export function canProceedToStage(currentStage: string, nextStage: string, lead: Record<string, any>): boolean {
  const requirements: Record<string, string[]> = {
    NAME_COLLECTION: [],
    EMAIL_CAPTURE: ['name'],
    BACKGROUND_RESEARCH: ['name', 'email'],
    PROBLEM_DISCOVERY: ['name', 'email'],
    SOLUTION_PRESENTATION: ['name', 'email'],
    CALL_TO_ACTION: ['name', 'email'],
  }
  const req = requirements[nextStage] || []
  return req.every(k => !!lead[k])
}

export function hasConsent(allow: boolean): boolean { return !!allow }
export function contextReady(ctx: any): boolean { return !!(ctx?.company || ctx?.person || ctx?.role) }


