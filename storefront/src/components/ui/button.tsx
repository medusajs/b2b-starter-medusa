/**
 * Button Component (Simplified for Catalog)
 * Using Medusa UI Button as base
 */

import React from 'react'
import { Button as MedusaButton } from '@medusajs/ui'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'danger'
    size?: 'small' | 'base' | 'large'
    isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, variant = 'default', size = 'base', isLoading = false, ...props }, ref) => {
        // Map our variants to Medusa variants
        const medusaVariant = variant === 'default' ? 'primary' :
            variant === 'outline' ? 'secondary' :
                variant === 'danger' ? 'danger' :
                    'transparent'

        return (
            <MedusaButton
                ref={ref}
                variant={medusaVariant}
                size={size}
                isLoading={isLoading}
                {...props}
            >
                {children}
            </MedusaButton>
        )
    }
)
Button.displayName = 'Button'
