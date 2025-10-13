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
        <linearGradient id="ysh-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'var(--ysh-start)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'var(--ysh-end)', stopOpacity: 1 }} />
        </linearGradient>
        
        {/* Radial gradient (center out) */}
        <radialGradient id="ysh-gradient-radial" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: 'var(--ysh-start)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'var(--ysh-end)', stopOpacity: 1 }} />
        </radialGradient>
        
        {/* Sunburst gradient (like the logo) */}
        <radialGradient id="ysh-gradient-sunburst" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
          <stop offset="30%" style={{ stopColor: 'var(--ysh-start)', stopOpacity: 1 }} />
          <stop offset="70%" style={{ stopColor: 'var(--ysh-end)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FF1744', stopOpacity: 1 }} />
        </radialGradient>
      </defs>
    </svg>
  );
};

export default GradientDefs;
