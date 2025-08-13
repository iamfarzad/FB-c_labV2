import { NextRequest, NextResponse } from 'next/server'
import { LeadResearchService } from '@/lib/intelligence/lead-research'
import { ContextStorage } from '@/lib/context/context-storage'
import { embedTexts } from '@/lib/embeddings/gemini'
import { upsertEmbeddings } from '@/lib/embeddings/query'

const leadResearchService = new LeadResearchService()
const contextStorage = new ContextStorage()

export async function POST(request: NextRequest) {
  try {
    const { sessionId, email, name, companyUrl, provider = 'google' } = await request.json()

    if (!sessionId || !email) {
      return NextResponse.json(
        { error: 'Session ID and email are required' },
        { status: 400 }
      )
    }

    console.info('🔍 Lead research started:', {
      sessionId,
      email,
      name,
      companyUrl,
      provider
    })

    // Perform lead research
    const researchResult = await leadResearchService.researchLead(email, name, companyUrl)

    // Store in context
    await contextStorage.update(sessionId, {
      company_context: researchResult.company,
      person_context: researchResult.person,
      role: researchResult.role,
      role_confidence: researchResult.confidence
    })

    // Optional: store embeddings for memory when enabled
    if (process.env.EMBEDDINGS_ENABLED === 'true') {
      const texts: string[] = []
      if (researchResult.company?.summary) texts.push(String(researchResult.company.summary))
      if (researchResult.person?.summary) texts.push(String(researchResult.person.summary))
      const vectors = texts.length ? await embedTexts(texts, 1536) : []
      if (vectors.length) await upsertEmbeddings(sessionId, 'lead_research', texts, vectors)
    }

    console.info('✅ Lead research completed:', {
      company: researchResult.company,
      person: researchResult.person,
      role: researchResult.role,
      scores: { confidence: researchResult.confidence },
      citations: researchResult.citations?.length || 0
    })

    return NextResponse.json({
      company: researchResult.company,
      person: researchResult.person,
      role: researchResult.role,
      scores: { confidence: researchResult.confidence },
      citations: researchResult.citations || []
    })

  } catch (error) {
    console.error('❌ Lead research failed:', error)
    return NextResponse.json(
      { error: 'Lead research failed' },
      { status: 500 }
    )
  }
}
