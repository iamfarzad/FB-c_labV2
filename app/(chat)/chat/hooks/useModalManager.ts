"use client"

import { useState, useCallback } from "react"

export type ModalType = "screenShare" | "voiceInput" | "webcam"

export const useModalManager = () => {
  const [openModals, setOpenModals] = useState<Set<ModalType>>(new Set())

  const openModal = useCallback((modal: ModalType) => {
    setOpenModals((prev) => new Set(prev).add(modal))
  }, [])

  const closeModal = useCallback((modal: ModalType) => {
    setOpenModals((prev) => {
      const newSet = new Set(prev)
      newSet.delete(modal)
      return newSet
    })
  }, [])

  const isModalOpen = useCallback((modal: ModalType) => openModals.has(modal), [openModals])

  return { openModal, closeModal, isModalOpen }
}
