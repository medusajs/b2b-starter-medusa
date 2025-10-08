/**
 * CategoryIcon Component
 * Ícones personalizados para cada categoria de produto do catálogo YSH
 */

import React from 'react'
import { clx } from '@medusajs/ui'

export type ProductCategory =
    | 'kits'
    | 'panels'
    | 'inverters'
    | 'batteries'
    | 'structures'
    | 'cables'
    | 'controllers'
    | 'ev_chargers'
    | 'stringboxes'
    | 'accessories'
    | 'posts'
    | 'others'

interface CategoryIconProps {
    category: ProductCategory
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
    showLabel?: boolean
}

const CATEGORY_CONFIG: Record<ProductCategory, {
    icon: string
    label: string
    color: string
    bgColor: string
}> = {
    kits: {
        icon: '📦',
        label: 'Kits Solares',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
    },
    panels: {
        icon: '☀️',
        label: 'Módulos Fotovoltaicos',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
    },
    inverters: {
        icon: '⚡',
        label: 'Inversores',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
    },
    batteries: {
        icon: '🔋',
        label: 'Baterias',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
    },
    structures: {
        icon: '🏗️',
        label: 'Estruturas',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
    },
    cables: {
        icon: '🔌',
        label: 'Cabos',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
    },
    controllers: {
        icon: '🎛️',
        label: 'Controladores',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100'
    },
    ev_chargers: {
        icon: '🚗',
        label: 'Carregadores EV',
        color: 'text-teal-600',
        bgColor: 'bg-teal-100'
    },
    stringboxes: {
        icon: '📊',
        label: 'String Boxes',
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-100'
    },
    accessories: {
        icon: '🔧',
        label: 'Acessórios',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100'
    },
    posts: {
        icon: '🏛️',
        label: 'Postes',
        color: 'text-stone-600',
        bgColor: 'bg-stone-100'
    },
    others: {
        icon: '📋',
        label: 'Outros',
        color: 'text-slate-600',
        bgColor: 'bg-slate-100'
    }
}

const SIZE_CLASSES = {
    sm: {
        wrapper: 'w-6 h-6',
        icon: 'text-xs',
        label: 'text-xs'
    },
    md: {
        wrapper: 'w-8 h-8',
        icon: 'text-sm',
        label: 'text-sm'
    },
    lg: {
        wrapper: 'w-12 h-12',
        icon: 'text-lg',
        label: 'text-base'
    },
    xl: {
        wrapper: 'w-16 h-16',
        icon: 'text-2xl',
        label: 'text-lg'
    }
}

export const CategoryIcon = ({
    category,
    size = 'md',
    className,
    showLabel = false
}: CategoryIconProps) => {
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.others
    const sizeClasses = SIZE_CLASSES[size]

    if (showLabel) {
        return (
            <div className={clx('flex items-center gap-2', className)}>
                <div className={clx(
                    'rounded-full flex items-center justify-center shadow-sm',
                    sizeClasses.wrapper,
                    config.bgColor
                )}>
                    <span className={sizeClasses.icon}>{config.icon}</span>
                </div>
                <span className={clx('font-medium', config.color, sizeClasses.label)}>
                    {config.label}
                </span>
            </div>
        )
    }

    return (
        <div
            className={clx(
                'rounded-full flex items-center justify-center shadow-sm',
                sizeClasses.wrapper,
                config.bgColor,
                className
            )}
            title={config.label}
        >
            <span className={sizeClasses.icon}>{config.icon}</span>
        </div>
    )
}

/**
 * CategoryBadge - Badge com ícone e label para categorias
 */
export const CategoryBadge = ({
    category,
    className
}: {
    category: ProductCategory
    className?: string
}) => {
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.others

    return (
        <div className={clx(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
            config.bgColor,
            config.color,
            className
        )}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </div>
    )
}

/**
 * Hook para obter informações de categoria
 */
export const useCategoryInfo = (category: ProductCategory) => {
    return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.others
}

export default CategoryIcon
