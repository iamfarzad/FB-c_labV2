import { LeadManager, ConversationStage } from '@/lib/lead-manager'

describe('LeadManager', () => {
  const leadManager = new LeadManager()

  it('should extract name from message', () => {
    const name = (leadManager as any).extractName('My name is John')
    expect(name).toBe('John')
  })

  it('should extract email from message', () => {
    const email = (leadManager as any).extractEmail('Contact me at john@example.com')
    expect(email).toBe('john@example.com')
  })

  it('should extract pain points from message', () => {
    const painPoints = (leadManager as any).extractPainPoints('I have a manual and time-consuming process')
    expect(painPoints).toContain('manual')
    expect(painPoints).toContain('time-consuming')
  })

  it('should handle greeting stage', async () => {
    const response = await (leadManager as any).handleGreetingStage({
      id: '1',
      name: '',
      email: '',
      emailDomain: '',
      conversationStage: ConversationStage.GREETING,
      leadScore: 0,
      totalInteractions: 0,
      engagementScore: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }, 'Hello')
    expect(response.nextStage).toBe(ConversationStage.NAME_COLLECTION)
  })
})
