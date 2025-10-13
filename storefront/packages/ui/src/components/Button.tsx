"use client"; import React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import React, { forwardRef } from 'react'; import { cn } from '../utils/cn';

import { Button as MedusaButton } from '@medusajs/ui'; import { getComponentToken } from '../theme/token-utils';



export interface ButtonProps extends React.ComponentProps<typeof MedusaButton> { }const buttonVariants = cva(

    'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-md',

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
        {

            return <MedusaButton ref={ref} {...props} />; variants: {

            }); variant: {

                primary: 'bg-brand-primary-500 text-white hover:bg-brand-primary-600 focus-visible:ring-brand-primary-500 shadow-brand',

                    Button.displayName = 'Button'; secondary: 'bg-background-secondary text-text-primary hover:bg-background-tertiary focus-visible:ring-border-dark border border-border-default',

                        accent: 'bg-brand-accent-500 text-white hover:bg-brand-accent-600 focus-visible:ring-brand-accent-500',

export default Button; ghost: 'bg-transparent text-text-primary hover:bg-interactive-hover focus-visible:ring-border-dark',

                    danger: 'bg-status-error-500 text-white hover:bg-status-error-600 focus-visible:ring-status-error-500',
            },
size: {
    sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
            lg: 'h-12 px-6 text-lg',
                xl: 'h-14 px-8 text-xl',
            },
        },
defaultVariants: {
    variant: 'primary',
        size: 'md',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    /** Shows loading spinner and disables interaction */
    isLoading?: boolean;
    /**
     * Change the default rendered element for the one passed as a child.
     * Follows Radix Primitives Slot pattern used by Medusa UI
     */
    asChild?: boolean;
}

/**
 * Button Component
 *
 * Based on native HTML button element, following Medusa UI design system.
 * Built with Radix-like patterns for consistency and uses design tokens.
 *
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary" size="md">
 *   Save Changes
 * </Button>
 *
 * // Loading state
 * <Button isLoading variant="secondary">
 *   Processing...
 * </Button>
 *
 * // As link (requires asChild implementation)
 * <Button asChild>
 *   <a href="/products">View Products</a>
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        variant,
        size,
        isLoading = false,
        asChild = false,
        children,
        className,
        disabled,
        type = 'button',
        ...props
    }, ref) => {
        // Note: asChild pattern would require Slot from @radix-ui/react-slot
        // For now, we render as button (can be extended later)
        if (asChild) {
            console.warn('Button: asChild prop requires @radix-ui/react-slot implementation');
        }

        return (
            <button
                ref={ref}
                type={type}
                className={cn(buttonVariants({ variant, size, className }))}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
export default Button;