/**
 * Badge Component (Simplified for Catalog)
 * Using Medusa UI styling
 */

import React from 'react'
import clsx from 'clsx'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode
    variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger'
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, children, variant = 'default', ...props }, ref) => {
        const variantClasses = {
            default: 'bg-ui-tag-blue-bg text-ui-tag-blue-text border-ui-tag-blue-border',
            secondary: 'bg-ui-bg-subtle text-ui-fg-subtle border-ui-border-base',
            outline: 'bg-transparent text-ui-fg-base border-ui-border-base',
            success: 'bg-ui-tag-green-bg text-ui-tag-green-text border-ui-tag-green-border',
            warning: 'bg-ui-tag-orange-bg text-ui-tag-orange-text border-ui-tag-orange-border',
            danger: 'bg-ui-tag-red-bg text-ui-tag-red-text border-ui-tag-red-border',
        }

        return (
            <span
                ref={ref}
                className={clsx(
                    'inline-flex items-center rounded-md border px-2.5 py-0.5',
                    'text-xs font-medium transition-colors',
                    variantClasses[variant],
                    className
                )}
                {...props}
            >
                {children}
            </span>
        )
    }
)
Badge.displayName = 'Badge'
