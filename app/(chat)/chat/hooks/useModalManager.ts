"use client"

import { useState } from "react"

type ModalType = "roi" | "research" | "analysis" | "leads" | "meeting" | "upload" | "screen" | "voice" | "webcam"

export function useModalManager() {
  const [modals, setModals] = useState({
    roi: false,
    research: false,
    analysis: false,
    leads: false,
    meeting: false,
    upload: false,
    screen: false,
    voice: false,
    webcam: false,
  })

  const openModal = (modal: ModalType) => {
    setModals((prev) => ({ ...prev, [modal]: true }))
  }

  const closeModal = (modal: ModalType) => {
    setModals((prev) => ({ ...prev, [modal]: false }))
  }

  return {
    modals,
    openModal,
    closeModal,
  }
}
