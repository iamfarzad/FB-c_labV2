"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, Bot, Languages, Check } from "lucide-react"
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline-block">
            {languages.find(lang => lang.code === currentLanguage)?.flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setCurrentLanguage(language.code)}
            className="gap-3"
          >
            <span className="text-lg">{language.flag}</span>
            <span className="flex-1">{language.name}</span>
            {currentLanguage === language.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const NavLinks = ({ className }: { className?: string }) => (
    <nav className={cn("flex items-center gap-6 text-sm", className)}>
      {navLinks.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "transition-all hover:text-foreground",
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
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <span className="font-bold uppercase font-display tracking-wider">F.B</span>
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
              <SheetContent side="right">
                <div className="p-4 mt-6">
                  <NavLinks className="flex-col items-start space-y-4" />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
