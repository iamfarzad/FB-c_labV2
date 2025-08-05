import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VideoToApp } from '@/components/chat/tools/VideoToApp'

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn()

describe('VideoToApp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component with input fields', () => {
    render(<VideoToApp mode="card" />)
    
    expect(screen.getByPlaceholderText('Enter video URL (e.g., YouTube)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Describe the learning app you want to create')).toBeInTheDocument()
    expect(screen.getByText('Generate App')).toBeInTheDocument()
  })

  it('accepts initial video URL', () => {
    const testUrl = 'https://youtube.com/watch?v=test'
    render(<VideoToApp mode="card" videoUrl={testUrl} />)
    
    const urlInput = screen.getByPlaceholderText('Enter video URL (e.g., YouTube)') as HTMLInputElement
    expect(urlInput.value).toBe(testUrl)
  })

  it('shows loading state when generating', async () => {
    render(<VideoToApp mode="card" />)
    
    const urlInput = screen.getByPlaceholderText('Enter video URL (e.g., YouTube)')
    const promptInput = screen.getByPlaceholderText('Describe the learning app you want to create')
    const generateButton = screen.getByText('Generate App')
    
    fireEvent.change(urlInput, { target: { value: 'https://youtube.com/watch?v=test' } })
    fireEvent.change(promptInput, { target: { value: 'Create a quiz app' } })
    
    // Mock successful API responses
    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ spec: 'test spec' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: '<html>test</html>' })
      })
    
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Generating...')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    render(<VideoToApp mode="card" />)
    
    const urlInput = screen.getByPlaceholderText('Enter video URL (e.g., YouTube)')
    const promptInput = screen.getByPlaceholderText('Describe the learning app you want to create')
    const generateButton = screen.getByText('Generate App')
    
    fireEvent.change(urlInput, { target: { value: 'https://youtube.com/watch?v=test' } })
    fireEvent.change(promptInput, { target: { value: 'Create a quiz app' } })
    
    // Mock API error
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ details: 'API Error' })
    })
    
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/video-to-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generateSpec', videoUrl: 'https://youtube.com/watch?v=test' })
      })
    })
  })

  it('validates required fields', () => {
    render(<VideoToApp mode="card" />)
    
    const generateButton = screen.getByText('Generate App')
    expect(generateButton).toBeDisabled()
    
    // Fill only URL
    const urlInput = screen.getByPlaceholderText('Enter video URL (e.g., YouTube)')
    fireEvent.change(urlInput, { target: { value: 'https://youtube.com/watch?v=test' } })
    expect(generateButton).toBeDisabled()
    
    // Fill only prompt
    fireEvent.change(urlInput, { target: { value: '' } })
    const promptInput = screen.getByPlaceholderText('Describe the learning app you want to create')
    fireEvent.change(promptInput, { target: { value: 'Create a quiz app' } })
    expect(generateButton).toBeDisabled()
  })
}) 