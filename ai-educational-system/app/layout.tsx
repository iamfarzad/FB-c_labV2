import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ModuleProgressProvider } from "@/lib/use-module-progress"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Educational System",
  description: "Learn about LLMs and AI systems through visual, interactive experiences",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ModuleProgressProvider>
            <main className="min-h-screen">{children}</main>
          </ModuleProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

