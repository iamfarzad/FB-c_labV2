"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import type React from "react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/consulting", label: "Consulting" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

const Header: React.FC = () => {
  const pathname = usePathname()

  const NavLinks = ({ className }: { className?: string }) => (
    <nav className={cn("flex items-center gap-6 text-sm font-medium", className)}>
      {navLinks.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "transition-colors hover:text-foreground",
            pathname === href ? "text-primary" : "text-muted-foreground",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 mr-10">
          <Bot className="h-6 w-6 text-primary" />
          <span className="font-bold font-display tracking-wider">F.B/C</span>
        </Link>
        <div className="hidden md:flex">
          <NavLinks />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="p-4 mt-6">
                  <NavLinks className="flex-col items-start gap-y-4" />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
