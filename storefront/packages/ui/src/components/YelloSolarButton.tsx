import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';
import { Button } from './Button';

const yelloSolarButtonVariants = cva('', {
    variants: {
        variant: {
            default: 'bg-gradient-to-r from-brand-primary-500 to-brand-secondary-500 hover:from-brand-primary-600 hover:to-brand-secondary-600 text-white shadow-brand border-0',
            outline: 'border-2 border-brand-primary-500 bg-transparent text-brand-primary-700 hover:bg-brand-primary-50 shadow-brand-sm',
            stroke: 'bg-transparent border border-brand-primary-300 text-brand-primary-700 hover:bg-brand-primary-50 hover:border-brand-primary-400',
            ghost: 'bg-transparent text-brand-primary-700 hover:bg-brand-primary-50',
        },
        size: {
            default: 'h-12 px-8 text-base',
            sm: 'h-9 px-6 text-sm',
            lg: 'h-14 px-10 text-lg',
            icon: 'h-12 w-12',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});

export interface YelloSolarButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof yelloSolarButtonVariants> {
    /** Shows loading spinner and disables interaction */
    isLoading?: boolean;
    /**
     * Change the default rendered element for the one passed as a child.
     * Follows Radix Primitives Slot pattern used by Medusa UI
     */
    asChild?: boolean;
}

/**
 * Yello Solar Button Component
 *
 * Specialized button component for Yello Solar Hub with brand-specific styling
 * and enhanced visual effects using the design system tokens.
 *
 * @example
 * ```tsx
 * // Primary brand button
 * <YelloSolarButton variant="default">
 *   Começar Agora
 * </YelloSolarButton>
 *
 * // Outline style
 * <YelloSolarButton variant="outline">
 *   Saiba Mais
 * </YelloSolarButton>
 *
 * // Stroke style
 * <YelloSolarButton variant="stroke">
 *   Explorar
 * </YelloSolarButton>
 * ```
 */
export const YelloSolarButton = React.forwardRef<HTMLButtonElement, YelloSolarButtonProps>(
    ({ variant, size, className, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                className={cn(yelloSolarButtonVariants({ variant, size, className }))}
                {...props}
            />
        );
    }
);

YelloSolarButton.displayName = 'YelloSolarButton';

export { YelloSolarButton, yelloSolarButtonVariants };