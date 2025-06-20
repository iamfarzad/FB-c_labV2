"use client"

import { Carousel } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

// Define the type for logo items
interface LogoItem {
  name: string
  src: string
  width: number
  height: number
  className?: string
  href?: string
}

const Logos: LogoItem[] = [
  {
    name: "OpenAI",
    src: "/logos/openai.svg",
    width: 120,
    height: 40,
    className: "object-contain"
  },
  {
    name: "Claude",
    src: "/logos/claude.svg",
    width: 120,
    height: 40,
    className: "object-contain"
  },
  {
    name: "Google Gemini",
    src: "/logos/Google-gemini-icon.svg",
    width: 120,
    height: 40,
    className: "object-contain"
  },
  {
    name: "Mistral AI",
    src: "/logos/mistral-ai.svg",
    width: 120,
    height: 40,
    className: "object-contain"
  },
  {
    name: "Perplexity",
    src: "/logos/perplexity.svg",
    width: 120,
    height: 40,
    className: "object-contain"
  },
  {
    name: "Hugging Face",
    src: "/logos/hugging-face-icon.svg",
    width: 120,
    height: 40,
    className: "object-contain"
  },
  {
    name: "ElevenLabs",
    src: "/logos/ElevenLabs_Logo_03.svg",
    width: 120,
    height: 40,
    className: "object-contain"
  },
  {
    name: "GitHub Copilot",
    src: "/logos/github-copilot.svg",
    width: 120,
    height: 40,
    className: "object-contain"
  },
  {
    name: "XAI",
    src: "/logos/XAI_Logo.svg",
    width: 80,
    height: 40,
    className: "object-contain"
  },
  {
    name: "ElevenLabs Grant",
    src: "https://storage.googleapis.com/eleven-public-cdn/images/elevenlabs-grants-logo.png",
    width: 200,
    height: 40,
    className: "object-contain",
    href: "https://elevenlabs.io/text-to-speech"
  }
]

export function TechMarquee({ className }: { className?: string }) {
  return (
    <section className={cn("relative overflow-hidden py-16 bg-gradient-to-b from-[var(--color-gunmetal)] to-[var(--color-dark-gunmetal)] border-t border-[var(--color-orange-accent)]/20", className)}>
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-2xl font-bold md:text-3xl text-[var(--color-light-silver)]/90 font-tech tracking-tech-wide">
          POWERED BY CUTTING-EDGE AI
        </h2>
        <div className="max-w-6xl mx-auto">
          <Carousel autoPlay interval={2000} className="py-4">
            {Logos.map((logo, index) => (
              <div
                key={index}
                className="flex h-36 items-center justify-center px-6"
              >
                <div className="flex flex-col items-center justify-center space-y-2 group">
                  <div className="relative flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    {logo.href ? (
                      <a
                        href={logo.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center"
                      >
                        <img
                          src={logo.src}
                          alt={logo.name}
                          width={logo.width}
                          height={logo.height}
                          className={`h-12 w-auto opacity-80 hover:opacity-100 transition-opacity ${logo.className || ''}`}
                          style={{
                            filter: 'brightness(0) invert(1)'
                          }}
                          loading="lazy"
                        />
                      </a>
                    ) : (
                      <img
                        src={logo.src}
                        alt={logo.name}
                        width={logo.width}
                        height={logo.height}
                        className={`h-12 w-auto opacity-80 hover:opacity-100 transition-opacity ${logo.className || ''}`}
                        style={{
                          filter: 'brightness(0) invert(1)'
                        }}
                        loading="lazy"
                      />
                    )}
                  </div>
                  <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors text-center">
                    {logo.name}
                  </span>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  )
}
