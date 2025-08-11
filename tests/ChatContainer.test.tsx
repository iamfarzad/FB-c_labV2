import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import { ChatContainer } from '@/app/(chat)/chat/components/ChatContainer'

describe('ChatContainer Component', () => {
  const renderWithProvider = (props = {}) => {
    return render(
      <ThemeProvider attribute="class" defaultTheme="system">
        <ChatContainer {...props} />
      </ThemeProvider>
    )
  }

  it('renders chat container main element', () => {
    const defaultProps = {
      onDownloadSummary: jest.fn(),
      activities: [],
      onNewChat: jest.fn(),
      messages: [],
      onActivityClick: jest.fn(),
      onClearActivities: jest.fn(),
      onToggle: jest.fn(),
      isLoading: false,
      leadName: '',
      onSendMessage: jest.fn(),
      onDeleteMessage: jest.fn(),
      onEditMessage: jest.fn(),
      onRetryMessage: jest.fn(),
      onScrollToMessage: jest.fn(),
    }
    renderWithProvider(defaultProps)
    const container = screen.getByTestId('chat-container-main')
    expect(container).toBeInTheDocument()
  })

  // Add more tests for chat container functionality as needed
})
