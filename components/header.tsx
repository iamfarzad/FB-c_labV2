"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sun, Moon, Globe, ChevronDown, Menu, X, MessageSquare } from "lucide-react"

interface HeaderProps {
  theme: "light" | "dark"
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
  { name: "Services", href: "/services" },
  { name: "Workshop", href: "/workshop" },
  { name: "Contact", href: "/contact" },
]

export const Header: React.FC<HeaderProps> = ({ theme, onThemeToggle }) => {
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

  const headerBg =
    theme === "dark"
      ? "bg-[var(--color-gunmetal)] border-[var(--color-gunmetal-lighter)]"
      : "bg-white border-[var(--color-light-silver-darker)]"

  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"

  return (
    <header className={`sticky top-0 z-50 glassmorphism ${headerBg} border-b backdrop-blur-xl`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MessageSquare size={20} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold gradient-text">F.B/c AI</h1>
                <p className={`text-xs ${mutedTextColor} -mt-1`}>Intelligent Assistant</p>
              </div>
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
                    ? "text-[var(--color-orange-accent)]"
                    : `${textColor} hover:text-[var(--color-orange-accent)]`
                }`}
              >
                {item.name}
                {pathname === item.href && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] rounded-full" />
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
                className="flex items-center space-x-2 p-2 rounded-xl glassmorphism hover:surface-glow transition-all duration-300 text-[var(--text-primary)] group"
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
                <div className="absolute right-0 mt-2 w-48 glassmorphism rounded-xl shadow-2xl border border-[var(--glass-border)] slide-in">
                  <div className="py-2">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageSelect(language)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-all duration-200 ${
                          selectedLanguage.code === language.code
                            ? "bg-[var(--color-orange-accent)]/10 text-[var(--color-orange-accent)]"
                            : `${textColor} hover:bg-[var(--color-orange-accent)]/5 hover:text-[var(--color-orange-accent)]`
                        }`}
                      >
                        <span className="text-lg">{language.flag}</span>
                        <span className="font-medium">{language.name}</span>
                        {selectedLanguage.code === language.code && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-[var(--color-orange-accent)]" />
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
              className="p-2 rounded-xl glassmorphism hover:surface-glow transition-all duration-300 text-[var(--text-primary)] group"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon size={18} className="group-hover:rotate-12 transition-transform" />
              ) : (
                <Sun size={18} className="group-hover:rotate-12 transition-transform" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl glassmorphism hover:surface-glow transition-all duration-300 text-[var(--text-primary)] group"
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
                      ? "bg-[var(--color-orange-accent)]/10 text-[var(--color-orange-accent)]"
                      : `${textColor} hover:bg-[var(--color-orange-accent)]/5 hover:text-[var(--color-orange-accent)]`
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
