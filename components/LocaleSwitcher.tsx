'use client'

import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Cookies from 'js-cookie'

const locales = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
]

export function LocaleSwitcher() {
  const router = useRouter()
  const { t } = useTranslation('common')
  const [isChanging, setIsChanging] = useState(false)

  const currentLocale = router.locale || 'en'
  const currentLocaleData = locales.find(locale => locale.code === currentLocale)

  const handleLocaleChange = async (newLocale: string) => {
    if (newLocale === currentLocale) return

    setIsChanging(true)
    
    try {
      // Set the locale preference in cookies
      Cookies.set('NEXT_LOCALE', newLocale, { expires: 365 })
      
      // Navigate to the same page with the new locale
      await router.push(router.asPath, router.asPath, { locale: newLocale })
    } catch (error) {
      console.error('Error changing locale:', error)
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 px-0"
          disabled={isChanging}
        >
          {isChanging ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <span className="sr-only">{t('language.selectLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => handleLocaleChange(locale.code)}
            className={`flex items-center gap-2 ${
              locale.code === currentLocale ? 'bg-accent' : ''
            }`}
          >
            <span className="text-lg">{locale.flag}</span>
            <span className="flex-1">{locale.name}</span>
            {locale.code === currentLocale && (
              <div className="h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
