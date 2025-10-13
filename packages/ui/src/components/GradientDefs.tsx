import React from 'react';

/**
 * GradientDefs component - Yello Solar Hub Brand Gradients
 *
 * Fornece definições de gradiente SVG reutilizáveis baseados na identidade visual Yello.
 * Gradiente oficial: Amarelo (#FFCE00) → Laranja (#FF6600) → Magenta (#FF0066)
 * 
 * Adicione este componente no root do seu app ou layout para tornar os gradientes disponíveis globalmente.
 *
 * @example
 * ```tsx
 * // No layout root
 * <GradientDefs />
 * 
 * // Uso em SVG com stroke
 * <svg className="w-24 h-24">
 *   <circle 
 *     cx="50%" 
 *     cy="50%" 
 *     r="40%" 
 *     strokeWidth="4" 
 *     fill="none"
 *     stroke="url(#gradient-ysh-stroke)"
 *   />
 * </svg>
 * 
 * // Uso em SVG com fill
 * <svg className="w-24 h-24">
 *   <rect 
 *     width="100%" 
 *     height="100%" 
 *     fill="url(#gradient-ysh-linear)"
 *   />
 * </svg>
 * ```
 */
export const GradientDefs = () => {
    return (
        <svg 
            width="0" 
            height="0" 
            className="ysh-gradient-defs"
            aria-hidden="true"
        >
            <defs>
                {/* 
                    Gradiente Linear Vertical - Amarelo → Laranja → Magenta
                    Para uso em backgrounds, fills, etc.
                */}
                <linearGradient 
                    id="gradient-ysh-linear" 
                    x1="0%" 
                    y1="0%" 
                    x2="0%" 
                    y2="100%"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0%" stopColor="#FFCE00" />
                    <stop offset="34%" stopColor="#FF6600" />
                    <stop offset="50%" stopColor="#FF0066" />
                </linearGradient>

                {/* 
                    Gradiente Linear Diagonal - Amarelo → Laranja → Magenta
                    Para uso em elementos com stroke
                */}
                <linearGradient 
                    id="gradient-ysh-stroke" 
                    x1="0%" 
                    y1="0%" 
                    x2="100%" 
                    y2="100%"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0%" stopColor="#FFCE00" />
                    <stop offset="34%" stopColor="#FF6600" />
                    <stop offset="50%" stopColor="#FF0066" />
                </linearGradient>

                {/* 
                    Gradiente Radial - Amarelo centro → Magenta bordas
                    Para uso em círculos, logos, etc.
                */}
                <radialGradient 
                    id="gradient-ysh-radial" 
                    cx="50%" 
                    cy="50%" 
                    r="50%"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0%" stopColor="#FFCE00" />
                    <stop offset="50%" stopColor="#FF6600" />
                    <stop offset="100%" stopColor="#FF0066" />
                </radialGradient>

                {/* 
                    Gradiente Horizontal - Para botões e elementos horizontais
                */}
                <linearGradient 
                    id="gradient-ysh-horizontal" 
                    x1="0%" 
                    y1="0%" 
                    x2="100%" 
                    y2="0%"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0%" stopColor="#FFCE00" />
                    <stop offset="34%" stopColor="#FF6600" />
                    <stop offset="50%" stopColor="#FF0066" />
                </linearGradient>
            </defs>
        </svg>
    );
};