'use client'

import { useLanguage } from '@/lib/language-context'
import { Globe, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇪🇬' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
]

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLang = languages.find(l => l.code === language) || languages[0]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-3 bg-stone-900 text-stone-50 rounded-xl hover:bg-stone-800 transition-all shadow-xl"
        aria-label="Select language"
      >
        <Globe className="w-5 h-5 text-gold-500" />
        <span className="font-jost text-[10px] font-bold uppercase tracking-widest hidden md:block">
          {currentLang.code}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-56 bg-white border border-stone-100 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden z-[100] p-3"
          >
            <div className="space-y-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as any)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                    language === lang.code 
                      ? 'bg-stone-50 text-stone-900 border border-stone-100' 
                      : 'hover:bg-stone-50 text-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{lang.flag}</span>
                    <span className="font-jost text-[10px] font-bold uppercase tracking-widest">{lang.name}</span>
                  </div>
                  {language === lang.code && <Check className="w-4 h-4 text-gold-500" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
