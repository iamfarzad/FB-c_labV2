import Link from "next/link"
import { Bot } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <span className="font-bold uppercase font-display tracking-wider">F.B/C</span>
        </div>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} F.B/C. All rights reserved.</p>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  )
}
