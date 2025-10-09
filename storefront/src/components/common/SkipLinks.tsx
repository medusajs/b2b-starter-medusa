/**
 * Skip Links Component
 * WCAG 2.4.1 - Bypass Blocks
 * 
 * Provides keyboard users quick access to main content and navigation
 */

'use client'

export default function SkipLinks() {
    return (
        <div className="skip-links">
            <a href="#main-content" className="skip-link">
                Pular para conteúdo principal
            </a>
            <a href="#navigation" className="skip-link">
                Pular para navegação
            </a>
        </div>
    )
}
