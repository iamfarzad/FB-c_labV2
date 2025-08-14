"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { usePathname } from "next/navigation"

export function GlobalChrome() {
  const pathname = usePathname()
  if (pathname?.startsWith("/collab")) return null
  return (
    <>
      <Header />
      <Footer />
    </>
  )
}


