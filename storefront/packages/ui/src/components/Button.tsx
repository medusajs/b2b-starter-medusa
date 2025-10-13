import React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Visual style variant following Medusa UI patterns */
    variant?: 'primary' | 'secondary' | 'transparent' | 'danger';
    /** Size of the button following Medusa UI scale */
    size?: 'small' | 'base' | 'large' | 'xlarge';
    /** Shows loading spinner and disables interaction */
    isLoading?: boolean;
    /** 
     * Change the default rendered element for the one passed as a child.
     * Follows Radix Primitives Slot pattern used by Medusa UI
     */
    asChild?: boolean;
};

/**
 * Button Component
 * 
 * Based on native HTML button element, following Medusa UI design system.
 * Built with Radix-like patterns for consistency.
 * 
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary" size="base">
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
        variant = 'primary',
        size = 'base',
        isLoading = false,
        asChild = false,
        children,
        className = '',
        disabled,
        type = 'button',
        ...props
    }, ref) => {
        // Base styles following Medusa UI principles
        const base = 'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-md';

        // Variants aligned with Medusa UI (primary, secondary, transparent, danger)
        const variants: Record<string, string> = {
            primary: 'bg-yellow-600 text-white hover:bg-yellow-700 focus-visible:ring-yellow-500',
            secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400',
            transparent: 'bg-transparent text-gray-900 hover:bg-gray-100 focus-visible:ring-gray-400',
            danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
        };

        // Size scale matching Medusa UI (small, base, large, xlarge)
        const sizes: Record<string, string> = {
            small: 'h-8 px-3 text-sm',
            base: 'h-10 px-4 text-base',
            large: 'h-12 px-6 text-lg',
            xlarge: 'h-14 px-8 text-xl'
        };

        const classes = [
            base,
            variants[variant],
            sizes[size],
            className
        ].filter(Boolean).join(' ');

        // Note: asChild pattern would require Slot from @radix-ui/react-slot
        // For now, we render as button (can be extended later)
        if (asChild) {
            console.warn('Button: asChild prop requires @radix-ui/react-slot implementation');
        }

        return (
            <button
                ref={ref}
                type={type}
                className={classes}
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

export default Button;
