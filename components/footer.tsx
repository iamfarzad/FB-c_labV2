import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/20 bg-background/50 backdrop-blur-sm mt-auto">
      <div className="container py-6 md:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>&copy; {currentYear} F.B Consulting</span>
            <span className="hidden sm:inline">•</span>
            <Link href="/about" className="hover:text-foreground transition-colors focus:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded px-1">
              About
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/contact" className="hover:text-foreground transition-colors focus:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded px-1">
              Contact
            </Link>
          </div>
          
          <div className="flex items-center gap-4 text-muted-foreground">
            <a
              href="https://linkedin.com/in/farzadbayat"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors focus:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded px-1"
            >
              LinkedIn
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href="mailto:hello@farzadbayat.com"
              className="hover:text-foreground transition-colors focus:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded px-1"
            >
              hello@farzadbayat.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
