import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChatMain } from '@/components/chat/ChatMain'
import type { Message } from '@/app/chat/types/chat'

// Mock the scrollIntoView method
const mockScrollIntoView = jest.fn()
Element.prototype.scrollIntoView = mockScrollIntoView

describe('ChatMain Scrolling', () => {
  const mockMessages: Message[] = [
    {
      id: '1',
      role: 'user',
      content: 'Hello',
      createdAt: new Date(),
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Hi there! How can I help you today?',
      createdAt: new Date(),
    },
  ]

  const defaultProps = {
    messages: mockMessages,
    isLoading: false,
    messagesEndRef: { current: null },
  }

  beforeEach(() => {
    mockScrollIntoView.mockClear()
  })

  it('should render messages correctly', () => {
    render(<ChatMain {...defaultProps} />)
    
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Hi there! How can I help you today?')).toBeInTheDocument()
  })

  it('should have proper scroll container classes', () => {
    render(<ChatMain {...defaultProps} />)
    
    const scrollArea = screen.getByTestId('chat-main').querySelector('[data-radix-scroll-area-viewport]')
    expect(scrollArea).toHaveClass('chat-scroll-container')
  })

  it('should have message container with proper classes', () => {
    render(<ChatMain {...defaultProps} />)
    
    const messageContainer = screen.getByTestId('messages-container')
    expect(messageContainer).toHaveClass('chat-message-container')
  })

  it('should auto-scroll when new messages are added', async () => {
    const { rerender } = render(<ChatMain {...defaultProps} />)
    
    // Add a new message
    const newMessages = [...mockMessages, {
      id: '3',
      role: 'user',
      content: 'New message',
      createdAt: new Date(),
    }]
    
    rerender(<ChatMain {...defaultProps} messages={newMessages} />)
    
    await waitFor(() => {
      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'end'
      })
    })
  })

  it('should handle loading state correctly', () => {
    render(<ChatMain {...defaultProps} isLoading={true} />)
    
    expect(screen.getByText('AI is thinking...')).toBeInTheDocument()
  })

  it('should show welcome message when no messages', () => {
    render(<ChatMain {...defaultProps} messages={[]} />)
    
    expect(screen.getByText('Welcome to F.B/c AI')).toBeInTheDocument()
    expect(screen.getByText(/Start a conversation/)).toBeInTheDocument()
  })
}) 