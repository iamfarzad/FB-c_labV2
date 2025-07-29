"use client"

import { useState, useCallback } from "react"
import type { ModalType } from "../types/chat"

export const useModalManager = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  const openModal = useCallback((modal: ModalType) => {
    setActiveModal(modal)
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(null)
  }, [])

  return { activeModal, openModal, closeModal }
}
