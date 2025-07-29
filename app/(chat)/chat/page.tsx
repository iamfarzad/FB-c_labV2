import { ChatProvider } from "./context/ChatProvider"
import { ChatInterface } from "./components/ChatInterface"

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatInterface />
    </ChatProvider>
  )
}
