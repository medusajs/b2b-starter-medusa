import React from 'react';

export type SpinnerProps = React.HTMLAttributes<HTMLDivElement> & {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'white' | 'gray';
};

/**
 * Spinner component
 * 
 * Loading indicator with different sizes and colors
 * 
 * @example
 * ```tsx
 * <Spinner size="md" color="primary" />
 * ```
 */
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
    ({ size = 'md', color = 'primary', className = '', ...props }, ref) => {
        const sizes: Record<string, string> = {
            sm: 'h-4 w-4 border-2',
            md: 'h-8 w-8 border-2',
            lg: 'h-12 w-12 border-3',
            xl: 'h-16 w-16 border-4'
        };

        const colors: Record<string, string> = {
            primary: 'border-yellow-600 border-t-transparent',
            white: 'border-white border-t-transparent',
            gray: 'border-gray-600 border-t-transparent'
        };

        const classes = [
            'inline-block rounded-full animate-spin',
            sizes[size],
            colors[color],
            className
        ].filter(Boolean).join(' ');

        return (
            <div ref={ref} className={classes} role="status" aria-label="Loading" {...props}>
                <span className="sr-only">Loading...</span>
            </div>
        );
    }
);

Spinner.displayName = 'Spinner';

export default Spinner;
