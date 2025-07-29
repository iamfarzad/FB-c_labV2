import Link from "next/link"
import { Button } from "./ui/button"
import { ThemeToggle } from "./theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

export function Header() {
  return (
    <header className="bg-dark-900 border-b border-dark-700">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-dark-700">
            <AvatarImage src="/placeholder.svg?width=40&height=40" alt="F.B/c Consulting" />
            <AvatarFallback className="bg-dark-700">FB</AvatarFallback>
          </Avatar>
          <span className="text-xl font-bold text-white">F.B/c Consulting</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            About
          </Link>
          <Link href="/#services" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Services
          </Link>
          <Link href="/#contact" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Contact
          </Link>
          <Link href="/chat" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Live Demo
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <Link href="/chat">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
