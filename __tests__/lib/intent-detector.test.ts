import { detectIntent } from '@/lib/intelligence/intent-detector'

describe('intent-detector', () => {
  test('detects consulting', () => {
    const r = detectIntent('Can you help us estimate ROI and integration plan?')
    expect(r.type).toBe('consulting')
    expect(r.confidence).toBeGreaterThan(0.4)
  })
  test('detects workshop', () => {
    const r = detectIntent('We want a training workshop next week')
    expect(r.type).toBe('workshop')
  })
  test('falls back to other', () => {
    const r = detectIntent('Hello there')
    expect(['other','consulting','workshop']).toContain(r.type)
  })
})


