import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatMain } from '@/components/chat/ChatMain';

// Mock the hooks and dependencies
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-keyboard-shortcuts', () => ({
  useKeyboardShortcuts: () => ({
    registerShortcut: jest.fn(),
    unregisterShortcut: jest.fn(),
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

const mockMessages = [
  {
    id: '1',
    role: 'user',
    content: 'Hello, how are you?',
    timestamp: new Date('2024-01-01T10:00:00Z'),
  },
  {
    id: '2',
    role: 'assistant',
    content: 'I\'m doing well, thank you for asking! How can I help you today?',
    timestamp: new Date('2024-01-01T10:01:00Z'),
  },
];

const mockProps = {
  messages: mockMessages,
  isLoading: false,
  error: null,
  onRetry: jest.fn(),
  onClearMessages: jest.fn(),
  onExportChat: jest.fn(),
  onShareChat: jest.fn(),
  messagesEndRef: { current: null },
  isSidebarOpen: true,
  setIsSidebarOpen: jest.fn(),
  activityLog: [],
  addActivity: jest.fn(),
  clearActivities: jest.fn(),
  cleanupStuckActivities: jest.fn(),
};

describe('ChatMain Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders messages container', () => {
    render(<ChatMain {...mockProps} />);
    
    expect(screen.getByTestId('messages-container')).toBeInTheDocument();
  });

  test('displays user messages correctly', () => {
    render(<ChatMain {...mockProps} />);
    
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
    expect(screen.getByTestId('user-message')).toBeInTheDocument();
  });

  test('displays assistant messages correctly', () => {
    render(<ChatMain {...mockProps} />);
    
    expect(screen.getByText('I\'m doing well, thank you for asking! How can I help you today?')).toBeInTheDocument();
    expect(screen.getByTestId('ai-message')).toBeInTheDocument();
  });

  test('shows loading indicator when isLoading is true', () => {
    render(<ChatMain {...mockProps} isLoading={true} />);
    
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  test('shows error message when error exists', () => {
    const error = 'Something went wrong';
    render(<ChatMain {...mockProps} error={error} />);
    
    expect(screen.getByText(error)).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
  });

  test('handles retry button click', () => {
    const onRetry = jest.fn();
    const error = 'Something went wrong';
    render(<ChatMain {...mockProps} error={error} onRetry={onRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalled();
  });

  test('handles clear messages button click', () => {
    const onClearMessages = jest.fn();
    render(<ChatMain {...mockProps} onClearMessages={onClearMessages} />);
    
    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);
    
    expect(onClearMessages).toHaveBeenCalled();
  });

  test('handles export chat button click', () => {
    const onExportChat = jest.fn();
    render(<ChatMain {...mockProps} onExportChat={onExportChat} />);
    
    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);
    
    expect(onExportChat).toHaveBeenCalled();
  });

  test('handles share chat button click', () => {
    const onShareChat = jest.fn();
    render(<ChatMain {...mockProps} onShareChat={onShareChat} />);
    
    const shareButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(shareButton);
    
    expect(onShareChat).toHaveBeenCalled();
  });

  test('displays empty state when no messages', () => {
    render(<ChatMain {...mockProps} messages={[]} />);
    
    expect(screen.getByText(/start a conversation/i)).toBeInTheDocument();
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  test('displays message timestamps', () => {
    render(<ChatMain {...mockProps} />);
    
    // Check if timestamps are displayed (format may vary)
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
    expect(screen.getByText(/10:01/)).toBeInTheDocument();
  });

  test('handles message copy functionality', () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
    
    render(<ChatMain {...mockProps} />);
    
    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hello, how are you?');
  });

  test('handles message reactions', () => {
    render(<ChatMain {...mockProps} />);
    
    const likeButton = screen.getByRole('button', { name: /like/i });
    fireEvent.click(likeButton);
    
    // Check if reaction is applied
    expect(screen.getByTestId('message-reaction')).toBeInTheDocument();
  });

  test('handles sidebar toggle', () => {
    const setIsSidebarOpen = jest.fn();
    render(<ChatMain {...mockProps} setIsSidebarOpen={setIsSidebarOpen} />);
    
    const sidebarToggle = screen.getByRole('button', { name: /toggle sidebar/i });
    fireEvent.click(sidebarToggle);
    
    expect(setIsSidebarOpen).toHaveBeenCalledWith(false);
  });

  test('displays activity log when available', () => {
    const activityLog = [
      { id: '1', type: 'message_sent', timestamp: new Date(), details: 'Message sent' },
    ];
    render(<ChatMain {...mockProps} activityLog={activityLog} />);
    
    expect(screen.getByTestId('activity-log')).toBeInTheDocument();
    expect(screen.getByText('Message sent')).toBeInTheDocument();
  });

  test('handles message editing', () => {
    render(<ChatMain {...mockProps} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    // Should show edit input
    expect(screen.getByTestId('edit-input')).toBeInTheDocument();
  });

  test('handles message deletion', () => {
    render(<ChatMain {...mockProps} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    // Should show confirmation dialog
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  test('handles keyboard shortcuts', () => {
    const { useKeyboardShortcuts } = require('@/hooks/use-keyboard-shortcuts');
    render(<ChatMain {...mockProps} />);
    
    expect(useKeyboardShortcuts).toHaveBeenCalled();
  });

  test('scrolls to bottom when new messages are added', async () => {
    const messagesEndRef = { current: { scrollIntoView: jest.fn() } };
    render(<ChatMain {...mockProps} messagesEndRef={messagesEndRef} />);
    
    await waitFor(() => {
      expect(messagesEndRef.current?.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
      });
    });
  });

  test('handles message formatting (markdown)', () => {
    const messagesWithMarkdown = [
      {
        id: '1',
        role: 'assistant',
        content: '**Bold text** and *italic text*',
        timestamp: new Date(),
      },
    ];
    
    render(<ChatMain {...mockProps} messages={messagesWithMarkdown} />);
    
    // Check if markdown is rendered
    expect(screen.getByText('Bold text')).toBeInTheDocument();
    expect(screen.getByText('italic text')).toBeInTheDocument();
  });

  test('handles code blocks in messages', () => {
    const messagesWithCode = [
      {
        id: '1',
        role: 'assistant',
        content: '```javascript\nconsole.log("Hello");\n```',
        timestamp: new Date(),
      },
    ];
    
    render(<ChatMain {...mockProps} messages={messagesWithCode} />);
    
    expect(screen.getByText('console.log("Hello");')).toBeInTheDocument();
    expect(screen.getByTestId('code-block')).toBeInTheDocument();
  });

  test('handles file attachments in messages', () => {
    const messagesWithAttachment = [
      {
        id: '1',
        role: 'user',
        content: 'Here is a file',
        attachments: [{ name: 'document.pdf', url: '/files/document.pdf' }],
        timestamp: new Date(),
      },
    ];
    
    render(<ChatMain {...mockProps} messages={messagesWithAttachment} />);
    
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByTestId('file-attachment')).toBeInTheDocument();
  });

  test('handles image attachments in messages', () => {
    const messagesWithImage = [
      {
        id: '1',
        role: 'user',
        content: 'Here is an image',
        attachments: [{ name: 'image.jpg', url: '/images/image.jpg', type: 'image' }],
        timestamp: new Date(),
      },
    ];
    
    render(<ChatMain {...mockProps} messages={messagesWithImage} />);
    
    expect(screen.getByAltText('image.jpg')).toBeInTheDocument();
    expect(screen.getByTestId('image-attachment')).toBeInTheDocument();
  });
});
