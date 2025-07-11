"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Phone, 
  PhoneOff, 
  Send, 
  Loader2,
  Radio,
  MessageSquare,
  Activity
} from 'lucide-react'
import { geminiLiveService, type LiveAudioChunk } from '@/lib/gemini-live-service'
import { cn } from '@/lib/utils'

// Type definitions for Web Speech API for cross-browser compatibility
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void; // Using any for broader compatibility
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognition };
    webkitSpeechRecognition: { new(): SpeechRecognition };
  }
}

interface LiveVoiceModalProps {
  isOpen: boolean
  onClose: () => void
  leadContext?: {
    name?: string
    company?: string
    role?: string
    interests?: string
  }
}

interface ConversationMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  hasAudio?: boolean
}

export function LiveVoiceModal({ isOpen, onClose, leadContext }: LiveVoiceModalProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [audioChunks, setAudioChunks] = useState<LiveAudioChunk[]>([])
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Speech recognition
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [transcript, setTranscript] = useState('')
  
  // Connection status
  const [connectionStatus, setConnectionStatus] = useState<{
    sessionId: string | null
    audioChunksCount: number
  }>({ sessionId: null, audioChunksCount: 0 })

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'
        
        recognitionRef.current.onresult = (event) => {
          let finalTranscript = ''
          let interimTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }
          
          if (finalTranscript) {
            setTranscript(finalTranscript)
            handleSendMessage(finalTranscript)
            setIsListening(false)
          } else {
            setTranscript(interimTranscript)
          }
        }
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          setError(`Speech recognition error: ${event.error}`)
        }
        
        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [])

  // Setup Live service event handlers
  useEffect(() => {
    geminiLiveService.onConnected((connectionId) => {
      setIsConnected(true)
      setIsConnecting(false)
      setError(null)
      setConnectionStatus(geminiLiveService.getStatus())
    })

    geminiLiveService.onDisconnected(() => {
      setIsConnected(false)
      setIsConnecting(false)
      setConnectionStatus(geminiLiveService.getStatus())
    })

    geminiLiveService.onError((errorMessage) => {
      setError(errorMessage)
      setIsConnecting(false)
      setIsConnected(false)
    })

    geminiLiveService.onMessage((message) => {
      if (message.type === 'text' && message.payload.content) {
        const newMessage: ConversationMessage = {
          id: `assistant_${Date.now()}`,
          type: 'assistant',
          content: message.payload.content,
          timestamp: new Date(),
          hasAudio: false
        }
        setMessages(prev => [...prev, newMessage])
      }
    })

    geminiLiveService.onAudio((audioChunk: LiveAudioChunk) => {
      setAudioChunks(prev => [...prev, audioChunk])
      setConnectionStatus(geminiLiveService.getStatus())
      
      // Mark the last assistant message as having audio
      setMessages(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 && msg.type === 'assistant' 
            ? { ...msg, hasAudio: true }
            : msg
        )
      )
    })

    return () => {
      // Always cleanup on unmount
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop()
      }
      if (geminiLiveService.getStatus().isConnected) {
        geminiLiveService.disconnect()
      }
    }
  }, []) // Empty dependency array for mount/unmount only

  // Improve audio playback: Queue and play sequentially
  const audioQueue = useRef<LiveAudioChunk[]>([])
  const isPlaying = useRef(false)

  useEffect(() => {
    if (audioChunks.length > 0 && !isMuted) {
      audioQueue.current = [...audioChunks]
      playNextAudio()
    }
  }, [audioChunks, isMuted])

  const playNextAudio = () => {
    if (audioQueue.current.length === 0 || isPlaying.current) return
    isPlaying.current = true
    const chunk = audioQueue.current.shift()!
    const audio = new Audio(chunk.audioData)
    audio.onended = () => {
      isPlaying.current = false
      playNextAudio()
    }
    audio.play().catch(e => {
      console.error("Audio play error:", e)
      isPlaying.current = false
      playNextAudio()
    })
  }

  // Start Live conversation
  const handleStartConversation = async () => {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) { // Check env in client? Better in service, but alert here
      setError('Gemini API key not configured. Contact admin.')
      return
    }
    setIsConnecting(true)
    setError(null)
    
    try {
      await geminiLiveService.connect({
        message: "Hello! I'd like to start a live voice conversation to discuss AI consulting opportunities.",
        leadContext
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start conversation')
      setIsConnecting(false)
    }
  }

  // Disconnect conversation
  const handleDisconnect = async () => {
    try {
      await geminiLiveService.disconnect()
      setIsConnected(false)
      setIsConnecting(false)
      setConnectionStatus({ sessionId: null, audioChunksCount: 0 })
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }

  // Send text message
  const handleSendMessage = async (message: string = currentMessage) => {
    if (!message.trim() || !isConnected) return

    const userMessage: ConversationMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: message.trim(),
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setTranscript('')

    try {
      await geminiLiveService.sendMessage(message.trim())
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send message')
    }
  }

  // Toggle voice recording
  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setTranscript('')
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  // Toggle mute
  const handleToggleMute = () => {
    setIsMuted(!isMuted)
    // In a real implementation, this would control audio output
  }

  // Close modal and cleanup
  const handleClose = () => {
    if (isConnected) {
      handleDisconnect()
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-red-500" />
            Live Voice Conversation
            {isConnected && <Badge variant="default" className="bg-green-500">Connected</Badge>}
            {isConnecting && <Badge variant="secondary">Connecting...</Badge>}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
          {/* Main Conversation Area */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Connection Controls */}
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Connection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  {!isConnected && !isConnecting && (
                    <Button onClick={handleStartConversation} className="flex-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Start Live Conversation
                    </Button>
                  )}
                  
                  {isConnecting && (
                    <Button disabled className="flex-1">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </Button>
                  )}
                  
                  {isConnected && (
                    <Button onClick={handleDisconnect} variant="destructive" className="flex-1">
                      <PhoneOff className="h-4 w-4 mr-2" />
                      End Conversation
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleToggleMute}
                    disabled={!isConnected}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voice Input */}
            {isConnected && (
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Voice Input</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isListening ? "destructive" : "default"}
                      onClick={handleToggleListening}
                      className="flex-1"
                    >
                      {isListening ? (
                        <>
                          <MicOff className="h-4 w-4 mr-2" />
                          Stop Listening
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Start Speaking
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {transcript && (
                    <div className="text-sm bg-blue-50 p-2 rounded">
                      <strong>Listening:</strong> {transcript}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Text Input */}
            {isConnected && (
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Text Input</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button 
                      onClick={() => handleSendMessage()}
                      disabled={!currentMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Conversation Messages */}
            <Card className="flex-1 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Conversation
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto h-full space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    {isConnected ? 'Start speaking or typing to begin...' : 'Connect to start conversation'}
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "p-3 rounded-lg max-w-[80%]",
                        message.type === 'user'
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted"
                      )}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1 flex items-center gap-2">
                        {message.timestamp.toLocaleTimeString()}
                        {message.hasAudio && (
                          <Badge variant="secondary" className="text-xs">
                            <Volume2 className="h-3 w-3 mr-1" />
                            Audio
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Status Panel */}
          <div className="space-y-4">
            {/* Connection Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Connection:</span>
                  <Badge variant={isConnected ? "default" : "secondary"}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Session ID:</span>
                  <span className="text-xs font-mono">
                    {connectionStatus.sessionId?.slice(-8) || 'None'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Audio Chunks:</span>
                  <span>{connectionStatus.audioChunksCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Messages:</span>
                  <span>{messages.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Lead Context */}
            {leadContext && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Lead Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {leadContext.name && (
                    <div className="text-sm">
                      <strong>Name:</strong> {leadContext.name}
                    </div>
                  )}
                  {leadContext.company && (
                    <div className="text-sm">
                      <strong>Company:</strong> {leadContext.company}
                    </div>
                  )}
                  {leadContext.role && (
                    <div className="text-sm">
                      <strong>Role:</strong> {leadContext.role}
                    </div>
                  )}
                  {leadContext.interests && (
                    <div className="text-sm">
                      <strong>Interests:</strong> {leadContext.interests}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Audio History */}
            {audioChunks.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Audio History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {audioChunks.length} audio chunks received
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={() => {
                      geminiLiveService.clearAudioHistory()
                      setAudioChunks([])
                    }}
                  >
                    Clear History
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 