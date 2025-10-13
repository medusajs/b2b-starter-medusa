import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const cardVariants = cva(
    'rounded-lg transition-all duration-200',
    {
        variants: {
            variant: {
                default: 'bg-background-primary border border-border-default',
                outlined: 'bg-transparent border-2 border-border-medium',
                elevated: 'bg-background-primary shadow-md hover:shadow-lg',
            },
            padding: {
                none: '',
                sm: 'p-3',
                md: 'p-4',
                lg: 'p-6',
            },
            hover: {
                true: 'hover:border-brand-primary-500 hover:shadow-md cursor-pointer',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'default',
            padding: 'md',
            hover: false,
        },
    }
);

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> { }

/**
 * Card component
 *
 * Container component for grouping related content
 * Now uses design tokens and follows Medusa UI patterns
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
    ({ variant, padding, hover, children, className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(cardVariants({ variant, padding, hover, className }))}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export { Card, cardVariants };
export default Card;
