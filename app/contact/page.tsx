"use client"

import { Layout } from '@/components/layout'
import { ContactSection } from '@/components/contact/contact-section'
import { useTheme } from 'next-themes'

export default function ContactPage() {
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
        <ContactSection theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
      </div>
    </Layout>
  )
}
