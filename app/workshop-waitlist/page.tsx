"use client"

import { useState } from "react"
import { PageHeader, PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Send, Users, Calendar, MapPin } from "lucide-react"
import Link from "next/link"

export default function WorkshopWaitlistPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    teamSize: "",
    location: "",
    interests: [] as string[],
    message: ""
  })
  const { toast } = useToast()

  const workshopTypes = [
    "AI Automation Basics",
    "Chatbot Development",
    "AI Implementation Strategy",
    "AI Tools & APIs",
    "Custom AI Solutions",
    "AI Ethics & Best Practices"
  ]

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interest]
        : prev.interests.filter(i => i !== interest)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/workshop-waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Successfully joined waitlist!",
          description: "You'll be notified when workshop dates are announced.",
        })
        setFormData({
          name: "",
          email: "",
          company: "",
          teamSize: "",
          location: "",
          interests: [],
          message: ""
        })
      } else {
        throw new Error('Failed to join waitlist')
      }
    } catch (error) {
      toast({
        title: "Failed to join waitlist",
        description: "Please try again or contact me directly at hello@farzadbayat.com",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <PageShell>
      <PageHeader
        title="Join AI Training Waitlist"
        subtitle="Be the first to know when AI workshops are available for your team."
      />
      
      <div className="mx-auto mt-8 max-w-2xl">
        <div className="mb-6">
          <Link 
            href="/workshop" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workshop Details
          </Link>
        </div>

        <Card className="neu-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  placeholder="Your company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamSize">Team Size</Label>
                <Input
                  id="teamSize"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleChange}
                  placeholder="e.g., 5-10 people"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Preferred Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Oslo, Remote, On-site"
              />
            </div>

            <div className="space-y-3">
              <Label>Workshop Interests (select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {workshopTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={formData.interests.includes(type)}
                      onCheckedChange={(checked) => handleInterestChange(type, !!checked)}
                    />
                    <Label htmlFor={type} className="text-sm font-normal">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Additional Information</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Tell me about your team's AI experience level, specific needs, or preferred timing..."
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Joining Waitlist...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Join AI Training Waitlist
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">Team Training</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">Flexible Scheduling</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">On-site or Remote</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  )
}