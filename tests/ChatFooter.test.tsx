import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatFooter } from '@/components/chat/ChatFooter';

// Mock complex child components to isolate footer
jest.mock('@/components/chat/ToolMenu', () => ({
  ToolMenu: (props: any) => <button aria-label="mock-toolmenu" onClick={props.onUploadDocument}>Tools</button>
}))
jest.mock('@/components/ui/PillInput', () => ({
  __esModule: true,
  default: ({ value, onChange, onSubmit, leftSlot, rightSlot, placeholder }: any) => (
    <form onSubmit={onSubmit} aria-label="pill-input-form">
      {leftSlot}
      <textarea placeholder={placeholder} value={value} onChange={onChange} />
      {rightSlot}
    </form>
  )
}))

// Mock the hooks and dependencies
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock('@/hooks/ui/use-auto-resize-textarea', () => ({
  useAutoResizeTextarea: () => ({
    textareaRef: { current: null },
    adjustHeight: jest.fn(),
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

const mockProps = {
  input: '',
  setInput: jest.fn(),
  handleInputChange: jest.fn(),
  handleSubmit: jest.fn(),
  isLoading: false,
  onFileUpload: jest.fn(),
  onImageUpload: jest.fn(),
  onVoiceTranscript: jest.fn(),
  inputRef: { current: document.createElement('textarea') },
  showVoiceModal: false,
  setShowVoiceModal: jest.fn(),
  showWebcamModal: false,
  setShowWebcamModal: jest.fn(),
  showScreenShareModal: false,
  setShowScreenShareModal: jest.fn(),
  setShowVideo2AppModal: jest.fn(),
  setShowROICalculatorModal: jest.fn(),
};

describe('ChatFooter Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input field and send button', () => {
    render(<ChatFooter {...mockProps} />);
    
    expect(screen.getByPlaceholderText(/ask anything/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  test('handles text input changes', () => {
    const handleInputChange = jest.fn();
    render(<ChatFooter {...mockProps} handleInputChange={handleInputChange} />);
    
    const input = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.change(input, { target: { value: 'Hello world' } });
    
    expect(handleInputChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'Hello world' }),
      })
    );
  });

  test('handles form submission', () => {
    const handleSubmit = jest.fn();
    render(<ChatFooter {...mockProps} handleSubmit={handleSubmit} />);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(handleSubmit).toHaveBeenCalled();
  });

  test('handles Enter key press for submission', () => {
    const handleSubmit = jest.fn();
    render(<ChatFooter {...mockProps} handleSubmit={handleSubmit} />);
    
    const input = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(handleSubmit).toHaveBeenCalled();
  });

  test('handles Ctrl+Enter for new line', () => {
    const handleSubmit = jest.fn();
    render(<ChatFooter {...mockProps} handleSubmit={handleSubmit} />);
    
    const input = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', ctrlKey: true });
    
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test('shows loading state when isLoading is true', () => {
    render(<ChatFooter {...mockProps} isLoading={true} />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  test('renders voice input button', () => {
    render(<ChatFooter {...mockProps} />);
    
    const voiceButton = screen.getByRole('button', { name: /start voice input/i });
    expect(voiceButton).toBeInTheDocument();
  });

  test('handles voice button click', () => {
    const setShowVoiceModal = jest.fn();
    render(<ChatFooter {...mockProps} setShowVoiceModal={setShowVoiceModal} />);
    
    const voiceButton = screen.getByRole('button', { name: /start voice input/i });
    fireEvent.click(voiceButton);
    
    expect(setShowVoiceModal).toHaveBeenCalledWith(true);
  });

  test('renders microphone button', () => {
    render(<ChatFooter {...mockProps} />);
    
    const micButton = screen.getByRole('button', { name: /microphone/i });
    expect(micButton).toBeInTheDocument();
  });

  test('renders camera button', () => {
    render(<ChatFooter {...mockProps} />);
    
    const cameraButton = screen.getByRole('button', { name: /camera/i });
    expect(cameraButton).toBeInTheDocument();
  });

  test('handles camera button click', () => {
    const setShowWebcamModal = jest.fn();
    render(<ChatFooter {...mockProps} setShowWebcamModal={setShowWebcamModal} />);
    
    const cameraButton = screen.getByRole('button', { name: /camera/i });
    fireEvent.click(cameraButton);
    
    expect(setShowWebcamModal).toHaveBeenCalledWith(true);
  });

  test('renders screen share button', () => {
    render(<ChatFooter {...mockProps} />);
    
    const screenShareButton = screen.getByRole('button', { name: /screen share/i });
    expect(screenShareButton).toBeInTheDocument();
  });

  test('handles screen share button click', () => {
    const setShowScreenShareModal = jest.fn();
    render(<ChatFooter {...mockProps} setShowScreenShareModal={setShowScreenShareModal} />);
    
    const screenShareButton = screen.getByRole('button', { name: /screen share/i });
    fireEvent.click(screenShareButton);
    
    expect(setShowScreenShareModal).toHaveBeenCalledWith(true);
  });

  test('renders attachment button', () => {
    render(<ChatFooter {...mockProps} />);
    
    const attachmentButton = screen.getByRole('button', { name: /add attachment/i });
    expect(attachmentButton).toBeInTheDocument();
  });

  test('handles attachment button click', () => {
    render(<ChatFooter {...mockProps} />);
    
    const attachmentButton = screen.getByRole('button', { name: /add attachment/i });
    fireEvent.click(attachmentButton);
    
    // Should show attachment menu
    expect(screen.getByText(/add photos & files/i)).toBeInTheDocument();
  });

  test('handles file upload', async () => {
    const onFileUpload = jest.fn();
    render(<ChatFooter {...mockProps} onFileUpload={onFileUpload} />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByTestId('file-input');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(onFileUpload).toHaveBeenCalledWith(file);
    });
  });

  test('renders ROI calculator button', () => {
    render(<ChatFooter {...mockProps} />);
    
    const roiButton = screen.getByRole('button', { name: /calculator/i });
    expect(roiButton).toBeInTheDocument();
  });

  test('handles ROI calculator button click', () => {
    const setShowROICalculatorModal = jest.fn();
    render(<ChatFooter {...mockProps} setShowROICalculatorModal={setShowROICalculatorModal} />);
    
    const roiButton = screen.getByRole('button', { name: /calculator/i });
    fireEvent.click(roiButton);
    
    expect(setShowROICalculatorModal).toHaveBeenCalledWith(true);
  });

  test('renders video to app button', () => {
    render(<ChatFooter {...mockProps} />);
    
    const videoButton = screen.getByRole('button', { name: /monitor/i });
    expect(videoButton).toBeInTheDocument();
  });

  test('handles video to app button click', () => {
    const setShowVideo2AppModal = jest.fn();
    render(<ChatFooter {...mockProps} setShowVideo2AppModal={setShowVideo2AppModal} />);
    
    const videoButton = screen.getByRole('button', { name: /monitor/i });
    fireEvent.click(videoButton);
    
    expect(setShowVideo2AppModal).toHaveBeenCalledWith(true);
  });

  test('displays input value correctly', () => {
    render(<ChatFooter {...mockProps} input="Test message" />);
    
    const input = screen.getByPlaceholderText(/ask anything/i);
    expect(input).toHaveValue('Test message');
  });

  test('handles textarea auto-resize', () => {
    const { adjustHeight } = require('@/hooks/ui/use-auto-resize-textarea');
    render(<ChatFooter {...mockProps} />);
    
    const input = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.change(input, { target: { value: 'Multiple\nlines\nof\ntext' } });
    
    expect(adjustHeight).toHaveBeenCalled();
  });
});
