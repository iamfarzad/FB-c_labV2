import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export default function CollabLayout({ children }: { children: ReactNode }) {
  // Dedicated layout for the collab shell: no global header/footer
  return children as any
}

export const metadata: Metadata = {
  title: 'Collab',
  alternates: {
    canonical: '/collab',
  },
}


