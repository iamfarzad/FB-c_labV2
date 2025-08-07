"use client"

import React, { useEffect, useRef } from 'react'
import type { BusinessInteractionData, UserBusinessContext } from '@/types/business-content'

interface BusinessContentRendererProps {
  htmlContent: string
  onInteract: (data: BusinessInteractionData) => void
  userContext?: UserBusinessContext
  isLoading?: boolean
}

/**
 * BusinessContentRenderer - F.B/c Inline Content System
 * Adapted from Gemini-OS GeneratedContent for business consulting
 * 
 * Renders AI-generated business content with F.B/c design tokens
 * Handles business-specific interactions and maintains user context
 */
export function BusinessContentRenderer({
  htmlContent,
  onInteract,
  userContext,
  isLoading = false
}: BusinessContentRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const processedHtmlContentRef = useRef<string | null>(null)

  useEffect(() => {
    const container = contentRef.current
    if (!container) return

    const handleClick = (event: MouseEvent) => {
      let targetElement = event.target as HTMLElement

      // Traverse up the DOM tree to find element with interaction ID
      while (
        targetElement &&
        targetElement !== container &&
        !targetElement.dataset.interactionId
      ) {
        targetElement = targetElement.parentElement as HTMLElement
      }

      if (targetElement && targetElement.dataset.interactionId) {
        event.preventDefault()

        let interactionValue: string | undefined = targetElement.dataset.interactionValue

        // Handle form input values
        if (targetElement.dataset.valueFrom) {
          const inputElement = document.getElementById(
            targetElement.dataset.valueFrom
          ) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          if (inputElement) {
            interactionValue = inputElement.value
          }
        }

        // Create business interaction data
        const interactionData: BusinessInteractionData = {
          id: targetElement.dataset.interactionId,
          type: (targetElement.dataset.interactionType as BusinessInteractionData['type']) || 'generic_click',
          value: interactionValue,
          elementType: targetElement.tagName.toLowerCase(),
          elementText: (
            targetElement.innerText ||
            (targetElement as HTMLInputElement).value ||
            ''
          )
            .trim()
            .substring(0, 75),
          businessContext: {
            industry: userContext?.industry,
            companySize: userContext?.companySize,
            currentTool: targetElement.dataset.businessTool,
            userGoals: userContext?.currentGoals
          }
        }

        onInteract(interactionData)
      }
    }

    // Handle form submissions
    const handleSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement
      if (form.dataset.interactionId) {
        event.preventDefault()
        
        const formData = new FormData(form)
        const formValues: Record<string, string> = {}
        
        formData.forEach((value, key) => {
          formValues[key] = value.toString()
        })

        const interactionData: BusinessInteractionData = {
          id: form.dataset.interactionId,
          type: (form.dataset.interactionType as BusinessInteractionData['type']) || 'lead_submit',
          value: JSON.stringify(formValues),
          elementType: 'form',
          elementText: 'Form submission',
          businessContext: {
            industry: userContext?.industry,
            companySize: userContext?.companySize,
            currentTool: form.dataset.businessTool,
            userGoals: userContext?.currentGoals
          }
        }

        onInteract(interactionData)
      }
    }

    container.addEventListener('click', handleClick)
    container.addEventListener('submit', handleSubmit)

    // Process scripts only when loading is complete and content has changed
    if (!isLoading) {
      if (htmlContent !== processedHtmlContentRef.current) {
        const scripts = Array.from(container.getElementsByTagName('script'))
        scripts.forEach((oldScript) => {
          try {
            const newScript = document.createElement('script')
            Array.from(oldScript.attributes).forEach((attr) =>
              newScript.setAttribute(attr.name, attr.value)
            )
            newScript.text = oldScript.innerHTML

            if (oldScript.parentNode) {
              oldScript.parentNode.replaceChild(newScript, oldScript)
            } else {
              console.warn(
                'Script tag found without a parent node:',
                oldScript
              )
            }
          } catch (e) {
            console.error(
              'Error processing/executing script tag in business content.',
              {
                scriptContent:
                  oldScript.innerHTML.substring(0, 500) +
                  (oldScript.innerHTML.length > 500 ? '...' : ''),
                error: e
              }
            )
          }
        })
        processedHtmlContentRef.current = htmlContent
      }
    } else {
      // Reset processed content ref when loading
      processedHtmlContentRef.current = null
    }

    return () => {
      container.removeEventListener('click', handleClick)
      container.removeEventListener('submit', handleSubmit)
    }
  }, [htmlContent, onInteract, userContext, isLoading])

  return (
    <div className="fbc-business-card max-w-[700px]">
      {isLoading && (
        <div className="fbc-flex-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
          <span className="ml-3 text-muted-foreground">Generating business content...</span>
        </div>
      )}
      <div
        ref={contentRef}
        className="w-full overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  )
}
