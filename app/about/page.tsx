'use client'

import { Layout } from '@/components/layout'
import { AboutHero as HeroSection } from '@/components/about/hero-section'
import { StorySection } from '@/components/about/story-section'
import { WhySection } from '@/components/about/why-section'
import { SkillsSection } from '@/components/about/skills-section'
import { ProjectsSection } from '@/components/about/projects-section'
import { TestimonialsSection } from '@/components/about/testimonials-section'
import { CTASection as CtaSection } from '@/components/about/cta-section'
import { useTheme } from 'next-themes'

export default function AboutPage() {
  const { resolvedTheme } = useTheme()

  return (
    <Layout>
      <div
        className='min-h-screen'
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          paddingTop: '80px' // Adjust based on header height
        }}
      >
        {/* Hero Section */}
        <HeroSection theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />

        {/* Story Section */}
        <StorySection theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />

        {/* Why I Do This Work Section */}
        <WhySection theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />

        {/* Skills Section */}
        <SkillsSection theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />

        {/* Projects Section */}
        <ProjectsSection theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />

        {/* Testimonials Section */}
        <TestimonialsSection theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />

        {/* CTA Section */}
        <CtaSection theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
      </div>
    </Layout>
  )
}
