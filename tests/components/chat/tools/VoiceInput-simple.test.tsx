import '@testing-library/jest-dom'

// Simple test to check if component imports work
describe('VoiceInput Component Import Test', () => {
  it('should be able to import the component', async () => {
    // Dynamic import to catch module resolution errors
    const { VoiceInput } = await import('@/components/chat/tools/VoiceInput/VoiceInput')
    expect(VoiceInput).toBeDefined()
  })

  it('should be able to import hooks', async () => {
    const { useToast } = await import('@/hooks/use-toast')
    expect(useToast).toBeDefined()
  })
})