import type React from "react"
import { Inter, Rajdhani, Space_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { DemoSessionProvider } from "@/components/demo-session-manager"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

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

export const metadata: Metadata = {
  title: {
    default: "AI Automation Consultant | Farzad Bayat | 10,000+ Hours Experience",
    template: "%s | F.B Consulting - AI That Actually Works"
  },
  description: "Expert AI consultant with 10,000+ hours experience. Custom AI automation, chatbots, and workflow optimization for businesses. No hype, just results that work.",
  keywords: [
    "AI consultant",
    "AI automation",
    "business automation",
    "AI chatbots", 
    "workflow optimization",
    "AI implementation",
    "machine learning consultant",
    "AI strategy",
    "custom AI solutions",
    "AI training workshops"
  ],
  authors: [{ name: "Farzad Bayat", url: "https://farzadbayat.com" }],
  creator: "Farzad Bayat",
  publisher: "F.B Consulting",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://farzadbayat.com",
    siteName: "F.B Consulting - AI Automation Expert",
    title: "AI Automation Consultant | Farzad Bayat | 10,000+ Hours Experience",
    description: "Expert AI consultant with 10,000+ hours experience. Custom AI automation, chatbots, and workflow optimization for businesses. No hype, just results that work.",
    images: [
      {
        url: "/placeholder.svg",
        width: 1200,
        height: 630,
        alt: "Farzad Bayat - AI Automation Consultant with 10,000+ Hours Experience"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Automation Consultant | Farzad Bayat | 10,000+ Hours Experience", 
    description: "Expert AI consultant with 10,000+ hours experience. Custom AI automation, chatbots, and workflow optimization for businesses.",
    images: ["/placeholder.svg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://farzadbayat.com",
  },
  category: "Technology",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Farzad Bayat",
              "jobTitle": "AI Automation Consultant",
              "description": "Expert AI consultant with 10,000+ hours experience in AI automation, chatbots, and workflow optimization",
              "url": "https://farzadbayat.com",
              "sameAs": [
                "https://linkedin.com/in/farzadbayat"
              ],
              "knowsAbout": [
                "Artificial Intelligence",
                "Machine Learning",
                "Business Automation",
                "Chatbot Development",
                "AI Implementation",
                "Workflow Optimization"
              ],
              "offers": {
                "@type": "Service",
                "name": "AI Consulting Services",
                "description": "Custom AI automation, chatbots, internal copilots, and team training"
              }
            })
          }}
        />
      </head>
      <body className={cn("font-sans antialiased", fontSans.variable, fontDisplay.variable, fontMono.variable)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <DemoSessionProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <Toaster />
          </DemoSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
