import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { VoiceInputModal } from "@/components/chat/modals/VoiceInputModal"
import { VoiceOutputModal } from "@/components/chat/modals/VoiceOutputModal"
import jest from "jest" // Declare the jest variable

// Mock dependencies to isolate the components
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

jest.mock("@/app/(chat)/chat/context/ChatProvider", () => ({
  useChatContext: () => ({
    addActivity: jest.fn(),
  }),
}))

jest.mock("@/hooks/useMediaCapture", () => ({
  useMediaCapture: () => ({
    isCapturing: false,
    isPaused: false,
    elapsedTime: 0,
    startCapture: jest.fn(),
    stopCapture: jest.fn(),
    pauseCapture: jest.fn(),
    resumeCapture: jest.fn(),
    mediaItem: null,
    error: null,
  }),
}))

jest.mock("@/hooks/useMediaPlayer", () => ({
  useMediaPlayer: () => ({
    mediaElementRef: { current: null },
    setupMediaElement: jest.fn(),
    isPlaying: false,
    play: jest.fn(),
    pause: jest.fn(),
    currentTime: 0,
    duration: 0,
  }),
}))

global.fetch = jest.fn()
global.URL.createObjectURL = jest.fn(() => "mock-blob-url")
global.URL.revokeObjectURL = jest.fn()
global.Audio = jest.fn(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  onended: null,
  onplay: null,
  onerror: null,
  src: "",
})) as any

describe("VoiceInputModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onTransferToChat: jest.fn(),
    onVoiceResponse: jest.fn(),
    leadContext: { name: "Test User", company: "Test Corp" },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders correctly when open", () => {
    render(<VoiceInputModal {...defaultProps} />)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("Voice Input")).toBeInTheDocument()
  })

  it("calls onClose when the close button is clicked", () => {
    render(<VoiceInputModal {...defaultProps} />)
    fireEvent.click(screen.getByRole("button", { name: /close/i }))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('switches between "Voice Input" and "Live Chat" modes', () => {
    render(<VoiceInputModal {...defaultProps} />)
    const liveChatButton = screen.getByText("Live Chat")
    fireEvent.click(liveChatButton)
    expect(screen.getByText("Live Conversation Mode")).toBeInTheDocument()

    const voiceInputButton = screen.getByText("Voice Input")
    fireEvent.click(voiceInputButton)
    expect(screen.getByText("Record your message and send it to the chat.")).toBeInTheDocument()
  })
})

describe("VoiceOutputModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    textContent: "This is a test.",
    voiceStyle: "puck",
    autoPlay: true,
  }

  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockClear()
  })

  it("renders correctly and attempts to play audio automatically", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "audio/wav" },
      blob: jest.fn().mockResolvedValue(new Blob(["audio data"])),
    })

    render(<VoiceOutputModal {...defaultProps} />)

    expect(screen.getByRole("dialog")).toBeInTheDocument()
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it("handles API errors gracefully", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    })
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation()

    render(<VoiceOutputModal {...defaultProps} />)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("Failed to fetch TTS audio"))
    })
    consoleErrorSpy.mockRestore()
  })
})
