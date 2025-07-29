import { DemoBudgetManager, DEMO_LIMITS, FEATURE_BUDGETS } from '@/lib/demo-budget-manager'

describe('DemoBudgetManager', () => {
  const demoManager = new DemoBudgetManager()

  it('should create a new session with default values', async () => {
    const session = await demoManager.getOrCreateSession()
    expect(session.totalTokensUsed).toBe(0)
    expect(session.totalRequestsMade).toBe(0)
    expect(session.isComplete).toBe(false)
  })

  it('should enforce demo access limits', async () => {
    const session = await demoManager.getOrCreateSession()
    const result = await demoManager.checkDemoAccess(session.sessionId, 'chat', 100)
    expect(result.allowed).toBe(true)
  })

  it('should record demo usage and update session', async () => {
    const session = await demoManager.getOrCreateSession()
    await demoManager.recordDemoUsage(session.sessionId, 'chat', 100, 1)
    const updatedSession = await demoManager.getOrCreateSession(session.sessionId)
    expect(updatedSession.totalTokensUsed).toBeGreaterThanOrEqual(100)
  })
})
