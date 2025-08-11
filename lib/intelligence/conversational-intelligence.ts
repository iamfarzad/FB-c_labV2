import { GoogleGroundingProvider } from './providers/search/google-grounding'
import { LeadResearchService } from './lead-research'
import { detectRole } from './role-detector'
import type { ContextSnapshot } from '@/lib/context/context-schema'
import { getContextSnapshot, updateContext } from '@/lib/context/context-manager'
import type { IntentResult, Suggestion } from '@/types/intelligence'
import { suggestTools } from './tool-suggestion-engine'

export class ConversationalIntelligence {
  private grounding = new GoogleGroundingProvider()
  private research = new LeadResearchService()

  async initSession(input: { sessionId: string; email: string; name?: string; companyUrl?: string }): Promise<ContextSnapshot | null> {
    const { sessionId, email, name, companyUrl } = input
    const researchResult = await this.research.researchLead(email, name, companyUrl, sessionId)
    const role = await detectRole({
      company: { summary: researchResult.company?.summary, industry: researchResult.company?.industry },
      person: { role: researchResult.person?.role, seniority: researchResult.person?.seniority },
      role: researchResult.role,
    })
    await updateContext(sessionId, {
      company: researchResult.company,
      person: researchResult.person,
      role: role.role,
      roleConfidence: role.confidence,
    })
    return await getContextSnapshot(sessionId)
  }

  async researchLead(input: { sessionId: string; email: string; name?: string; companyUrl?: string }) {
    return this.research.researchLead(input.email, input.name, input.companyUrl, input.sessionId)
  }

  async detectRoleFromResearch(research: any) {
    return detectRole(research)
  }

  async detectIntent(text: string, context: ContextSnapshot): Promise<IntentResult> {
    // Thin wrapper; your existing intent-detector already handles this
    // Import here if needed; keeping minimal per scope
    const { detectIntent } = await import('./intent-detector')
    return detectIntent(text, context)
  }

  async suggestTools(context: ContextSnapshot, intent: IntentResult, stage: string): Promise<Suggestion[]> {
    return suggestTools({ context, intent, stage })
  }
}


