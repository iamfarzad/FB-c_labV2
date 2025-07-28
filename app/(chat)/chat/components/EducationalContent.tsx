"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import type { EducationalInteractionData } from "@/lib/educational-gemini-service"
import { sanitizeHtml } from "@/lib/html-sanitizer"
import { ErrorBoundary } from "@/components/ui/error-boundary"

interface EducationalContentProps {
  htmlContent: string
  onInteract: (data: EducationalInteractionData) => void
  appContext: string | null
  isLoading: boolean
  videoContext?: {
    videoUrl: string
    videoTitle?: string
    learningObjectives: string[]
  }
}

export const EducationalContent: React.FC<EducationalContentProps> = ({
  htmlContent,
  onInteract,
  appContext,
  isLoading,
  videoContext,
}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const processedHtmlContentRef = useRef<string | null>(null)
  const interactionStartTime = useRef<number>(0)
  const [currentLearningObjective, setCurrentLearningObjective] = useState<string>("")
  const [sanitizedContent, setSanitizedContent] = useState<string>("")

  // Sanitize HTML content
  useEffect(() => {
    if (htmlContent) {
      const sanitized = sanitizeHtml(htmlContent)
      setSanitizedContent(sanitized)
    }
  }, [htmlContent])

  useEffect(() => {
    if (typeof window === "undefined") return // Only run on client side

    const container = contentRef.current
    if (!container) return

    const handleInteraction = (event: MouseEvent | KeyboardEvent) => {
      let targetElement = event.target as HTMLElement

      // Find the interactive element
      while (targetElement && targetElement !== container && !targetElement.dataset.interactionId) {
        targetElement = targetElement.parentElement as HTMLElement
      }

      if (targetElement && targetElement.dataset.interactionId) {
        event.preventDefault()

        // Calculate time spent on this interaction
        const timeSpent = interactionStartTime.current > 0 ? Date.now() - interactionStartTime.current : 0

        let interactionValue: string | undefined = targetElement.dataset.interactionValue

        // Get value from associated input if specified
        if (targetElement.dataset.valueFrom) {
          const inputElement = document.getElementById(targetElement.dataset.valueFrom) as
            | HTMLInputElement
            | HTMLTextAreaElement
          if (inputElement) {
            interactionValue = inputElement.value
          }
        }

        // Determine if the interaction was correct (for assessment activities)
        let isCorrect: boolean | undefined
        if (targetElement.dataset.correctAnswer) {
          isCorrect = interactionValue === targetElement.dataset.correctAnswer
        }

        const interactionData: EducationalInteractionData = {
          id: targetElement.dataset.interactionId,
          type: targetElement.dataset.interactionType || "generic_click",
          value: interactionValue,
          elementType: targetElement.tagName.toLowerCase(),
          elementText: (targetElement.innerText || (targetElement as HTMLInputElement).value || "")
            .trim()
            .substring(0, 75),
          appContext: appContext,
          learningObjective: targetElement.dataset.learningObjective || currentLearningObjective,
          difficultyLevel: (targetElement.dataset.difficultyLevel as any) || "intermediate",
          timeSpent: timeSpent / 1000, // Convert to seconds
          isCorrect: isCorrect,
          timestamp: Date.now(),
        }

        // Provide immediate feedback for educational interactions
        if (isCorrect !== undefined) {
          showFeedback(targetElement, isCorrect, interactionValue)
        }

        onInteract(interactionData)

        // Reset interaction timer
        interactionStartTime.current = Date.now()
      }
    }

    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      if (target.dataset.learningObjective) {
        setCurrentLearningObjective(target.dataset.learningObjective)
      }
      interactionStartTime.current = Date.now()
    }

    // Add event listeners
    container.addEventListener("click", handleInteraction)
    container.addEventListener("keydown", handleInteraction)
    container.addEventListener("focusin", handleFocus)

    // Process scripts when content changes and loading is complete
    if (!isLoading && sanitizedContent !== processedHtmlContentRef.current) {
      const scripts = Array.from(container.getElementsByTagName("script"))

      scripts.forEach((oldScript) => {
        try {
          const newScript = document.createElement("script")
          Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value))
          newScript.text = oldScript.innerHTML

          if (oldScript.parentNode) {
            oldScript.parentNode.replaceChild(newScript, oldScript)
          }
        } catch (e) {
          console.error("Error processing educational script:", {
            scriptContent: oldScript.innerHTML.substring(0, 500),
            error: e,
          })
        }
      })

      processedHtmlContentRef.current = sanitizedContent

      // Initialize educational features
      initializeEducationalFeatures(container)
    }

    return () => {
      container.removeEventListener("click", handleInteraction)
      container.removeEventListener("keydown", handleInteraction)
      container.removeEventListener("focusin", handleFocus)
    }
  }, [sanitizedContent, onInteract, appContext, isLoading, currentLearningObjective])

  const showFeedback = (element: HTMLElement, isCorrect: boolean, value?: string) => {
    // Find or create feedback area
    let feedbackArea = document.getElementById("feedback_zone")
    if (!feedbackArea) {
      feedbackArea = document.createElement("div")
      feedbackArea.id = "feedback_zone"
      feedbackArea.className = "feedback-area mt-4 p-3 rounded-lg"
      element.parentNode?.insertBefore(feedbackArea, element.nextSibling)
    }

    // Show feedback
    feedbackArea.className = `feedback-area mt-4 p-3 rounded-lg ${
      isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    }`

    feedbackArea.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-lg">${isCorrect ? "✅" : "❌"}</span>
        <span class="font-semibold">
          ${isCorrect ? "Correct!" : "Not quite right."}
        </span>
      </div>
      ${value ? `<p class="mt-1 text-sm">Your answer: "${value}"</p>` : ""}
    `

    // Auto-hide feedback after 3 seconds
    setTimeout(() => {
      if (feedbackArea) {
        feedbackArea.style.opacity = "0"
        setTimeout(() => feedbackArea?.remove(), 300)
      }
    }, 3000)
  }

  const initializeEducationalFeatures = (container: HTMLElement) => {
    // Initialize progress tracking
    const progressIndicators = container.querySelectorAll(".progress-indicator")
    progressIndicators.forEach((indicator) => {
      const progress = indicator.getAttribute("data-progress")
      if (progress) {
        const progressBar = indicator.querySelector(".progress-bar")
        if (progressBar) {
          ;(progressBar as HTMLElement).style.width = `${progress}%`
        }
      }
    })

    // Initialize concept cards with hover effects
    const conceptCards = container.querySelectorAll(".concept-card")
    conceptCards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.classList.add("shadow-lg", "scale-105")
      })
      card.addEventListener("mouseleave", () => {
        card.classList.remove("shadow-lg", "scale-105")
      })
    })

    // Initialize learning analytics tracking
    const learningElements = container.querySelectorAll("[data-learning-event]")
    learningElements.forEach((element) => {
      const eventType = element.getAttribute("data-learning-event")
      if (eventType) {
        element.addEventListener("click", () => {
          // Track learning analytics
          console.log("Learning event:", eventType, {
            element: element.tagName,
            context: appContext,
            timestamp: Date.now(),
          })
        })
      }
    })
  }

  return (
    <ErrorBoundary>
      <div className="educational-content-wrapper">
        {videoContext && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <h4 className="font-semibold text-blue-800">Learning Context</h4>
            <p className="text-sm text-blue-600 mt-1">Video: {videoContext.videoTitle || "Educational Content"}</p>
            {videoContext.learningObjectives.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-blue-700">Learning Objectives:</p>
                <ul className="text-xs text-blue-600 mt-1 list-disc list-inside">
                  {videoContext.learningObjectives.slice(0, 3).map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div
          ref={contentRef}
          className="w-full h-full overflow-y-auto educational-content"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </div>
    </ErrorBoundary>
  )
}
