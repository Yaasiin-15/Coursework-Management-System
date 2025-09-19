'use client'

import React from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { TranslationKey } from '@/lib/translations'

export function useTranslations() {
    const { t, language } = useLanguage()

    return {
        t: (key: TranslationKey) => t(key),
        language,
        isRTL: false, // RTL support can be added later for Arabic
    }
}

// For components that need to be translation-aware
export function withTranslations<T extends object>(
    Component: React.ComponentType<T>
) {
    return function TranslatedComponent(props: T) {
        const translations = useTranslations()
        return React.createElement(Component, { ...props, ...translations })
    }
}