/**
 * Skip Links Component
 * WCAG 2.4.1 - Bypass Blocks
 * 
 * Provides keyboard users quick access to main content and navigation
 */

'use client'

export default function SkipLinks() {
    return (
        <div className="fixed top-0 left-0 z-[9999]">
            <a 
                href="#main-content" 
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-yellow-400 focus:text-gray-900 focus:font-semibold focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2"
            >
                Pular para conteúdo principal
            </a>
            <a 
                href="#navigation" 
                className="sr-only focus:not-sr-only focus:absolute focus:top-14 focus:left-2 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-yellow-400 focus:text-gray-900 focus:font-semibold focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2"
            >
                Pular para navegação
            </a>
        </div>
    )
}
