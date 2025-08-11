'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  )
}