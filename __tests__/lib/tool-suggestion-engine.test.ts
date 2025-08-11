import { suggestTools } from '@/lib/intelligence/tool-suggestion-engine'

const baseCtx = {
  lead: { email: 'a@b.com', name: 'a' },
  capabilities: [] as string[],
}

describe('tool-suggestion-engine', () => {
  test('consulting suggests roi/doc/audit', () => {
    const s = suggestTools({ ...baseCtx, capabilities: [] } as any, { type: 'consulting', confidence: 0.8, slots: {} })
    expect(s.length).toBeGreaterThan(0)
  })
  test('excludes used capabilities', () => {
    const s = suggestTools({ ...baseCtx, capabilities: ['roi', 'doc', 'screenShare'] } as any, { type: 'consulting', confidence: 0.8, slots: {} })
    expect(s.find(x => x.capability === 'roi')).toBeUndefined()
  })
})


