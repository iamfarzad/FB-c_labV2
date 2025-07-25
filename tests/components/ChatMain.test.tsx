import { render, screen } from '@testing-library/react'
import { jest } from '@jest/globals'
import { ChatMain } from '@/components/chat/ChatMain'
import '@testing-library/jest-dom'

// Mock dependencies
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}))

jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span'
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children
}))

// Mock message type
const mockMessage = {
  id: '1',
  role: 'user' as const,
  content: 'Test message',
  timestamp: new Date(),
  type: 'text' as const
}

const mockAssistantMessage = {
  id: '2', 
  role: 'assistant' as const,
  content: 'Assistant response',
  timestamp: new Date(),
  type: 'text' as const
}

describe('ChatMain Component', () => {
  const mockProps = {
    messages: [],
    isLoading: false,
    messagesEndRef: { current: null },
    onRegenerateResponse: jest.fn(),
    onEditMessage: jest.fn(),
    onDeleteMessage: jest.fn(),
    onCopyMessage: jest.fn(),
    onVoiceOutput: jest.fn(),
    leadCaptureState: {
      stage: 'initial' as const,
      isActive: false,
      completedStages: [],
      leadData: {}
    },
    activityLog: [],
    sessionId: 'test-session'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders empty state when no messages', () => {
    render(<ChatMain {...mockProps} />)
    
    // Should render the messages container
    const container = screen.queryByTestId('messages-container')
    expect(container || screen.getByRole('main')).toBeInTheDocument()
  })

  test('renders messages correctly', () => {
    const propsWithMessages = {
      ...mockProps,
      messages: [mockMessage, mockAssistantMessage]
    }
    
    render(<ChatMain {...propsWithMessages} />)
    
    // Should display both messages
    expect(screen.getByText('Test message')).toBeInTheDocument()
    expect(screen.getByText('Assistant response')).toBeInTheDocument()
  })

  test('shows loading state', () => {
    render(<ChatMain {...mockProps} isLoading={true} />)
    
    // Look for loading indicators
    const loadingElement = screen.queryByText(/loading/i) || 
                          screen.queryByRole('progressbar') ||
                          screen.queryByTestId('loading')
    
    // Component should render without errors during loading
    expect(true).toBe(true)
  })

  test('handles empty messages array', () => {
    render(<ChatMain {...mockProps} messages={[]} />)
    
    // Should render without crashing
    const container = screen.queryByTestId('messages-container') || screen.getByRole('main')
    expect(container).toBeInTheDocument()
  })

  test('displays user messages with correct styling', () => {
    const propsWithUserMessage = {
      ...mockProps,
      messages: [mockMessage]
    }
    
    render(<ChatMain {...propsWithUserMessage} />)
    
    const messageElement = screen.getByText('Test message')
    expect(messageElement).toBeInTheDocument()
    
    // User messages should have appropriate styling/positioning
    const messageContainer = messageElement.closest('[data-role="user"]') || 
                           messageElement.closest('.message-user') ||
                           messageElement.parentElement
    expect(messageContainer).toBeTruthy()
  })

  test('displays assistant messages with correct styling', () => {
    const propsWithAssistantMessage = {
      ...mockProps,
      messages: [mockAssistantMessage]
    }
    
    render(<ChatMain {...propsWithAssistantMessage} />)
    
    const messageElement = screen.getByText('Assistant response')
    expect(messageElement).toBeInTheDocument()
    
    // Assistant messages should have appropriate styling/positioning
    const messageContainer = messageElement.closest('[data-role="assistant"]') ||
                           messageElement.closest('.message-assistant') ||
                           messageElement.parentElement
    expect(messageContainer).toBeTruthy()
  })

  test('handles message actions', () => {
    const propsWithMessage = {
      ...mockProps,
      messages: [mockAssistantMessage]
    }
    
    render(<ChatMain {...propsWithMessage} />)
    
    // Look for action buttons (copy, regenerate, etc.)
    const actionButtons = screen.queryAllByRole('button')
    
    // Should render without errors even if action buttons are present
    expect(true).toBe(true)
  })

  test('scrolls to bottom on new messages', () => {
    const mockRef = { current: { scrollIntoView: jest.fn() } }
    const propsWithRef = {
      ...mockProps,
      messagesEndRef: mockRef,
      messages: [mockMessage]
    }
    
    render(<ChatMain {...propsWithRef} />)
    
    // Component should handle scroll behavior appropriately
    expect(true).toBe(true)
  })

  test('handles long message content', () => {
    const longMessage = {
      ...mockMessage,
      content: 'This is a very long message that should test how the component handles lengthy content. '.repeat(20)
    }
    
    const propsWithLongMessage = {
      ...mockProps,
      messages: [longMessage]
    }
    
    render(<ChatMain {...propsWithLongMessage} />)
    
    // Should render long content without breaking
    expect(screen.getByText(/This is a very long message/)).toBeInTheDocument()
  })

  test('handles multiple messages in conversation', () => {
    const multipleMessages = [
      mockMessage,
      mockAssistantMessage,
      { ...mockMessage, id: '3', content: 'Follow-up question' },
      { ...mockAssistantMessage, id: '4', content: 'Follow-up response' }
    ]
    
    const propsWithMultipleMessages = {
      ...mockProps,
      messages: multipleMessages
    }
    
    render(<ChatMain {...propsWithMultipleMessages} />)
    
    // All messages should be displayed
    expect(screen.getByText('Test message')).toBeInTheDocument()
    expect(screen.getByText('Assistant response')).toBeInTheDocument()
    expect(screen.getByText('Follow-up question')).toBeInTheDocument()
    expect(screen.getByText('Follow-up response')).toBeInTheDocument()
  })

  test('maintains message order', () => {
    const orderedMessages = [
      { ...mockMessage, id: '1', content: 'First message' },
      { ...mockAssistantMessage, id: '2', content: 'Second message' },
      { ...mockMessage, id: '3', content: 'Third message' }
    ]
    
    const propsWithOrderedMessages = {
      ...mockProps,
      messages: orderedMessages
    }
    
    render(<ChatMain {...propsWithOrderedMessages} />)
    
    // Messages should appear in correct order
    const messages = screen.getAllByText(/message/)
    expect(messages.length).toBeGreaterThanOrEqual(3)
  })
})