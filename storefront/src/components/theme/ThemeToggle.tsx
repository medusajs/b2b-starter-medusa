'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { clx } from '@medusajs/ui'

export function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Ler tema do localStorage ou preferência do sistema
        const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const initialTheme = stored || (systemDark ? 'dark' : 'light')
        setTheme(initialTheme)
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)

        // Atualizar DOM
        const html = document.documentElement
        if (newTheme === 'dark') {
            html.classList.add('dark')
            html.setAttribute('data-mode', 'dark')
        } else {
            html.classList.remove('dark')
            html.setAttribute('data-mode', 'light')
        }

        // Salvar no localStorage
        localStorage.setItem('theme', newTheme)
    }

    // Não renderizar no servidor para evitar hydration mismatch
    if (!mounted) {
        return (
            <button
                className="relative w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-200"
                aria-label="Toggle theme"
            >
                <div className="w-5 h-5" />
            </button>
        )
    }

    return (
        <button
            onClick={toggleTheme}
            className={clx(
                "relative w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200",
                "hover:scale-105 active:scale-95",
                theme === 'light'
                    ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                    : "bg-zinc-800 hover:bg-zinc-700 text-yellow-400"
            )}
            aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
        >
            {theme === 'light' ? (
                <Sun className="w-5 h-5 transition-transform duration-300 rotate-0" />
            ) : (
                <Moon className="w-5 h-5 transition-transform duration-300 rotate-0" />
            )}
        </button>
    )
}
