"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sun, Moon, Globe, ChevronDown, Menu, X, Video } from "lucide-react"
import { HeroAsciiSphere } from "./magicui/hero-ascii-sphere"
// Logo text
const LogoText = () => (
  <div className="flex flex-col">
    <span className="text-xl font-bold leading-tight">F.B/c</span>
    <span className="text-sm font-medium opacity-80">Consulting</span>
  </div>
)

interface HeaderProps {
  // theme prop is no longer needed as we'll use Tailwind's dark mode
  onThemeToggle: () => void
}

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
]

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Consulting", href: "/consulting" },
  { name: "Workshop", href: "/workshop" },
  { name: "Contact", href: "/contact" },
]

export const Header: React.FC<HeaderProps> = ({ onThemeToggle }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0])
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLanguageSelect = (language: (typeof languages)[0]) => {
    setSelectedLanguage(language)
    setIsLanguageDropdownOpen(false)
    // Here you would implement actual language switching logic
    console.log("Language changed to:", language.code)
  }

  // headerBg, textColor, mutedTextColor are removed. Styling will be done via Tailwind dark mode.
  // Assumed:
  // Light mode header: bg-white, border-light-silver-darker
  // Dark mode header: bg-gunmetal, border-gunmetal-lighter
  // Text: text-gunmetal (light), text-light-silver (dark) -> maps to text-foreground
  // Muted Text: text-gunmetal/90 (light), text-light-silver/90 (dark) -> maps to text-muted-foreground or text-foreground/90

  return (
    <header className="sticky top-0 z-50 glassmorphism bg-white dark:bg-gunmetal border-b border-light-silver-darker dark:border-gunmetal-lighter backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 relative">
              <HeroAsciiSphere />
            </div>
            <Link href="/">
              <LogoText />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  pathname === item.href
                    ? "text-orange-accent" // Use direct Tailwind class
                    : "text-foreground hover:text-orange-accent" // Use text-foreground
                }`}
              >
                {item.name}
                {pathname === item.href && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-accent to-orange-accent-light rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-xl glassmorphism hover:surface-glow transition-all duration-300 text-foreground group" // Use text-foreground
                aria-label="Select language"
              >
                <Globe size={18} className="group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline text-sm font-medium">{selectedLanguage.flag}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${isLanguageDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Language Dropdown */}
              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 glassmorphism rounded-xl shadow-2xl border border-border/50 slide-in"> {/* Use border-border/50 */}
                  <div className="py-2">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageSelect(language)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-all duration-200 ${
                          selectedLanguage.code === language.code
                            ? "bg-orange-accent/10 text-orange-accent" // Use direct Tailwind class
                            : "text-foreground hover:bg-orange-accent/5 hover:text-orange-accent" // Use text-foreground
                        }`}
                      >
                        <span className="text-lg">{language.flag}</span>
                        <span className="font-medium">{language.name}</span>
                        {selectedLanguage.code === language.code && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-orange-accent" /> // Use direct Tailwind class
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className="p-2 rounded-xl glassmorphism hover:surface-glow transition-all duration-300 text-foreground group" // Use text-foreground
              aria-label="Toggle theme"
            >
              {/* Icon display will be handled by the global theme state, not a prop here */}
              <Moon size={18} className="hidden dark:inline-block group-hover:rotate-12 transition-transform" />
              <Sun size={18} className="dark:hidden inline-block group-hover:rotate-12 transition-transform" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl glassmorphism hover:surface-glow transition-all duration-300 text-foreground group" // Use text-foreground
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X size={18} className="group-hover:rotate-90 transition-transform" />
              ) : (
                <Menu size={18} className="group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--glass-border)] slide-in">
            <nav className="py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                    pathname === item.href
                      ? "bg-orange-accent/10 text-orange-accent" // Use direct Tailwind class
                      : "text-foreground hover:bg-orange-accent/5 hover:text-orange-accent" // Use text-foreground
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
