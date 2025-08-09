"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type TeamType = "Non-technical" | "Product / Operations" | "Engineering"
type Goal = "Understand AI opportunities" | "Prototype a copilot" | "Automate a workflow" | "Upskill the team"
type Experience = "Beginner" | "Intermediate" | "Advanced"
type Delivery = "On-site" | "Remote"

export function WorkshopPersonalizer({ className }: { className?: string }) {
  const [teamType, setTeamType] = useState<TeamType>("Non-technical")
  const [goal, setGoal] = useState<Goal>("Understand AI opportunities")
  const [experience, setExperience] = useState<Experience>("Beginner")
  const [delivery, setDelivery] = useState<Delivery>("Remote")

  const plan = useMemo(() => {
    const format = experience === "Beginner"
      ? "3h fundamentals + 3h guided build"
      : experience === "Intermediate"
      ? "2h strategy + 4h hands-on build"
      : "1h architecture + 5h systems & integration"

    const modules = [
      goal === "Understand AI opportunities" ? "Identify high‑ROI processes" : "Quick opportunity scan",
      goal === "Prototype a copilot" ? "Copilot UX & prompt patterns" : "Prompting for reliability",
      goal === "Automate a workflow" ? "Workflow orchestration (APIs, webhooks)" : "LLM strengths & limits",
      teamType === "Engineering" ? "Integration, testing & observability" : "Change management & adoption",
    ]

    const outcomes = [
      goal === "Prototype a copilot" ? "Clickable copilot prototype" : "Personalized automation roadmap",
      goal === "Automate a workflow" ? "Working automation step (MVP)" : "Team playbook & next steps",
      experience === "Advanced" ? "Architecture diagram & handoff notes" : "ROI snapshot & rollout plan",
    ]

    return { format, modules, outcomes }
  }, [teamType, goal, experience])

  return (
    <div className={cn("grid gap-6 md:grid-cols-2", className)}>
      <div className="neu-card p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">Personalize Your Workshop</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Team type</label>
            <select
              className="fbc-business-select"
              value={teamType}
              onChange={(e) => setTeamType(e.target.value as TeamType)}
            >
              <option>Non-technical</option>
              <option>Product / Operations</option>
              <option>Engineering</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Primary goal</label>
            <select
              className="fbc-business-select"
              value={goal}
              onChange={(e) => setGoal(e.target.value as Goal)}
            >
              <option>Understand AI opportunities</option>
              <option>Prototype a copilot</option>
              <option>Automate a workflow</option>
              <option>Upskill the team</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Experience</label>
              <select
                className="fbc-business-select"
                value={experience}
                onChange={(e) => setExperience(e.target.value as Experience)}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delivery</label>
              <select
                className="fbc-business-select"
                value={delivery}
                onChange={(e) => setDelivery(e.target.value as Delivery)}
              >
                <option>On-site</option>
                <option>Remote</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="neu-card p-6">
        <h3 className="text-xl font-semibold text-primary mb-1">Your Tailored Outline</h3>
        <p className="text-sm text-muted-foreground mb-4">Format: {plan.format} • {delivery}</p>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Core modules</h4>
            <ul className="mt-2 list-disc list-inside text-muted-foreground space-y-1">
              {plan.modules.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium">Expected outcomes</h4>
            <ul className="mt-2 list-disc list-inside text-muted-foreground space-y-1">
              {plan.outcomes.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button asChild className="w-full">
            <a href="/workshop-waitlist">Join Workshop Waitlist</a>
          </Button>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <a href="/contact">Prefer 1:1? Book Consultation</a>
          </Button>
        </div>
      </div>
    </div>
  )
}