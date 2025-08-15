"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { usePathname } from "next/navigation"
import type React from "react"

export function GlobalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // On /collab, suppress global chrome but still render children
  if (pathname?.startsWith("/collab")) return <>{children}</>
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}


