import type React from "react"
import type { Metadata } from "next"
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const fontDisplay = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "F.B/C Design System",
  description: "A minimal, modern, and mature design system.",
  openGraph: {
    title: "F.B/C Design System",
    description: "A minimal, modern, and mature design system.",
    url: "https://fbc.dev",
    siteName: "F.B/C",
    images: [
      {
        url: "/placeholder.svg?width=1200&height=630",
        width: 1200,
        height: 630,
        alt: "F.B/C Design System",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "F.B/C Design System",
    description: "A minimal, modern, and mature design system.",
    images: ["/placeholder.svg?width=1200&height=630"],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontDisplay.variable,
          fontMono.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
