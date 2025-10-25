'use client'

import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

export function useTheme() {
    const [theme, setTheme] = useState<Theme>('light')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        // Ler tema salvo ou preferência do sistema
        const stored = localStorage.getItem('theme') as Theme | null
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const initialTheme = stored || (systemDark ? 'dark' : 'light')

        setTheme(initialTheme)
        applyTheme(initialTheme)
    }, [])

    const applyTheme = (newTheme: Theme) => {
        const html = document.documentElement

        if (newTheme === 'dark') {
            html.classList.add('dark')
            html.setAttribute('data-mode', 'dark')
        } else {
            html.classList.remove('dark')
            html.setAttribute('data-mode', 'light')
        }

        // Atualizar meta theme-color para mobile
        const metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#09090b' : '#ffffff')
        }
    }

    const toggleTheme = () => {
        const newTheme: Theme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        applyTheme(newTheme)
        localStorage.setItem('theme', newTheme)
    }

    const setThemeMode = (newTheme: Theme) => {
        setTheme(newTheme)
        applyTheme(newTheme)
        localStorage.setItem('theme', newTheme)
    }

    return {
        theme,
        toggleTheme,
        setTheme: setThemeMode,
        mounted,
    }
}
