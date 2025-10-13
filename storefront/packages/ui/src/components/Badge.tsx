import React from 'react';

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
    /** Color variant following Medusa UI palette */
    color?: 'green' | 'red' | 'blue' | 'orange' | 'grey' | 'purple';
    /** Size following Medusa UI scale */
    size?: '2xsmall' | 'xsmall' | 'small' | 'base' | 'large';
    /** Border radius style */
    rounded?: 'base' | 'full';
    /** 
     * Change the default rendered element for the one passed as a child.
     * Follows Radix Primitives Slot pattern used by Medusa UI
     */
    asChild?: boolean;
};

/**
 * Badge Component
 * 
 * Based on div element, following Medusa UI design system.
 * Used for labels, tags, and status indicators.
 * 
 * @example
 * ```tsx
 * // Color variants
 * <Badge color="green">Active</Badge>
 * <Badge color="red">Error</Badge>
 * <Badge color="blue">Info</Badge>
 * 
 * // Sizes
 * <Badge size="small">Small</Badge>
 * <Badge size="base">Base</Badge>
 * <Badge size="large">Large</Badge>
 * 
 * // Rounded variants
 * <Badge rounded="base">Base Rounded</Badge>
 * <Badge rounded="full">Pill Shape</Badge>
 * ```
 */
export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({
        color = 'grey',
        size = 'base',
        rounded = 'base',
        asChild = false,
        children,
        className = '',
        ...props
    }, ref) => {
        // Base styles following Medusa UI principles
        const base = 'inline-flex items-center justify-center font-medium';

        // Color variants matching Medusa UI palette
        const colors: Record<string, string> = {
            green: 'bg-green-100 text-green-800',
            red: 'bg-red-100 text-red-800',
            blue: 'bg-blue-100 text-blue-800',
            orange: 'bg-orange-100 text-orange-800',
            grey: 'bg-gray-100 text-gray-800',
            purple: 'bg-purple-100 text-purple-800'
        };

        // Size scale matching Medusa UI (2xsmall through large)
        const sizes: Record<string, string> = {
            '2xsmall': 'h-4 px-1.5 text-xs',
            'xsmall': 'h-5 px-2 text-xs',
            'small': 'h-6 px-2 text-sm',
            'base': 'h-7 px-2.5 text-sm',
            'large': 'h-8 px-3 text-base'
        };

        // Rounded variants
        const roundedStyles: Record<string, string> = {
            base: 'rounded-md',
            full: 'rounded-full'
        };

        const classes = [
            base,
            colors[color],
            sizes[size],
            roundedStyles[rounded],
            className
        ].filter(Boolean).join(' ');

        // Note: asChild pattern would require Slot from @radix-ui/react-slot
        if (asChild) {
            console.warn('Badge: asChild prop requires @radix-ui/react-slot implementation');
        }

        return (
            <div ref={ref} className={classes} {...props}>
                {children}
            </div>
        );
    }
);

Badge.displayName = 'Badge';

export default Badge;
