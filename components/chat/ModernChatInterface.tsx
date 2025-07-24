"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { PlusCircle, Settings, Mic, Radio, X, Check, Sun, Moon, Send, Paperclip, Search, Image, Globe, Palette } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@/hooks/chat/useChat'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface ModernChatInterfaceProps {
  leadContext?: {
    name?: string
    email?: string
    company?: string
  }
}

export default function ModernChatInterface({ leadContext }: ModernChatInterfaceProps) {
  const [mode, setMode] = useState<'idle' | 'dictation' | 'voice'>('idle')
  const [greeting, setGreeting] = useState(`How can I help${leadContext?.name ? `, ${leadContext.name}` : ''}?`)
  const [input, setInput] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [showAImenu, setShowAImenu] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  
  const { toast } = useToast()
  const attachRef = useRef<HTMLDivElement>(null)
  const aiRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { 
    messages, 
    handleInputChange, 
    handleSubmit, 
    isLoading, 
    append 
  } = useChat({
    data: { leadContext }
  })

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (attachRef.current && !attachRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false)
      }
      if (aiRef.current && !aiRef.current.contains(e.target as Node)) {
        setShowAImenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      handleSubmit(e)
      setInput('')
    }
  }

  const handleVoiceInput = useCallback(() => {
    setMode('dictation')
    setIsRecording(true)
    toast({
      title: "Voice Recording",
      description: "Listening to your voice...",
    })
  }, [toast])

  const handleVoiceChat = useCallback(() => {
    setMode('voice')
    toast({
      title: "Voice Chat",
      description: "Live conversation mode activated",
    })
  }, [toast])

  const containerBg = theme === 'light' 
    ? 'bg-background/60 backdrop-blur-md' 
    : 'bg-background/60 backdrop-blur-md'

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header with brand colors */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-6 py-4 bg-primary text-primary-foreground flex justify-between items-center shadow-lg"
      >
        <motion.h1
          key={greeting}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-xl font-semibold"
        >
          {greeting}
        </motion.h1>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}
          className="p-2 rounded-full hover:bg-accent/20 transition-colors"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </motion.button>
      </motion.header>

      {/* Chat Area with messages */}
      <div className="flex-1 overflow-auto p-6 bg-background">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-muted-foreground"
            >
              <p className="text-lg">Start a conversation to see messages here</p>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm",
                    message.role === 'user'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-card text-card-foreground'
                  )}
                >
                  {message.content}
                </div>
              </motion.div>
            ))
          )}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-card rounded-2xl px-4 py-2 shadow-sm">
                <div className="flex space-x-2">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input Bar with glassmorphism */}
      {mode !== 'voice' && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className={cn(
            "px-6 py-4 border-t",
            containerBg,
            "fixed bottom-0 inset-x-0 flex justify-center"
          )}
        >
          <form 
            onSubmit={handleSendMessage}
            className="relative flex items-center w-full max-w-3xl bg-card rounded-full shadow-lg p-2"
          >
            {/* Attachments menu */}
            <div ref={attachRef} className="relative">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => mode === 'idle' && setShowAttachMenu(prev => !prev)}
                disabled={mode !== 'idle'}
                className="p-2 rounded-full hover:bg-accent/10 transition-colors"
              >
                <PlusCircle size={20} />
              </motion.button>
              <AnimatePresence>
                {showAttachMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute bottom-full left-0 mb-2 w-48 bg-card rounded-lg shadow-lg z-10 overflow-hidden"
                  >
                    <button 
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-accent/10 flex items-center gap-2"
                      onClick={() => {
                        setShowAttachMenu(false)
                        toast({ title: "Feature coming soon", description: "File upload will be available soon" })
                      }}
                    >
                      <Paperclip size={16} />
                      Add photos & files
                    </button>
                    <button 
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-accent/10 flex items-center justify-between"
                      onClick={() => {
                        setShowAttachMenu(false)
                        toast({ title: "Feature coming soon", description: "App integrations coming soon" })
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <PlusCircle size={16} />
                        Add from apps
                      </span>
                      <span>▶</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI Tools menu */}
            <div ref={aiRef} className="relative ml-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }}
                onClick={() => mode === 'idle' && setShowAImenu(prev => !prev)}
                disabled={mode !== 'idle'}
                className="p-2 rounded-full hover:bg-accent/10 transition-colors"
              >
                <Settings size={20} />
              </motion.button>
              <AnimatePresence>
                {showAImenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-full left-0 mb-2 w-48 bg-card rounded-lg shadow-lg z-10 overflow-hidden"
                  >
                    <button 
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-accent/10 flex items-center gap-2"
                      onClick={() => {
                        setShowAImenu(false)
                        append({ role: 'user', content: '/research' })
                      }}
                    >
                      <Search size={16} />
                      Deep research
                    </button>
                    <button 
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-accent/10 flex items-center gap-2"
                      onClick={() => {
                        setShowAImenu(false)
                        toast({ title: "Feature coming soon", description: "Image generation coming soon" })
                      }}
                    >
                      <Image size={16} />
                      Create image
                    </button>
                    <button 
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-accent/10 flex items-center gap-2"
                      onClick={() => {
                        setShowAImenu(false)
                        append({ role: 'user', content: '/search' })
                      }}
                    >
                      <Globe size={16} />
                      Web search
                    </button>
                    <button 
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-accent/10 flex items-center gap-2"
                      onClick={() => {
                        setShowAImenu(false)
                        toast({ title: "Feature coming soon", description: "Canvas mode coming soon" })
                      }}
                    >
                      <Palette size={16} />
                      Canvas
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input field */}
            <motion.input
              ref={inputRef}
              type="text"
              className="flex-1 mx-4 bg-transparent outline-none placeholder-muted-foreground text-foreground"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                handleInputChange(e)
              }}
              disabled={mode === 'dictation' || isLoading}
              whileFocus={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 200 }}
            />

            {/* Mode Controls with micro-interactions */}
            {mode === 'dictation' ? (
              <div className="flex items-center gap-2">
                <motion.button 
                  type="button"
                  whileTap={{ scale: 0.9 }} 
                  onClick={() => {
                    setMode('idle')
                    setIsRecording(false)
                  }} 
                  className="p-2 rounded-full hover:bg-accent/10 transition-colors"
                >
                  <X size={16} />
                </motion.button>
                <motion.button 
                  type="button"
                  whileTap={{ scale: 0.9 }} 
                  onClick={() => {
                    setMode('idle')
                    setIsRecording(false)
                    // Process the recorded audio
                    toast({ title: "Processing", description: "Converting speech to text..." })
                  }} 
                  className="p-2 rounded-full hover:bg-accent/10 transition-colors"
                >
                  <Check size={16} />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {input.trim() ? (
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.9 }}
                    disabled={isLoading}
                    className="p-2 rounded-full hover:bg-accent/10 transition-colors"
                  >
                    <Send size={20} />
                  </motion.button>
                ) : (
                  <>
                    <motion.button 
                      type="button"
                      whileTap={{ scale: 0.9 }} 
                      onClick={handleVoiceInput} 
                      className="p-2 rounded-full hover:bg-accent/10 transition-colors"
                    >
                      <Mic size={20} />
                    </motion.button>
                    <motion.button 
                      type="button"
                      whileTap={{ scale: 0.9 }} 
                      onClick={handleVoiceChat} 
                      className="p-2 rounded-full hover:bg-accent/10 transition-colors"
                    >
                      <Radio size={20} />
                    </motion.button>
                  </>
                )}
              </div>
            )}
          </form>

          {/* Live waveform */}
          {mode === 'dictation' && isRecording && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 16 }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 w-full max-w-3xl"
            >
              <div className="h-4 rounded-full bg-accent animate-pulse" />
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Voice Chat Overlay with immersive blur */}
      <AnimatePresence>
        {mode === 'voice' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md z-50"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-48 h-48 border-4 border-accent rounded-full"
            />
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-lg text-muted-foreground"
            >
              Listening...
            </motion.p>

            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMode('idle')} 
              className="absolute top-4 right-4 p-3 rounded-full hover:bg-accent/10 transition-colors"
            >
              <X size={24} />
            </motion.button>

            <div className="absolute bottom-8 flex space-x-6">
              <motion.button 
                whileTap={{ scale: 0.9 }} 
                className="p-4 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors"
              >
                <Mic size={24} />
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.9 }} 
                onClick={() => setMode('idle')} 
                className="p-4 rounded-full hover:bg-accent/10 transition-colors"
              >
                <X size={24} />
              </motion.button>
            </div>

            <motion.button 
              whileHover={{ scale: 1.1 }} 
              onClick={() => setShowAImenu(true)} 
              className="absolute top-4 left-4 p-3 rounded-full hover:bg-accent/10 transition-colors"
            >
              <Settings size={24} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 