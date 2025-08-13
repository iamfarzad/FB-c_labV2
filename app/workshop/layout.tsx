import type { ReactNode } from 'react'
import { ModuleProgressProvider } from '@/hooks/workshop/use-module-progress'

export default function WorkshopLayout({ children }: { children: ReactNode }) {
  return (
    <ModuleProgressProvider>
      {children}
    </ModuleProgressProvider>
  )
}


