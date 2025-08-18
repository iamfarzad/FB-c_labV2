"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, Languages, Check } from "@/lib/icon-mapping"
import { FbcIcon } from "@/components/ui/fbc-icon"
// Temporarily hide text logo; keep orb icon only
const FbcLogo = ({ className }: { className?: string }) => null as any
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/consulting", label: "Consulting" },
  { href: "/about", label: "About" },
  // Workshop now accessed via the sidebar in the collab shell
  { href: "/contact", label: "Contact" },
]

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' }
]

export default function Header() {
  const pathname = usePathname()
  const [currentLanguage, setCurrentLanguage] = useState('en')

  const LanguageSelector = () => (
    // Language selector temporarily disabled until translations are ready
    null
  )

  const NavLinks = ({ className }: { className?: string }) => (
    <nav className={cn("flex items-center gap-3 md:gap-4 text-sm", className)}>
      {navLinks.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "transition-colors hover:text-foreground focus:text-foreground rounded inline-flex items-center px-3 py-2 min-h-[44px]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            pathname === href ? "text-foreground" : "text-foreground/90",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-header">
      <div className="mx-auto w-full max-w-7xl px-2 sm:px-4 md:px-6 flex h-16 items-center">
        <Link href="/" className="flex items-center gap-3" aria-label="F.B/c Home">
          <FbcIcon className="w-8 h-8" />
          <FbcLogo className="text-lg" />
        </Link>
        <div className="hidden md:flex ml-10">
          <NavLinks />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <LanguageSelector />
          <div className="min-h-11 min-w-11 inline-flex items-center justify-center">
            <ThemeToggle />
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="min-h-11 min-w-11">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <div className="p-4 mt-6">
                  <NavLinks className="flex-col items-start gap-3" />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
