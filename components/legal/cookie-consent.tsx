"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Only run on client
    setMounted(true)
    
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      setVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setVisible(false)
    // Here you would also initialize your analytics/tracking scripts
  }

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined')
    setVisible(false)
  }

  if (!mounted || !visible) return null

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 shadow-lg"
      role="dialog"
      aria-labelledby="cookie-consent-heading"
      aria-describedby="cookie-consent-description"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 
              id="cookie-consent-heading"
              className="text-lg font-medium mb-1"
            >
              We value your privacy
            </h3>
            <p 
              id="cookie-consent-description"
              className="text-sm text-muted-foreground"
            >
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
              By clicking "Accept All", you consent to our use of cookies.
            </p>
            <div className="mt-2 text-sm">
              <a 
                href="/privacy-policy" 
                className="text-primary hover:underline"
                aria-label="Read our privacy policy"
              >
                Cookie Policy
              </a>
              {' • '}
              <a 
                href="/privacy-policy#cookies" 
                className="text-primary hover:underline"
                aria-label="Learn more about how we use cookies"
              >
                Learn More
              </a>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDecline}
              className="w-full md:w-auto"
            >
              Reject All
            </Button>
            <Button 
              onClick={handleAccept}
              size="sm"
              className="w-full md:w-auto"
            >
              Accept All
            </Button>
          </div>
          
          <button 
            onClick={handleDecline}
            className="absolute top-2 right-2 p-1 rounded-full opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close cookie consent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
