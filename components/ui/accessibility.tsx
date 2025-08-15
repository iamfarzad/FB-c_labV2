"use client"

import React, { useEffect, useRef, createContext, useContext, ReactNode } from 'react'

// Accessibility context for managing focus and navigation
interface AccessibilityContextType {
  registerFocusable: (id: string, element: HTMLElement) => void
  unregisterFocusable: (id: string) => void
  focusElement: (id: string) => void
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null)

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

interface AccessibilityProviderProps {
  children: ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const focusableElements = useRef<Map<string, HTMLElement>>(new Map())
  const liveRegionRef = useRef<HTMLDivElement>(null)

  const registerFocusable = (id: string, element: HTMLElement) => {
    focusableElements.current.set(id, element)
  }

  const unregisterFocusable = (id: string) => {
    focusableElements.current.delete(id)
  }

  const focusElement = (id: string) => {
    const element = focusableElements.current.get(id)
    if (element) {
      element.focus()
    }
  }

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority)
      liveRegionRef.current.textContent = message
      
      // Clear the message after a short delay
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = ''
        }
      }, 1000)
    }
  }

  const value: AccessibilityContextType = {
    registerFocusable,
    unregisterFocusable,
    focusElement,
    announceToScreenReader
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Live region for screen reader announcements */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />
    </AccessibilityContext.Provider>
  )
}

// Focus trap component for modal-like features
interface FocusTrapProps {
  children: ReactNode
  isActive?: boolean
  onEscape?: () => void
}

export function FocusTrap({ children, isActive = true, onEscape }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { registerFocusable, unregisterFocusable } = useAccessibility()

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault()
        onEscape()
        return
      }

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    firstElement.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive, onEscape, firstElement, lastElement])

  return (
    <div ref={containerRef} tabIndex={-1}>
      {children}
    </div>
  )
}

// Skip link component for keyboard navigation
export function SkipLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {children}
    </a>
  )
}

// Keyboard shortcut component
interface KeyboardShortcutProps {
  keys: string[]
  onTrigger: () => void
  description?: string
  children: ReactNode
}

export function KeyboardShortcut({ keys, onTrigger, description, children }: KeyboardShortcutProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKeys = []
      
      if (event.ctrlKey || event.metaKey) pressedKeys.push('Ctrl')
      if (event.shiftKey) pressedKeys.push('Shift')
      if (event.altKey) pressedKeys.push('Alt')
      
      const key = event.key.toUpperCase()
      if (key !== 'Control' && key !== 'Shift' && key !== 'Alt') {
        pressedKeys.push(key)
      }

      const pressedKeyString = pressedKeys.join('+')
      const expectedKeyString = keys.join('+')

      if (pressedKeyString === expectedKeyString) {
        event.preventDefault()
        onTrigger()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [keys, onTrigger])

  return <>{children}</>
}

// Screen reader only text
export function SrOnly({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>
}

// Visually hidden but accessible to screen readers
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return (
    <span className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0">
      {children}
    </span>
  )
}
