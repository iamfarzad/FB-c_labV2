'use client';

import { useChatContext } from '../../context/ChatProvider';
import { MessageList } from '../messages/MessageList';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { motion } from "framer-motion"
import { Message } from "../../types/chat"
import { useToast } from "@/components/ui/use-toast"

interface ChatMainProps {
  className?: string;
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function ChatMain({ messages, isLoading, messagesEndRef }: ChatMainProps) {
  const { toast } = useToast()

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied!",
      description: "Message copied to clipboard",
    })
  }

  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <div className="relative w-full h-full">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-6 p-4 max-w-3xl mx-auto">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 animate-pulse">
                      <div className="absolute inset-0 rounded-full bg-orange-400/30 animate-ping" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">Hello! How can I assist you today?</h2>
                  <p className="text-muted-foreground max-w-md">
                    I'm F.B/c AI Assistant, ready to help with your questions, analyze content, 
                    generate images, process videos, and much more. Just start typing!
                  </p>
                </div>
              )}

              {/* Messages */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 w-full items-start",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "flex flex-col gap-2 max-w-2xl",
                    message.role === "user" ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "rounded-2xl px-4 py-3 break-words",
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground max-w-lg" 
                        : "bg-muted text-muted-foreground w-full"
                    )}>
                      {/* Handle image display if present */}
                      {message.imageUrl && (
                        <img 
                          src={message.imageUrl} 
                          alt="Uploaded content" 
                          className="max-w-full h-auto rounded-lg mb-2"
                        />
                      )}
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-6 h-6"
                            onClick={() => handleCopyMessage(message.content)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-6 h-6">
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-6 h-6">
                            <ThumbsDown className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/user-avatar.png" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className={cn("flex gap-3 max-w-[80%] mr-auto")}>
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3 max-w-xs">
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
      </div>
    </main>
  );
}

export default ChatMain;
