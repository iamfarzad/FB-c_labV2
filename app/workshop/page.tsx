'use client'

import { Layout } from '@/components/layout'
import { WorkshopHero as HeroSection } from '@/components/workshop/hero-section'
import { WhatToExpect } from '@/components/workshop/what-to-expect'
import { ToolsSection } from '@/components/workshop/tools-section'
import { DeliverySection } from '@/components/workshop/delivery-section'
import { WhyItWorks } from '@/components/workshop/why-it-works'
import { CTASection as CtaSection } from '@/components/workshop/cta-section'
import { GridPattern } from '@/components/ui/grid-pattern'
import { useTheme } from 'next-themes'

export default function WorkshopPage() {
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
        <HeroSection />

        {/* What to Expect Section */}
        <WhatToExpect theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />

        {/* Tools Section */}
        <ToolsSection theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />

        {/* Delivery Options Section */}
        <DeliverySection theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />

        {/* Why It Works Section */}
        <WhyItWorks theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />

        {/* CTA Section */}
        <CtaSection theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
      </div>
    </Layout>
  )
}
