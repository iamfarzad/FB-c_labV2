import type React from "react"
import type { Metadata } from "next"
import { inter, rajdhani, spaceMono, montserrat } from "@/lib/fonts"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import ClientLayout from "./ClientLayout"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: {
    default: "F.B/c AI - Advanced AI Solutions & Consulting",
    template: "%s | F.B/c AI",
  },
  description:
    "Transform your business with cutting-edge AI solutions. Expert consulting, custom AI development, and innovative automation tools.",
  keywords: [
    "AI consulting",
    "artificial intelligence",
    "machine learning",
    "business automation",
    "AI development",
    "digital transformation",
  ],
  authors: [{ name: "Farzad Bayat", url: "https://fbc-ai.com" }],
  creator: "Farzad Bayat",
  publisher: "F.B/c AI",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fbc-ai.com",
    siteName: "F.B/c AI",
    title: "F.B/c AI - Advanced AI Solutions & Consulting",
    description:
      "Transform your business with cutting-edge AI solutions. Expert consulting, custom AI development, and innovative automation tools.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "F.B/c AI - Advanced AI Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "F.B/c AI - Advanced AI Solutions & Consulting",
    description:
      "Transform your business with cutting-edge AI solutions. Expert consulting, custom AI development, and innovative automation tools.",
    images: ["/og-image.jpg"],
    creator: "@farzadbayat",
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://fbc-ai.com",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${rajdhani.variable} ${spaceMono.variable} ${montserrat.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>
            <ClientLayout>{children}</ClientLayout>
          </Suspense>
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
