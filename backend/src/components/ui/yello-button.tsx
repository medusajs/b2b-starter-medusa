/**
 * 🎨 Yello Button Component
 * Exemplo de uso do Medusa UI personalizado com o gradiente Yello
 */

import React from "react"
import { Button } from "@medusajs/ui"
import type { ButtonProps } from "@medusajs/ui"

interface YelloButtonProps extends Omit<ButtonProps, 'variant'> {
    variant?: 'gradient' | 'outline' | 'ghost' | 'text'
    children: React.ReactNode
}

/**
 * Botão personalizado com o gradiente da Yello Solar Hub
 * 
 * @example
 * ```tsx
 * // Botão com gradiente preenchido
 * <YelloButton variant="gradient">
 *   Solicitar Orçamento
 * </YelloButton>
 * 
 * // Botão com borda gradiente
 * <YelloButton variant="outline">
 *   Ver Detalhes
 * </YelloButton>
 * ```
 */
export function YelloButton({
    variant = 'gradient',
    children,
    className = '',
    ...props
}: YelloButtonProps) {
    const variantClasses = {
        gradient: 'medusa-button-primary',
        outline: 'medusa-button-secondary',
        ghost: 'hover-gradient-yello',
        text: 'text-gradient-yello hover:opacity-80'
    }

    return (
        <Button
            {...props}
            className={`${variantClasses[variant]} ${className}`}
        >
            {children}
        </Button>
    )
}

// Exemplo de uso em componente
export function YelloButtonExample() {
    return (
        <div className="space-y-4 p-8">
            <h2 className="text-2xl font-bold text-gradient-yello mb-6">
                Exemplos de Botões Yello
            </h2>

            {/* Gradient Fill */}
            <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700">
                    Gradient Fill (Primary)
                </h3>
                <YelloButton variant="gradient">
                    Solicitar Orçamento
                </YelloButton>
            </div>

            {/* Gradient Outline */}
            <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700">
                    Gradient Outline (Secondary)
                </h3>
                <YelloButton variant="outline">
                    Ver Produtos
                </YelloButton>
            </div>

            {/* Ghost Hover */}
            <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700">
                    Ghost (Hover Gradient)
                </h3>
                <YelloButton variant="ghost">
                    Saiba Mais
                </YelloButton>
            </div>

            {/* Text Gradient */}
            <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700">
                    Text Gradient
                </h3>
                <YelloButton variant="text">
                    Link Especial
                </YelloButton>
            </div>

            {/* With Icons */}
            <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700">
                    Com Ícones
                </h3>
                <div className="flex gap-3">
                    <YelloButton variant="gradient">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Adicionar
                    </YelloButton>

                    <YelloButton variant="outline">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Carrinho
                    </YelloButton>
                </div>
            </div>

            {/* Sizes */}
            <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700">
                    Tamanhos
                </h3>
                <div className="flex gap-3 items-center">
                    <YelloButton variant="gradient" size="small">
                        Pequeno
                    </YelloButton>
                    <YelloButton variant="gradient" size="base">
                        Médio (padrão)
                    </YelloButton>
                    <YelloButton variant="gradient" size="large">
                        Grande
                    </YelloButton>
                </div>
            </div>

            {/* States */}
            <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700">
                    Estados
                </h3>
                <div className="flex gap-3">
                    <YelloButton variant="gradient">
                        Normal
                    </YelloButton>
                    <YelloButton variant="gradient" disabled>
                        Desabilitado
                    </YelloButton>
                    <YelloButton variant="gradient" isLoading>
                        Carregando...
                    </YelloButton>
                </div>
            </div>
        </div>
    )
}

export default YelloButton
