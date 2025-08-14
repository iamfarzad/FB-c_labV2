import type { ReactNode } from 'react'

export default function CollabLayout({ children }: { children: ReactNode }) {
  // Dedicated layout for the collab shell: no global header/footer
  return children as any
}


