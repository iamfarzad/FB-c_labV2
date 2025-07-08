import type React from "react"
import { Rajdhani, Space_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"
import { cn } from "@/lib/utils"

const fontDisplay = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
})

const fontMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
})

export const metadata = {
  title: "F.B/C AI - AI Automation Consulting",
  description: "Professional AI automation consulting and implementation services",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased", fontDisplay.variable, fontMono.variable)}>
        <ErrorBoundary
          onError={(error, errorInfo) => {
            // Log to monitoring service in production
            console.error("Global error:", error, errorInfo)
          }}
        >
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm font-mono">
              <Header />
              <main className="flex-1">
                <ErrorBoundary>{children}</ErrorBoundary>
              </main>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
