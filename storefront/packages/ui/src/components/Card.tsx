import React from 'react';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'outlined' | 'elevated';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
};

/**
 * Card component
 * 
 * Container component for grouping related content
 * 
 * @example
 * ```tsx
 * <Card variant="elevated" padding="md">
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ variant = 'default', padding = 'md', hover = false, children, className = '', ...props }, ref) => {
        const base = 'rounded-lg transition-all duration-200';

        const variants: Record<string, string> = {
            default: 'bg-white border border-gray-200',
            outlined: 'bg-transparent border-2 border-gray-300',
            elevated: 'bg-white shadow-md hover:shadow-lg'
        };

        const paddings: Record<string, string> = {
            none: '',
            sm: 'p-3',
            md: 'p-4',
            lg: 'p-6'
        };

        const hoverClass = hover ? 'hover:border-yellow-500 hover:shadow-md cursor-pointer' : '';

        const classes = [
            base,
            variants[variant],
            paddings[padding],
            hoverClass,
            className
        ].filter(Boolean).join(' ');

        return (
            <div ref={ref} className={classes} {...props}>
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export default Card;
