"use client"

import { useState } from "react"

interface ModalState {
  isOpen: boolean
  type: string | null
}

export function useModalManager() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: null,
  })

  const openModal = (type: string) => {
    setModalState({
      isOpen: true,
      type,
    })
  }

  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: null,
    })
  }

  return {
    modalState,
    openModal,
    closeModal,
  }
}
