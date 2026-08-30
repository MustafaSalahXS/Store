'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ARABIC_DICTIONARY, FRENCH_DICTIONARY, GERMAN_DICTIONARY } from './i18n-dictionary'

type Language = 'en' | 'ar' | 'fr' | 'de'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, fallback?: string) => string
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

        // Set document direction, lang attribute and Ramis Arabic styling
        if (typeof document !== 'undefined') {
          const isArabic = savedLanguage === 'ar'
          document.documentElement.lang = savedLanguage
          document.documentElement.dir = isArabic ? 'rtl' : 'ltr'
          if (isArabic) {
            document.body.classList.add('rtl')
          } else {
            document.body.classList.remove('rtl')
          }
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

      // Update document direction, lang attribute and Ramis Arabic styling
      if (typeof document !== 'undefined') {
        const isArabic = lang === 'ar'
        document.documentElement.lang = lang
        document.documentElement.dir = isArabic ? 'rtl' : 'ltr'
        if (isArabic) {
          document.body.classList.add('rtl')
        } else {
          document.body.classList.remove('rtl')
        }
      }
    } catch (error) {
      console.error('Error switching language:', error)
    }
  }

  // Translation function with dot notation and dictionary fallback support
  const t = (key: string, fallback?: string): string => {
    if (!key) return fallback || ''

    // 1. Try dot-notation lookup in loaded JSON translations
    const keys = key.split('.')
    let value: any = translations

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        value = undefined
        break
      }
    }

    if (typeof value === 'string' && value.trim() && value !== key) {
      return value
    }

    // 2. Multilingual dictionary fallback
    const normKey = key.trim().toLowerCase()
    const normFallback = fallback ? fallback.trim().toLowerCase() : ''
    const lastSegment = keys.length > 1 ? keys[keys.length - 1].trim().toLowerCase() : ''

    if (language === 'ar') {
      if (ARABIC_DICTIONARY[normKey]) return ARABIC_DICTIONARY[normKey]
      if (lastSegment && ARABIC_DICTIONARY[lastSegment]) return ARABIC_DICTIONARY[lastSegment]
      if (normFallback && ARABIC_DICTIONARY[normFallback]) return ARABIC_DICTIONARY[normFallback]
    } else if (language === 'fr') {
      if (FRENCH_DICTIONARY[normKey]) return FRENCH_DICTIONARY[normKey]
      if (lastSegment && FRENCH_DICTIONARY[lastSegment]) return FRENCH_DICTIONARY[lastSegment]
      if (normFallback && FRENCH_DICTIONARY[normFallback]) return FRENCH_DICTIONARY[normFallback]
    } else if (language === 'de') {
      if (GERMAN_DICTIONARY[normKey]) return GERMAN_DICTIONARY[normKey]
      if (lastSegment && GERMAN_DICTIONARY[lastSegment]) return GERMAN_DICTIONARY[lastSegment]
      if (normFallback && GERMAN_DICTIONARY[normFallback]) return GERMAN_DICTIONARY[normFallback]
    }

    if (fallback) return fallback

    // If key had dots and wasn't found, NEVER return the raw 'feed.categories.xxx' to the user!
    if (keys.length > 1) {
      const seg = keys[keys.length - 1].replace(/[-_]/g, ' ')
      return seg.charAt(0).toUpperCase() + seg.slice(1)
    }

    return key
  }

  const isRTL = language === 'ar'

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export function useTranslations() {
  const { t } = useLanguage()
  return t
}
