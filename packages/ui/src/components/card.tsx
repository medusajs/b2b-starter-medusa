/**
 * Card Component (Simplified for Catalog)
 * Using Medusa UI base components
 */

import React from 'react'
import clsx from 'clsx'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={clsx(
                    'bg-ui-bg-base shadow-elevation-card-rest rounded-lg border border-ui-border-base',
                    'transition-shadow hover:shadow-elevation-card-hover',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
Card.displayName = 'Card'

export const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={clsx('p-6 pb-4', className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <h3
                ref={ref}
                className={clsx('text-lg font-semibold text-ui-fg-base', className)}
                {...props}
            >
                {children}
            </h3>
        )
    }
)
CardTitle.displayName = 'CardTitle'

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={clsx('text-sm text-ui-fg-subtle', className)}
                {...props}
            >
                {children}
            </p>
        )
    }
)
CardDescription.displayName = 'CardDescription'

export const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={clsx('p-6 pt-0', className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)
CardContent.displayName = 'CardContent'

export const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={clsx('p-6 pt-0', className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)
CardFooter.displayName = 'CardFooter'
