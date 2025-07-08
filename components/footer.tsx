import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
        <p className="text-sm text-muted-foreground">&copy; {currentYear} F.B Consulting. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
            Contact
          </Link>
          <span className="text-muted-foreground">|</span>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  )
}
