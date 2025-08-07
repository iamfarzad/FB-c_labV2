"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, Languages, Check } from "@/lib/icon-mapping"
import { FbcIcon } from "@/fbc-logo-icon/components/fbc-icon"
import { FbcLogo } from "@/fbc-logo-icon/components/fbc-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/consulting", label: "Consulting" },
  { href: "/about", label: "About" },
  { href: "/workshop", label: "Workshop" },
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
    <nav className={cn("flex items-center gap-4 md:gap-6 text-sm", className)}>
      {navLinks.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "transition-all hover:text-foreground focus:text-foreground rounded px-2 py-1",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            pathname === href ? "text-primary" : "text-muted-foreground",
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
        <Link href="/" className="flex items-center gap-3">
          <FbcIcon className="w-8 h-8" />
          <FbcLogo className="text-lg" />
        </Link>
        <div className="hidden md:flex ml-10">
          <NavLinks />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <LanguageSelector />
          <ThemeToggle />
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
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
