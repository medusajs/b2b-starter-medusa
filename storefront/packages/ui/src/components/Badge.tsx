"use client"; import React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import React, { forwardRef } from 'react'; import { cn } from '../utils/cn';

import { Badge as MedusaBadge } from '@medusajs/ui';

const badgeVariants = cva(

export interface BadgeProps extends React.ComponentProps<typeof MedusaBadge> { }    'inline-flex items-center justify-center font-medium',

{

    const Badge = forwardRef<HTMLSpanElement, BadgeProps>((props, ref) => {
        variants: {

            return <MedusaBadge ref={ref} {...props} />; color: {

            }); success: 'bg-status-success-100 text-status-success-800',

    error: 'bg-status-error-100 text-status-error-800',

    Badge.displayName = 'Badge'; warning: 'bg-status-warning-100 text-status-warning-800',

    info: 'bg-status-info-100 text-status-info-800',

    export default Badge; neutral: 'bg-background-secondary text-text-secondary',

    brand: 'bg-brand-primary-100 text-brand-primary-800',
},
    size: {
    xs: 'h-4 px-1.5 text-xs',
        sm: 'h-5 px-2 text-xs',
            md: 'h-6 px-2 text-sm',
                lg: 'h-7 px-2.5 text-sm',
                    xl: 'h-8 px-3 text-base',
            },
rounded: {
    base: 'rounded-md',
        full: 'rounded-full',
            },
        },
defaultVariants: {
    color: 'neutral',
        size: 'md',
            rounded: 'base',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    /**
     * Change the default rendered element for the one passed as a child.
     * Follows Radix Primitives Slot pattern used by Medusa UI
     */
    asChild?: boolean;
}

/**
 * Badge Component
 *
 * Based on div element, following Medusa UI design system.
 * Used for labels, tags, and status indicators.
 * Now uses design tokens and follows Medusa UI patterns.
 *
 * @example
 * ```tsx
 * // Color variants
 * <Badge color="success">Active</Badge>
 * <Badge color="error">Error</Badge>
 * <Badge color="warning">Warning</Badge>
 *
 * // Sizes
 * <Badge size="sm">Small</Badge>
 * <Badge size="md">Medium</Badge>
 * <Badge size="lg">Large</Badge>
 *
 * // Rounded variants
 * <Badge rounded="base">Base Rounded</Badge>
 * <Badge rounded="full">Pill Shape</Badge>
 * ```
 */
export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({
        color,
        size,
        rounded,
        asChild = false,
        children,
        className,
        ...props
    }, ref) => {
        // Note: asChild pattern would require Slot from @radix-ui/react-slot
        if (asChild) {
            console.warn('Badge: asChild prop requires @radix-ui/react-slot implementation');
        }

        return (
            <div
                ref={ref}
                className={cn(badgeVariants({ color, size, rounded, className }))}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
export default Badge;
