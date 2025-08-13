"use client"

import { useState, useEffect, useRef } from "react"
import { FbcVoiceOrb } from "./components/FbcVoiceOrb"
import { ScrollArea } from "./components/ui/scroll-area"
import { motion, AnimatePresence } from "motion/react"

type VoiceState = 'idle' | 'listening' | 'thinking' | 'talking' | 'browsing'

interface TranscriptMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isComplete?: boolean
}

export default function App() {
  const [currentState, setCurrentState] = useState<VoiceState>('idle')
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'Neural interface initialized. Voice recognition active.',
      timestamp: new Date(),
      isComplete: true
    }
  ])
  const [currentMessage, setCurrentMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Sophisticated conversation examples
  const demoConversation = [
    { type: 'user', content: 'Analyze the market trends for Q4' },
    { type: 'assistant', content: 'Accessing real-time market data and performing comprehensive analysis. Processing multiple data streams including trading volumes, sentiment analysis, and economic indicators.' },
    { type: 'user', content: 'Generate a strategic report for the board meeting' },
    { type: 'assistant', content: 'I\'ll compile a detailed strategic report incorporating our latest performance metrics, competitive analysis, and future projections. This will include executive summaries and actionable recommendations.' },
    { type: 'user', content: 'Schedule optimization meeting with the AI team' },
    { type: 'assistant', content: 'Analyzing team calendars and availability patterns. I\'ll propose optimal meeting times that maximize attendance and align with peak productivity hours for technical discussions.' }
  ]

  // Auto-scroll with smooth behavior
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth'
        })
      }
    }
  }, [transcript, currentMessage])

  // Enhanced demo simulation
  const simulateConversation = async () => {
    if (currentState !== 'idle') return
    
    for (let i = 0; i < demoConversation.length; i += 2) {
      // User message
      setIsRecording(true)
      setCurrentState('listening')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const userMessage = demoConversation[i]
      if (userMessage) {
        // Simulate natural typing
        setCurrentMessage('')
        for (let j = 0; j <= userMessage.content.length; j++) {
          setCurrentMessage(userMessage.content.slice(0, j))
          await new Promise(resolve => setTimeout(resolve, 30))
        }
        
        setTranscript(prev => [...prev, {
          id: Date.now().toString(),
          type: 'user',
          content: userMessage.content,
          timestamp: new Date(),
          isComplete: true
        }])
        setCurrentMessage('')
      }
      
      setIsRecording(false)
      setCurrentState('thinking')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Assistant response with browsing simulation
      const assistantMessage = demoConversation[i + 1]
      if (assistantMessage) {
        if (assistantMessage.content.includes('data') || assistantMessage.content.includes('analysis')) {
          setCurrentState('browsing')
          await new Promise(resolve => setTimeout(resolve, 2500))
        }
        
        setCurrentState('talking')
        
        // Natural AI response typing
        setCurrentMessage('')
        for (let j = 0; j <= assistantMessage.content.length; j++) {
          setCurrentMessage(assistantMessage.content.slice(0, j))
          await new Promise(resolve => setTimeout(resolve, 60))
        }
        
        setTranscript(prev => [...prev, {
          id: Date.now().toString(),
          type: 'assistant',
          content: assistantMessage.content,
          timestamp: new Date(),
          isComplete: true
        }])
        setCurrentMessage('')
      }
      
      setCurrentState('idle')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }

  const toggleRecording = () => {
    if (currentState !== 'idle' && currentState !== 'listening') return
    
    if (!isRecording) {
      setIsRecording(true)
      setCurrentState('listening')
    } else {
      setIsRecording(false)
      setCurrentState('idle')
    }
  }

  const clearTranscript = () => {
    setTranscript([{
      id: Date.now().toString(),
      type: 'system',
      content: 'Session cleared. Neural interface ready for new interaction.',
      timestamp: new Date(),
      isComplete: true
    }])
    setCurrentMessage('')
    setCurrentState('idle')
    setIsRecording(false)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const getStateDescription = () => {
    switch (currentState) {
      case 'idle': return 'Neural interface ready'
      case 'listening': return 'Capturing voice input'
      case 'thinking': return 'Processing neural patterns'
      case 'talking': return 'Generating response'
      case 'browsing': return 'Accessing data streams'
    }
  }

  const getStateIndicator = () => {
    switch (currentState) {
      case 'idle': return '●'
      case 'listening': return '◉'
      case 'thinking': return '◐'
      case 'talking': return '◑'
      case 'browsing': return '◒'
      default: return '●'
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl"
          style={{ background: 'radial-gradient(circle, #ff5b04 0%, transparent 70%)' }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            ease: "linear",
            repeat: Infinity,
          }}
        />
      </div>

      <div className="relative h-full flex flex-col max-w-7xl mx-auto">
        {/* Minimal Header */}
        <motion.header 
          className="flex items-center justify-between p-8 backdrop-blur-xl border-b border-white/5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-2xl font-light tracking-tight text-foreground/90">
                F.B/c
              </h1>
              <motion.div 
                className="flex items-center space-x-3 mt-1"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span 
                  className="text-sm font-medium"
                  style={{ color: currentState === 'idle' ? '#999' : '#ff5b04' }}
                >
                  {getStateIndicator()}
                </span>
                <span className="text-sm text-muted-foreground tracking-wide">
                  {getStateDescription()}
                </span>
              </motion.div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={simulateConversation}
              disabled={currentState !== 'idle'}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Demo
            </motion.button>
            <motion.button
              onClick={clearTranscript}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Clear
            </motion.button>
          </div>
        </motion.header>

        {/* Main Interface */}
        <div className="flex-1 flex">
          {/* Voice Orb Section - Centered and Minimal */}
          <motion.div 
            className="w-96 flex flex-col items-center justify-center relative"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Orb Container */}
            <div className="relative">
              <FbcVoiceOrb 
                state={currentState} 
                isRecording={isRecording}
                size="xl"
                onClick={toggleRecording}
                disabled={currentState === 'thinking' || currentState === 'talking' || currentState === 'browsing'}
              />
            </div>

            {/* Minimal Status */}
            <motion.div 
              className="mt-12 text-center space-y-2"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <p className="text-sm text-muted-foreground font-light">
                {isRecording ? 'Speak now' : 'Tap to interact'}
              </p>
            </motion.div>
          </motion.div>

          {/* Conversation Area */}
          <motion.div 
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ScrollArea ref={scrollAreaRef} className="flex-1 px-8 py-6">
              <div className="space-y-8">
                <AnimatePresence mode="popLayout">
                  {transcript.map((message) => (
                    <motion.div
                      key={message.id}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 30 
                      }}
                      className={cn(
                        "flex gap-6",
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {/* Avatar for non-user messages */}
                      {message.type !== 'user' && (
                        <motion.div 
                          className="w-8 h-8 rounded-full flex-shrink-0 mt-2 flex items-center justify-center"
                          style={{ 
                            background: message.type === 'system' 
                              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                              : 'linear-gradient(135deg, #ff5b04, #e65200)',
                            boxShadow: '0 0 20px rgba(255, 91, 4, 0.3)'
                          }}
                          animate={{
                            boxShadow: [
                              '0 0 20px rgba(255, 91, 4, 0.3)',
                              '0 0 25px rgba(255, 91, 4, 0.4)',
                              '0 0 20px rgba(255, 91, 4, 0.3)'
                            ]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <div className="w-3 h-3 rounded-full bg-white/90" />
                        </motion.div>
                      )}
                      
                      <div className={cn(
                        "max-w-[75%] space-y-3",
                        message.type === 'user' ? 'text-right' : 'text-left'
                      )}>
                        {/* Message Content */}
                        <motion.div 
                          className={cn(
                            "rounded-2xl px-6 py-4 backdrop-blur-xl",
                            message.type === 'user' 
                              ? 'bg-accent text-accent-foreground shadow-lg' 
                              : message.type === 'system'
                              ? 'bg-muted/30 border border-muted/30 text-muted-foreground'
                              : 'bg-card/60 border border-white/10 text-card-foreground shadow-lg'
                          )}
                          whileHover={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <p className="text-sm leading-relaxed font-light">
                            {message.content}
                          </p>
                        </motion.div>
                        
                        {/* Timestamp */}
                        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground/60">
                          <span>{formatTime(message.timestamp)}</span>
                        </div>
                      </div>

                      {/* User Avatar */}
                      {message.type === 'user' && (
                        <motion.div 
                          className="w-8 h-8 rounded-full flex-shrink-0 mt-2 flex items-center justify-center"
                          style={{ 
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
                          }}
                        >
                          <div className="w-3 h-3 rounded-full bg-white/90" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {currentMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-6 justify-start"
                  >
                    <motion.div 
                      className="w-8 h-8 rounded-full flex-shrink-0 mt-2 flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(135deg, #ff5b04, #e65200)',
                        boxShadow: '0 0 20px rgba(255, 91, 4, 0.4)'
                      }}
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(255, 91, 4, 0.4)',
                          '0 0 30px rgba(255, 91, 4, 0.6)',
                          '0 0 20px rgba(255, 91, 4, 0.4)'
                        ]
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <div className="w-3 h-3 rounded-full bg-white/90" />
                    </motion.div>
                    <div className="max-w-[75%]">
                      <motion.div 
                        className="bg-card/60 border border-white/10 text-card-foreground shadow-lg rounded-2xl px-6 py-4 backdrop-blur-xl"
                        animate={{ scale: [1, 1.005, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <p className="text-sm leading-relaxed font-light">
                          {currentMessage}
                          <motion.span 
                            className="text-accent ml-1"
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          >
                            |
                          </motion.span>
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}