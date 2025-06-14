"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input or textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Handle keyboard shortcuts
      switch (e.key) {
        case '?':
          if (e.ctrlKey || e.metaKey) {
            // Toggle keyboard shortcuts help
            // This would open a modal or show a help dialog
            console.log('Show keyboard shortcuts help')
          }
          break
        // Add more keyboard shortcuts as needed
      }
    }


    // Add focus styles for keyboard navigation
    const handleFirstTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing')
        window.removeEventListener('keydown', handleFirstTab)
        window.addEventListener('mousedown', handleMouseDown)
      }
    }

    const handleMouseDown = () => {
      document.body.classList.remove('user-is-tabbing')
      window.removeEventListener('mousedown', handleMouseDown)
      window.addEventListener('keydown', handleFirstTab)
    }

    window.addEventListener('keydown', handleFirstTab)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleFirstTab)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [router])

  // Add skip to main content link
  useEffect(() => {
    // This will be added to the DOM after the first render
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.className = 'skip-to-main-content'
    skipLink.textContent = 'Skip to main content'
    skipLink.style.position = 'absolute'
    skipLink.style.left = '-9999px'
    skipLink.style.zIndex = '999'
    skipLink.style.padding = '1em'
    skipLink.style.backgroundColor = 'white'
    skipLink.style.color = 'black'
    skipLink.style.opacity = '0'
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.left = '0'
      skipLink.style.opacity = '1'
    })
    
    document.body.prepend(skipLink)
    
    return () => {
      document.body.removeChild(skipLink)
    }
  }, [])

  return <>{children}</>
}

// Add global styles for focus states
export const accessibilityStyles = `
  /* Only show focus styles when using keyboard */
  body:not(.user-is-tabbing) button:focus,
  body:not(.user-is-tabbing) input:focus,
  body:not(.user-is-tabbing) select:focus,
  body:not(.user-is-tabbing) textarea:focus,
  body:not(.user-is-tabbing) a:focus,
  body:not(.user-is-tabbing) [tabindex]:focus {
    outline: none;
  }

  /* Focus styles */
  .user-is-tabbing :focus-visible {
    outline: 3px solid #3b82f6;
    outline-offset: 2px;
    border-radius: 0.25rem;
    transition: outline-offset 0.1s ease;
  }

  /* Skip to main content link */
  .skip-to-main-content {
    position: absolute !important;
    left: -9999px !important;
    z-index: 999 !important;
    padding: 1em !important;
    background-color: white !important;
    color: black !important;
    opacity: 0 !important;
    transition: opacity 0.2s ease-in-out !important;
  }

  .skip-to-main-content:focus {
    left: 0 !important;
    opacity: 1 !important;
  }
`
