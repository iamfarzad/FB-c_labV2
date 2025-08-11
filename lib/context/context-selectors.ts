import type { ContextSnapshot } from './context-schema'

export function getLeadEmail(ctx: ContextSnapshot | null | undefined): string | undefined {
  return ctx?.lead?.email
}

export function getCompanyDomain(ctx: ContextSnapshot | null | undefined): string | undefined {
  return ctx?.company?.domain
}

export function getRole(ctx: ContextSnapshot | null | undefined): { role?: string; confidence?: number } {
  return { role: ctx?.role, confidence: ctx?.roleConfidence }
}

export function getIndustry(ctx: ContextSnapshot | null | undefined): string | undefined {
  return ctx?.company?.industry
}

export function getCapabilities(ctx: ContextSnapshot | null | undefined): string[] {
  return ctx?.capabilities ?? []
}


