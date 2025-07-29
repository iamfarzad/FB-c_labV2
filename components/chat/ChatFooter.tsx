"use client"

import type React from "react"
import { InputWithSend } from "./footer/InputWithSend"
import { ActionButtons } from "./footer/ActionButtons"
import type { ModalType } from "@/app/(chat)/chat/hooks/useModalManager"

interface ChatFooterProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  onFileUpload: (file: File) => void
  onImageUpload: (imageData: string, fileName: string) => void
  openModal: (modal: ModalType) => void
}

export function ChatFooter({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  onFileUpload,
  onImageUpload,
  openModal,
}: ChatFooterProps) {
  return (
    <footer className="bg-background border-t p-4 shrink-0">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2">
          <InputWithSend
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
        <div className="mt-2 flex justify-between items-center">
          <ActionButtons onFileUpload={onFileUpload} onImageUpload={onImageUpload} openModal={openModal} />
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 border rounded bg-muted">Enter</kbd> to send,{" "}
            <kbd className="px-1.5 py-0.5 border rounded bg-muted">Shift+Enter</kbd> for new line.
          </p>
        </div>
      </div>
    </footer>
  )
}
