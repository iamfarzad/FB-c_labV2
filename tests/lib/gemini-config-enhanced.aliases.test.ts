import { createOptimizedConfig } from '@/lib/gemini-config-enhanced'

describe('gemini-config-enhanced feature aliases', () => {
  it('maps text_generation to chat config', () => {
    const chatCfg = createOptimizedConfig('chat')
    const aliasCfg = createOptimizedConfig('text_generation')
    expect(aliasCfg.maxOutputTokens).toBe(chatCfg.maxOutputTokens)
    expect(aliasCfg.temperature).toBe(chatCfg.temperature)
  })

  it('maps document_analysis to document config', () => {
    const docCfg = createOptimizedConfig('document')
    const aliasCfg = createOptimizedConfig('document_analysis')
    expect(aliasCfg.maxOutputTokens).toBe(docCfg.maxOutputTokens)
    expect(aliasCfg.temperature).toBe(docCfg.temperature)
  })
})


