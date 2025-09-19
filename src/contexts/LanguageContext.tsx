'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Language, useTranslation, TranslationKey } from '@/lib/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const { t } = useTranslation(language)

  useEffect(() => {
    // Load language from localStorage or user preferences
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && ['en', 'so', 'es', 'fr'].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    }

    // Listen for language changes from settings
    const handleLanguageChange = (event: CustomEvent) => {
      const newLanguage = event.detail as Language
      if (['en', 'so', 'es', 'fr'].includes(newLanguage)) {
        setLanguageState(newLanguage)
      }
    }

    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener)
  }, [])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}