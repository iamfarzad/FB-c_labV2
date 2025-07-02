import type React from "react"
import type { Metadata } from "next"
import { rajdhani, spaceMono, montserrat } from "@/lib/fonts"
import ClientLayout from "./ClientLayout"
import './globals.css'

export const metadata: Metadata = {
  title: "F.B/c AI - Consulting",
  description: "A beautiful liquid glass AI chat interface with voice and vision capabilities",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientLayout
      className={`${rajdhani.variable} ${spaceMono.variable} ${montserrat.variable}`}
    >
      {children}
    </ClientLayout>
  )
}
