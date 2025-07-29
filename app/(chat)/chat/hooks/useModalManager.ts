"use client"

import { useState } from "react"

export type ModalType =
  | "keyboardShortcuts"
  | "voiceInput"
  | "voiceOutput"
  | "webcam"
  | "screenShare"
  | "video2App"
  | "roiCalculator"

export const useModalManager = () => {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null)
  const [voiceOutputData, setVoiceOutputData] = useState<{
    textContent: string
    voiceStyle?: string
  } | null>(null)

  const openModal = (modal: ModalType) => {
    console.log("🔍 openModal called with:", modal, new Error().stack)
    setActiveModal(modal)
  }
  const closeModal = () => setActiveModal(null)

  const openVoiceOutputModal = (data: { textContent: string; voiceStyle?: string }) => {
    setVoiceOutputData(data)
    openModal("voiceOutput")
  }

  const closeVoiceOutputModal = () => {
    setVoiceOutputData(null)
    closeModal()
  }

  return {
    activeModal,
    openModal,
    closeModal,
    voiceOutputData,
    openVoiceOutputModal,
    closeVoiceOutputModal,
  }
}
