import React from 'react';

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
    rounded?: boolean;
};

/**
 * Badge component
 * 
 * Small status indicator or label
 * 
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning" size="sm">Pending</Badge>
 * ```
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ variant = 'default', size = 'md', rounded = false, children, className = '', ...props }, ref) => {
        const base = 'inline-flex items-center font-medium';

        const variants: Record<string, string> = {
            default: 'bg-gray-100 text-gray-800',
            success: 'bg-green-100 text-green-800',
            warning: 'bg-yellow-100 text-yellow-800',
            error: 'bg-red-100 text-red-800',
            info: 'bg-blue-100 text-blue-800'
        };

        const sizes: Record<string, string> = {
            sm: 'px-2 py-0.5 text-xs',
            md: 'px-2.5 py-1 text-sm',
            lg: 'px-3 py-1.5 text-base'
        };

        const roundedClass = rounded ? 'rounded-full' : 'rounded';

        const classes = [
            base,
            variants[variant],
            sizes[size],
            roundedClass,
            className
        ].filter(Boolean).join(' ');

        return (
            <span ref={ref} className={classes} {...props}>
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';

export default Badge;
