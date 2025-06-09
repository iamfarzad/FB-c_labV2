"use client"

import type React from "react"
import { Mic, X, Loader } from "lucide-react"

interface VoiceInputModalProps {
  isListening: boolean
  currentTranscription: string
  aiState: "listening" | "processing" | "idle" | "error"
  onClose: () => void
  theme: "light" | "dark"
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isListening,
  currentTranscription,
  aiState,
  onClose,
  theme,
}) => {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-40 transition-all duration-500 glassmorphism fade-in"
      style={
        {
          "--glass-bg": theme === "dark" ? "var(--color-gunmetal-light-alpha)" : "var(--color-light-silver-dark-alpha)",
        } as React.CSSProperties
      }
    >
      <div className="relative p-12 rounded-2xl flex flex-col items-center justify-center w-full h-full text-center">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 p-3 rounded-xl glassmorphism hover:surface-glow text-[var(--text-primary)] transition-all duration-300 group"
          aria-label="Close voice input"
        >
          <X size={24} className="group-hover:rotate-90 transition-transform" />
        </button>

        <div className={`p-8 rounded-full glassmorphism mb-8 ${isListening ? "pulse-glow" : ""} floating-element`}>
          <Mic
            size={80}
            className={`${
              isListening ? "animate-pulse text-[var(--color-orange-accent)]" : "text-[var(--text-primary)]"
            } transition-all duration-300`}
          />
        </div>

        <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)] gradient-text">
          {aiState === "listening" && "Listening..."}
          {aiState === "processing" && "AI is thinking..."}
          {aiState === "idle" && "Ready for your command."}
          {aiState === "error" && "Error in voice input."}
        </h2>

        {isListening && (
          <p className="text-lg text-[var(--text-primary)] opacity-80 mb-8 fade-in">
            Speak clearly into your microphone.
          </p>
        )}

        {currentTranscription && (
          <div className="glassmorphism p-6 rounded-2xl max-w-2xl w-full mx-auto shadow-lg text-[var(--text-primary)] fade-in">
            <p className="text-xl font-medium break-words">{currentTranscription || "Start speaking..."}</p>
          </div>
        )}

        {(aiState === "processing" || aiState === "listening") && (
          <div className="mt-8 p-4 rounded-full glassmorphism">
            <Loader size={30} className="animate-spin text-[var(--color-orange-accent)]" />
          </div>
        )}
      </div>
    </div>
  )
}
