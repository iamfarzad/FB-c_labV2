import type React from "react"
import { cn } from "@/utils/cn"
import { fontSans } from "@/utils/fonts"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className={cn("min-h-screen bg-dark-900 font-sans antialiased text-gray-300", fontSans.variable)}>
        <div className="dark">{children}</div>
      </body>
    </html>
  )
}
