'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Language = 'en' | 'ar' | 'fr' | 'de'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface Translations {
  [key: string]: any
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [translations, setTranslations] = useState<Translations>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load translations on mount and when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true)
        
        // Check localStorage for saved language preference
        const savedLanguage = typeof window !== 'undefined' 
          ? (localStorage.getItem('language') as Language) || 'en'
          : 'en'
        
        setLanguageState(savedLanguage)

        // Load the appropriate translation file
        let data = {}
        try {
          const response = await fetch(`/locales/${savedLanguage}.json`)
          data = await response.json()
        } catch (e) {
          const response = await fetch('/locales/en.json')
          data = await response.json()
        }
        setTranslations(data)

        // Set document direction and lang attribute (Always LTR)
        if (typeof document !== 'undefined') {
          document.documentElement.lang = savedLanguage
          document.documentElement.dir = 'ltr'
          document.body.classList.remove('rtl')
        }
      } catch (error) {
        console.error('Error loading translations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTranslations()
  }, [])

  const setLanguage = async (lang: Language) => {
    try {
      // Save preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', lang)
      }

      // Load new translations
      const response = await fetch(`/locales/${lang}.json`)
      const data = await response.json()
      setTranslations(data)
      setLanguageState(lang)

      // Update document (Always LTR)
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang
        document.documentElement.dir = 'ltr'
        document.body.classList.remove('rtl')
      }
    } catch (error) {
      console.error('Error switching language:', error)
    }
  }

  // Translation function with dot notation support (e.g., 'common.home')
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL: false }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

// Convenience hook for just translations
export function useTranslations() {
  const { t } = useLanguage()
  return t
}
