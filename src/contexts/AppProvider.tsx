'use client'

import React, { useEffect } from 'react'
import { ThemeProvider } from './ThemeContext'
import { LanguageProvider } from './LanguageContext'

interface AppProviderProps {
  children: React.ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  useEffect(() => {
    // Load user preferences from API when app starts
    const loadUserPreferences = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch('/api/user/preferences', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          const preferences = data.preferences

          // Apply theme
          if (preferences.theme) {
            localStorage.setItem('theme', preferences.theme)
            // Trigger theme update
            window.dispatchEvent(new CustomEvent('themeChange', { detail: preferences.theme }))
          }

          // Apply language
          if (preferences.language) {
            localStorage.setItem('language', preferences.language)
            // Trigger language update
            window.dispatchEvent(new CustomEvent('languageChange', { detail: preferences.language }))
          }
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error)
      }
    }

    loadUserPreferences()
  }, [])

  return (
    <ThemeProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  )
}