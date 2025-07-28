import { render, screen } from "@testing-library/react"
import { ChatArea } from "@/components/chat/ChatArea"
import { useChat } from "@/context/ChatContext"

// Mock the ChatContext
jest.mock("@/context/ChatContext", () => ({
  useChat: jest.fn(),
}))

describe("ChatArea", () => {
  it("renders without crashing", () => {
    ;(useChat as jest.Mock).mockReturnValue({
      messages: [],
      addMessage: jest.fn(),
      isLoading: false,
      error: null,
    })

    render(<ChatArea />)
    expect(screen.getByTestId("chat-area")).toBeInTheDocument()
  })

  it("displays loading indicator when isLoading is true", () => {
    ;(useChat as jest.Mock).mockReturnValue({
      messages: [],
      addMessage: jest.fn(),
      isLoading: true,
      error: null,
    })

    render(<ChatArea />)
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("displays error message when error is present", () => {
    ;(useChat as jest.Mock).mockReturnValue({
      messages: [],
      addMessage: jest.fn(),
      isLoading: false,
      error: "An error occurred",
    })

    render(<ChatArea />)
    expect(screen.getByText("Error: An error occurred")).toBeInTheDocument()
  })

  it("renders messages correctly", () => {
    ;(useChat as jest.Mock).mockReturnValue({
      messages: [
        { id: "1", text: "Hello", sender: "user" },
        { id: "2", text: "Hi", sender: "bot" },
      ],
      addMessage: jest.fn(),
      isLoading: false,
      error: null,
    })

    render(<ChatArea />)
    expect(screen.getByText("Hello")).toBeInTheDocument()
    expect(screen.getByText("Hi")).toBeInTheDocument()
  })
})
