import React from 'react';

/**
 * GradientDefs component
 *
 * Fornece definições de gradiente SVG reutilizáveis para uso com stroke-gradient-ysh
 * Adicione este componente no root do seu app ou layout para tornar os gradientes disponíveis globalmente
 *
 * @example
 * ```tsx
 * <GradientDefs />
 * <svg className="stroke-gradient-ysh">
 *   <circle cx="50" cy="50" r="40" strokeWidth="4" fill="none" />
 * </svg>
 * ```
 */
export const GradientDefs = () => {
    return (
        <svg className="ysh-gradient-defs" aria-hidden="true">
            <defs>
                {/* Linear gradient (diagonal) */}
                <linearGradient id="gradient-ysh" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>

                {/* Radial gradient */}
                <radialGradient id="gradient-ysh-radial" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                </radialGradient>
            </defs>
        </svg>
    );
};