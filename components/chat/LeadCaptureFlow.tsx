"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, User, Mail, Building, Shield, ArrowRight, CheckCircle, Loader2, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LeadCaptureState } from "@/app/(chat)/chat/types/lead-capture"

interface LeadCaptureFlowProps {
  isVisible: boolean
  onComplete: (leadData: LeadCaptureState["leadData"]) => void
  engagementType?: string
  initialQuery?: string
}

export function LeadCaptureFlow({
  isVisible,
  onComplete,
  engagementType = "chat",
  initialQuery,
}: LeadCaptureFlowProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    agreedToTerms: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 0:
        if (!formData.name.trim()) {
          newErrors.name = "Name is required"
        } else if (formData.name.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters"
        }
        break
      case 1:
        if (!formData.email.trim()) {
          newErrors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Please enter a valid email address"
        }
        break
      case 2:
        // Company is optional, no validation needed
        break
      case 3:
        if (!formData.agreedToTerms) {
          newErrors.terms = "You must agree to the terms and conditions"
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          engagementType,
          initialQuery,
          tcAcceptance: {
            accepted: formData.agreedToTerms,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('API Error Response:', errorData)
        throw new Error(`Failed to submit lead data: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.info('Lead capture success:', result)

      onComplete({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        engagementType,
        initialQuery,
      })

      toast({
        title: "Welcome aboard! 🎉",
        description: "Your consultation is ready to begin. Let's create something amazing together!",
      })
    } catch (error) {
      console.error("Lead capture error:", error)
      
      const fallbackData = {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        engagementType,
        initialQuery,
        timestamp: new Date().toISOString(),
        fallback: true
      }
      localStorage.setItem('pendingLeadData', JSON.stringify(fallbackData))
      
      onComplete({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        engagementType,
        initialQuery,
      })

      toast({
        title: "Welcome! ✨",
        description: "Starting your consultation. Your information will be saved shortly.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    {
      title: "What's your name?",
      description: "Let's start with a proper introduction",
      icon: User,
      field: "name",
      placeholder: "Enter your full name",
      type: "text"
    },
    {
      title: "Your email address?",
      description: "We'll use this to send you insights and updates",
      icon: Mail,
      field: "email",
      placeholder: "your@email.com",
      type: "email"
    },
    {
      title: "Company name?",
      description: "Optional - helps us provide better recommendations",
      icon: Building,
      field: "company",
      placeholder: "Your company name (optional)",
      type: "text"
    },
    {
      title: "Terms & Conditions",
      description: "Final step to unlock your AI consultation",
      icon: Shield,
      field: "terms",
      placeholder: "",
      type: "checkbox"
    }
  ]

  const currentStepData = steps[currentStep]

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && null} // Prevent closing on click outside
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md mx-auto relative"
        >
          {/* Main Card */}
          <div className="bg-card/95 backdrop-blur-2xl border border-border/30 rounded-3xl shadow-2xl overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 pointer-events-none" />
            
            {/* Header */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative p-8 pb-4"
            >
              {/* Step Indicator */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      animate={{
                        width: index <= currentStep ? 24 : 8,
                        backgroundColor: index <= currentStep 
                          ? "hsl(var(--accent))" 
                          : "hsl(var(--muted))"
                      }}
                      transition={{ duration: 0.3 }}
                      className="h-2 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {currentStep + 1} of {steps.length}
                </span>
              </div>

              {/* Step Icon */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-xl"
              >
                <currentStepData.icon className="w-8 h-8 text-accent-foreground" />
              </motion.div>

              {/* Step Title & Description */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {currentStepData.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>
            </motion.div>

            {/* Form Content */}
            <motion.div
              key={`form-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="px-8 pb-8"
            >
              {currentStep < 3 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={currentStepData.field} className="text-sm font-medium">
                      {currentStepData.title.replace('?', '')} {currentStep < 2 && '*'}
                    </Label>
                    <div className="relative">
                      <Input
                        id={currentStepData.field}
                        type={currentStepData.type}
                        value={formData[currentStepData.field as keyof typeof formData] as string}
                        onChange={(e) => {
                          setFormData({ ...formData, [currentStepData.field]: e.target.value })
                          if (errors[currentStepData.field]) {
                            setErrors({ ...errors, [currentStepData.field]: "" })
                          }
                        }}
                        placeholder={currentStepData.placeholder}
                        className={cn(
                          "h-12 px-4 rounded-xl border-border/30 bg-card/50 backdrop-blur-sm",
                          "focus:ring-2 focus:ring-accent/20 focus:border-accent/50 transition-all duration-200",
                          errors[currentStepData.field] && "border-destructive focus:ring-destructive/20"
                        )}
                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                      />
                      {errors[currentStepData.field] && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-destructive mt-1 flex items-center gap-1"
                        >
                          {errors[currentStepData.field]}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-muted/20 rounded-xl p-4 border border-border/20">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={formData.agreedToTerms}
                        onCheckedChange={(checked) => {
                          setFormData({ ...formData, agreedToTerms: !!checked })
                          if (errors.terms) {
                            setErrors({ ...errors, terms: "" })
                          }
                        }}
                        className="mt-1"
                      />
                      <Label htmlFor="terms" className="text-sm leading-relaxed text-foreground cursor-pointer">
                        I agree to the{" "}
                        <a href="#" className="text-accent hover:underline font-medium">
                          terms and conditions
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-accent hover:underline font-medium">
                          privacy policy
                        </a>
                        . I understand that F.B/c AI will use my information to provide personalized consultation services.
                      </Label>
                    </div>
                    {errors.terms && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-destructive mt-2 ml-6"
                      >
                        {errors.terms}
                      </motion.p>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="bg-accent/5 rounded-xl p-4 border border-accent/20">
                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-accent" />
                      Your Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{formData.email}</span>
                      </div>
                      {formData.company && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Company:</span>
                          <span className="font-medium">{formData.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-8 gap-3">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 rounded-xl border-border/30 hover:bg-muted/50"
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                )}
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    onClick={handleNext}
                    className={cn(
                      "w-full h-12 rounded-xl font-medium transition-all duration-300",
                      "bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80",
                      "shadow-lg hover:shadow-xl text-accent-foreground",
                      "flex items-center justify-center gap-2"
                    )}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Setting up...
                      </>
                    ) : currentStep === 3 ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Start Consultation
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-accent/20 rounded-full blur-sm" />
          <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-primary/20 rounded-full blur-sm" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
