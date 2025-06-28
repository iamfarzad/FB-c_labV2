'use client'

import { Layout } from '@/components/layout'
// import HeroEnhanced from '@/components/magicui/hero-enhanced'
import { ServicesHero } from '@/components/consulting/hero-section'
import { AIConsulting } from '@/components/consulting/ai-consulting'
import { Workshops } from '@/components/consulting/workshops'
import { Tools } from '@/components/consulting/tools'
import { Process } from '@/components/consulting/process'
import { useTheme } from 'next-themes'

export default function ConsultingPage() {
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
        {/* Hero Section with TextParticle */}
        <ServicesHero theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />

        {/* AI Consulting Section */}
        <AIConsulting theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />

        {/* Process Section */}
        <Process theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />

        {/* Tools Section */}
        <Tools theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />

        {/* Workshops Section */}
        <Workshops theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
      </div>
    </Layout>
  )
}
