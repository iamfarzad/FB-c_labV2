"use client"

import { useState, useCallback } from "react"

export interface ModalState {
  [key: string]: boolean
}

export function useModalState<T extends string>(initialState?: Partial<Record<T, boolean>>) {
  const [modals, setModals] = useState<Record<T, boolean>>(
    (initialState as Record<T, boolean>) || ({} as Record<T, boolean>),
  )

  const openModal = useCallback((modalName: T) => {
    setModals((prev) => ({ ...prev, [modalName]: true }))
  }, [])

  const closeModal = useCallback((modalName: T) => {
    setModals((prev) => ({ ...prev, [modalName]: false }))
  }, [])

  const toggleModal = useCallback((modalName: T) => {
    setModals((prev) => ({ ...prev, [modalName]: !prev[modalName] }))
  }, [])

  const closeAllModals = useCallback(() => {
    setModals((prev) => {
      const newState = { ...prev }
      Object.keys(newState).forEach((key) => {
        newState[key as T] = false
      })
      return newState
    })
  }, [])

  const isModalOpen = useCallback(
    (modalName: T): boolean => {
      return Boolean(modals[modalName])
    },
    [modals],
  )

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
    isModalOpen,
  }
}
